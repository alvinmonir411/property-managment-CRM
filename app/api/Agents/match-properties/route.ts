import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
    const session = await auth();

    if (!session || !["agent", "admin"].includes((session.user as any).role)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
        return NextResponse.json({ message: "Lead ID is required" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("monir");

        // 1. Fetch Lead Details
        const lead = await db.collection("leads").findOne({ _id: new ObjectId(leadId) });

        if (!lead) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 });
        }

        // 2. Build Matching Query
        const budgetMax = parseInt(lead.budgetMax) || Infinity;
        const propertyType = lead.propertyType;
        const location = lead.location;

        const query: any = {
            status: "Available",
            // Price check
            $expr: {
                $lte: [
                    { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } },
                    budgetMax
                ]
            }
        };

        // Optional Type Match
        if (propertyType && propertyType !== "Any") {
            query.type = { $regex: propertyType, $options: "i" };
        }

        // Optional Location Match
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        const matches = await db.collection("properties")
            .find(query)
            .limit(10)
            .toArray();

        return NextResponse.json({
            success: true,
            matches,
            leadRequirements: {
                budgetMax,
                propertyType,
                location
            }
        });

    } catch (error) {
        console.error("Match API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
