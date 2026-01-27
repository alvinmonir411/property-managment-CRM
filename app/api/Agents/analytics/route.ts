import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();

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

        // 1. Fetch Agent Stats from User Collection
        const user = await db.collection("user").findOne({ email: agentEmail });

        const stats = {
            dealsClosed: user?.dealsClosed || 0,
            commission: user?.commission || 0,
            totalSalesValue: user?.totalSalesValue || 0,
        };

        // 2. Aggregate Lead Stage Breakdown
        const leads = await db.collection("leads").find({ assignedAgent: agentEmail }).toArray();

        const stageBreakdown = {
            Assigned: 0,
            Call: 0,
            Visit: 0,
            Deal: 0,
            Commission: 0
        };

        const sourceBreakdown: Record<string, number> = {};

        leads.forEach(lead => {
            // Stage breakdown
            const status = lead.status as any;
            if (stageBreakdown.hasOwnProperty(status)) {
                (stageBreakdown as any)[status]++;
            } else if (status === "New") { // Legacy support during transition
                stageBreakdown.Assigned++;
            }

            // Source breakdown
            const source = lead.source || "Unknown";
            sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
        });

        // 3. Activity Summary (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivities = await db.collection("lead_activities")
            .find({
                agentEmail: agentEmail,
                createdAt: { $gte: sevenDaysAgo }
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({
            success: true,
            stats,
            stageBreakdown,
            sourceBreakdown,
            recentActivities,
            totalLeads: leads.length
        }, { status: 200 });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
