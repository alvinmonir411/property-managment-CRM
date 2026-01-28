import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, currentPassword, newPassword } = await req.json();
        const client = await clientPromise;
        const db = client.db("monir");

        const updateData: any = { updatedAt: new Date() };
        if (name) updateData.name = name;

        if (currentPassword && newPassword) {
            const user = await db.collection("user").findOne({ email: session.user.email });
            if (!user) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.hasedPassword);
            if (!isMatch) {
                return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            updateData.hasedPassword = hashed;
        }

        await db.collection("user").updateOne(
            { email: session.user.email },
            { $set: updateData }
        );

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error: any) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
