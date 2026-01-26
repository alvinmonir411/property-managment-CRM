"use server";

import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as any).role !== "agent") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Basic Validation
        if (!data.title || !data.price || !data.location) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("monir");

        const newProperty = {
            ...data,
            agentEmail: (session.user as any).email,
            agentName: session.user?.name,
            createdAt: new Date(),
            status: "Available" // Default status
        };

        const result = await db.collection("properties").insertOne(newProperty);

        return NextResponse.json({
            success: true,
            message: "Property created successfully",
            propertyId: result.insertedId
        }, { status: 201 });

    } catch (error: any) {
        console.error("Add Property Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
