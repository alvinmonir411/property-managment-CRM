import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const { id: leadId } = await params;
    // 1. Authentication Check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Admin Role Check
    const userRole = (session?.user as any)?.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    // 3. Request Body theke data neya
    const { assignedAgent, status } = await req.json();

    if (!assignedAgent) {
      return NextResponse.json(
        { message: "Agent ID is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("monir");

    // 4. Lead Update kora (MongoDB)
    const result = await db.collection("leads").updateOne(
      { _id: new ObjectId(leadId) },
      {
        $set: {
          assignedAgent: assignedAgent,
          status: "Assigned",
          updatedAt: new Date(),
        },
      },
    );

    // 5. Update Agent Stats (Increment Assigned Leads Count)
    if (result.modifiedCount > 0) {
      await db.collection("user").updateOne(
        { email: assignedAgent },
        { $inc: { assignedLeadsCount: 1 } }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Lead assigned successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Patch Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
