import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodbClient";
import { auth } from "@/app/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("monir");

    const leads = await db
      .collection("leads")
      .find({ assignedAgent: "Unassigned" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, leads }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
