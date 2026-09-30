import { redirect } from "next/navigation";

export default function MyTicketsPage() {
  redirect("/profile?tab=tickets");
}
