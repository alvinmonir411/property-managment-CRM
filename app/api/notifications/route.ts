import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db("monir");

        const notifications = await db.collection("notifications")
            .find({ userId: session.user?.email })
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { notificationId, markAll } = await req.json();
        const client = await clientPromise;
        const db = client.db("monir");

        if (markAll) {
            await db.collection("notifications").updateMany(
                { userId: session.user?.email },
                { $set: { isRead: true } }
            );
        } else if (notificationId) {
            await db.collection("notifications").updateOne(
                { _id: new ObjectId(notificationId), userId: session.user?.email },
                { $set: { isRead: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
