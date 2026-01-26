"use server";

import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "agent") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const agentEmail = (session.user as any).email;

    try {
        const client = await clientPromise;
        const db = client.db("monir");

        const leads = await db
            .collection("leads")
            .find({ assignedAgent: agentEmail })
            .toArray(); // ✅ critical

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
