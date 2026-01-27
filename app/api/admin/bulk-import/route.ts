import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { type, items } = await req.json(); // type: 'leads' | 'properties'
        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ message: "Invalid items" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("monir");

        // Simple validation/enrichment
        const enrichedItems = items.map(item => ({
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: item.status || (type === 'leads' ? 'New' : 'Available'),
            score: item.score || (type === 'leads' ? 20 : undefined)
        }));

        const result = await db.collection(type).insertMany(enrichedItems);

        return NextResponse.json({
            success: true,
            count: result.insertedCount,
            message: `Successfully imported ${result.insertedCount} ${type}`
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
