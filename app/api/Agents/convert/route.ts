"use server";

import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodbClient";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
    try {
        const data = await req.json();
        const { leadId, note, followUpDate, nextStage, dealPrice } = data;

        const client = await clientPromise;
        const db = client.db("monir");

        const lead = await db.collection("leads").findOne({ _id: new ObjectId(leadId) });


        if (!lead) {
            console.log("lead", lead);
        }
        if (!lead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });

        const updates: any = {};

        // Add note
        if (note) updates.notes = lead.notes ? lead.notes + "\n" + note : note;

        // Update follow-up date
        if (followUpDate) {
            updates.nextFollowUpDate = followUpDate;
            updates.followUpCount = (lead.followUpCount || 0) + 1;
        }

        // Update status
        if (nextStage) updates.status = nextStage;

        // If stage is deal, set price
        if (nextStage === "Deal" && dealPrice) updates.dealPrice = dealPrice;

        await db.collection("leads").updateOne({ _id: new ObjectId(leadId) }, { $set: updates });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
