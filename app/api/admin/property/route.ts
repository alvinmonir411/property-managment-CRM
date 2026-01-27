"use server";

import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";


export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("monir");

        const properties = await db.collection("properties")
            .find()
            .toArray();

        return NextResponse.json(properties);
    } catch (error: any) {
        console.error("Get Properties Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
