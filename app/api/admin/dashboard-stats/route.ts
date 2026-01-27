import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();

    if (!session || !["admin", "user"].includes((session.user as any).role)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("monir");

        // 1. Get Platform-wide Stats
        const users = await db.collection("user").find({ role: "agent" }).toArray();
        const totalSales = users.reduce((acc, u) => acc + (u.totalSalesValue || 0), 0);
        const totalCommission = users.reduce((acc, u) => acc + (u.commission || 0), 0);
        const agentCount = users.length;

        const leadsCount = await db.collection("leads").countDocuments();
        const propertiesCount = await db.collection("properties").countDocuments({ status: "Available" });

        // Extra SaaS Stats (Hot Leads & Today's Follow-ups)
        const hotLeadsCount = await db.collection("leads").countDocuments({ score: { $gt: 50 } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const followUpsToday = await db.collection("leads").countDocuments({
            nextFollowUpDate: {
                $gte: today.toISOString().split('T')[0],
                $lt: tomorrow.toISOString().split('T')[0]
            }
        });

        const upcomingVisits = await db.collection("leads").countDocuments({
            status: "Visit"
        });

        // 2. Top Performing Agents (Removed for Assistants if you want to restrict, but prompt says Assistant handles leads/properties)
        // Let's keep it for now as a bird's eye view
        const topAgents = [...users]
            .sort((a, b) => (b.totalSalesValue || 0) - (a.totalSalesValue || 0))
            .slice(0, 5)
            .map(u => ({
                name: u.name || u.email,
                email: u.email,
                sales: u.totalSalesValue || 0,
                deals: u.dealsClosed || 0,
                commission: u.commission || 0
            }));

        // 3. Recent Major Activities
        const recentDeals = await db.collection("lead_activities")
            .find({ actionType: "Deal" })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        // 4. Lead Status Breakdown
        const allLeads = await db.collection("leads").find({}).toArray();
        const statusBreakdown = allLeads.reduce((acc: any, lead) => {
            const status = lead.status || "Assigned";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return NextResponse.json({
            stats: {
                totalSales,
                totalCommission,
                agentCount,
                leadsCount,
                propertiesCount,
                hotLeadsCount,
                followUpsToday,
                upcomingVisits
            },
            topAgents,
            recentDeals,
            statusBreakdown
        });

    } catch (error) {
        console.error("Admin Dashboard API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
