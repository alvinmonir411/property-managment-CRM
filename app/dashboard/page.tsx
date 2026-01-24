import { auth } from "../auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return <p>You must be logged in to see this.</p>;

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <p>Role: {(session.user as any).role}</p>
    </div>
  );
}
