import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    console.log("DEBUG API: session", !!session, "role", (session?.user as any)?.role);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized: No session found" }, { status: 401 });
    }

    if (!["agent", "admin"].includes((session.user as any).role)) {
        return NextResponse.json({ message: `Unauthorized: Role is ${(session.user as any).role}, expected agent or admin` }, { status: 401 });
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
