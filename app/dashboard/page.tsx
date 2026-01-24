import { redirect } from "next/navigation";
import { auth } from "../auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return;

  if ((session.user as any).role === "user") {
    redirect("/dashboard/user");
  }
  if ((session.user as any).role === "admin") {
    redirect("/dashboard/admin");
  }
  if ((session.user as any).role === "agent") {
    redirect("/dashboard/agents");
  }
  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <p>Role: {(session.user as any).role}</p>
    </div>
  );
}
