import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: authHeader },
      }).catch(() => {});
    }

    const response = NextResponse.json({ message: "Successfully logged out" });
    response.cookies.set("refresh_token", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Logout failed" }, { status: 500 });
  }
}
