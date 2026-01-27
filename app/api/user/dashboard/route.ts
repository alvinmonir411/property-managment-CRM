import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user?.email;

    try {
        const client = await clientPromise;
        const db = client.db("monir");

        // 1. Find the lead record associated with this user
        const lead = await db.collection("leads").findOne({ email: userEmail });

        if (!lead) {
            return NextResponse.json({
                success: true,
                hasLead: false,
                message: "No active property inquiries found."
            });
        }

        // 2. Fetch associated property if exists
        let linkedProperty = null;
        if (lead.propertyId) {
            linkedProperty = await db.collection("properties").findOne({ _id: lead.propertyId });
        }

        // 3. Recommended properties (same logic as smart match)
        const budgetMax = parseInt(lead.budgetMax) || Infinity;
        const recommendations = await db.collection("properties")
            .find({
                status: "Available",
                $expr: {
                    $lte: [
                        { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } },
                        budgetMax
                    ]
                }
            })
            .limit(4)
            .toArray();

        return NextResponse.json({
            success: true,
            hasLead: true,
            lead,
            linkedProperty,
            recommendations
        });

    } catch (error) {
        console.error("User Dashboard API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
