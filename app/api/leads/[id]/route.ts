import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodbClient";
import { auth } from "@/app/auth";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin-only check
    const userRole = (session.user as any)?.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const client = await clientPromise;
    const db = client.db("monir");
    const { id } = await params;

    const result = await db.collection("leads").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin-only check
    const userRole = (session.user as any)?.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const data = await req.json();
    const client = await clientPromise;
    const db = client.db("monir");

    const result = await db.collection("leads").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
