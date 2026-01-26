import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  const session = await auth();
  try {
    if (!session) {
      return NextResponse.json({ massage: "unauthorize" }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("monir");

    const agents = await db
      .collection("user")
      .find({ role: "agent" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, agents }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
