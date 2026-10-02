import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pool } from "pg";

let pool: Pool | undefined;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.AUTH_DATABASE_URL,
      options: "-c search_path=public,auth",
      max: 5,
    });
  }
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const authHeaders = await headers();
    const session = await getAuth().api.getSession({ headers: authHeaders });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const db = getPool();

    // Verify caller has admin role in staff table
    const staffRes = await db.query(
      `SELECT role, enabled FROM staff WHERE user_id = $1`,
      [currentUserId]
    );

    const callerStaff = staffRes.rows[0];
    if (!callerStaff || callerStaff.role !== "admin" || !callerStaff.enabled) {
      return NextResponse.json(
        { error: "Forbidden: Administrator role required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, targetUserId, payload } = body;

    if (!action || !targetUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    switch (action) {
      case "get-details": {
        // Fetch target user from auth.user
        const userRes = await db.query(
          `SELECT id, name, email, "emailVerified", COALESCE("twoFactorEnabled", false) as "twoFactorEnabled", "createdAt" 
           FROM auth."user" WHERE id = $1`,
          [targetUserId]
        );

        if (userRes.rows.length === 0) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRes.rows[0];

        // Fetch staff role if any
        const targetStaffRes = await db.query(
          `SELECT role, enabled FROM staff WHERE user_id = $1`,
          [targetUserId]
        );
        const staff = targetStaffRes.rows[0] || null;

        // Fetch wallets
        const walletsRes = await db.query(
          `SELECT currency, balance_minor FROM wallet_accounts WHERE user_id = $1`,
          [targetUserId]
        );

        // Fetch total orders
        const ordersRes = await db.query(
          `SELECT count(*) as total_orders FROM orders WHERE user_id = $1`,
          [targetUserId]
        );

        return NextResponse.json({
          user,
          staff,
          role: staff && staff.enabled ? staff.role : "player",
          wallets: walletsRes.rows,
          totalOrders: Number(ordersRes.rows[0]?.total_orders || 0),
        });
      }

      case "update-role": {
        const { newRole } = payload;
        if (!["player", "reviewer", "admin"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        if (newRole === "player") {
          // Demote to player: delete or disable from staff
          await db.query(`DELETE FROM staff WHERE user_id = $1`, [targetUserId]);
        } else {
          // Promote to admin or reviewer
          await db.query(
            `INSERT INTO staff (user_id, role, enabled) 
             VALUES ($1, $2, true) 
             ON CONFLICT (user_id) 
             DO UPDATE SET role = EXCLUDED.role, enabled = true`,
            [targetUserId, newRole]
          );
        }

        // Record in audit log
        await db.query(
          `INSERT INTO audit_log (actor, action, resource, details) 
           VALUES ($1, 'staff.update_role', $2, $3)`,
          [currentUserId, targetUserId, JSON.stringify({ newRole })]
        );

        return NextResponse.json({ success: true, newRole });
      }

      case "toggle-verification": {
        const { verified } = payload;
        await db.query(
          `UPDATE auth."user" SET "emailVerified" = $1, "updatedAt" = now() WHERE id = $2`,
          [Boolean(verified), targetUserId]
        );

        await db.query(
          `INSERT INTO audit_log (actor, action, resource, details) 
           VALUES ($1, 'user.toggle_verified', $2, $3)`,
          [currentUserId, targetUserId, JSON.stringify({ verified: Boolean(verified) })]
        );

        return NextResponse.json({ success: true, emailVerified: Boolean(verified) });
      }

      case "reset-2fa": {
        await db.query(
          `UPDATE auth."user" SET "twoFactorEnabled" = false, "updatedAt" = now() WHERE id = $1`,
          [targetUserId]
        );

        await db.query(
          `DELETE FROM auth."twoFactor" WHERE "userId" = $1`,
          [targetUserId]
        );

        await db.query(
          `INSERT INTO audit_log (actor, action, resource, details) 
           VALUES ($1, 'user.reset_2fa', $2, '{}')`,
          [currentUserId, targetUserId]
        );

        return NextResponse.json({ success: true, twoFactorEnabled: false });
      }

      case "toggle-status": {
        const { enabled } = payload;
        // If the user has a staff record, toggle it
        await db.query(
          `UPDATE staff SET enabled = $1 WHERE user_id = $2`,
          [Boolean(enabled), targetUserId]
        );

        await db.query(
          `INSERT INTO audit_log (actor, action, resource, details) 
           VALUES ($1, 'staff.toggle_enabled', $2, $3)`,
          [currentUserId, targetUserId, JSON.stringify({ enabled: Boolean(enabled) })]
        );

        return NextResponse.json({ success: true, enabled: Boolean(enabled) });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin user action error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to perform user action" },
      { status: 500 }
    );
  }
}
