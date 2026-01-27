"use server";

import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodbClient";
import { ObjectId } from "mongodb";
import { auth } from "@/app/auth";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
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
        const historyEntry: any = {
            id: new ObjectId(),
            date: new Date(),
            action: nextStage || (note ? "Note" : "Update"),
            note: note || "",
            agentName: session?.user?.name || "Agent",
        };

        // Add note (Legacy support)
        if (note) updates.notes = lead.notes ? lead.notes + "\n" + note : note;

        // Update follow-up date
        if (followUpDate) {
            updates.nextFollowUpDate = followUpDate;
            updates.followUpCount = (lead.followUpCount || 0) + 1;
            historyEntry.followUpDate = followUpDate;
        }

        // Update status
        if (nextStage) updates.status = nextStage;

        // Handle Visit Stage - Link Property
        if (nextStage === "Visit") {
            if (data.propertyId) {
                const pId = new ObjectId(data.propertyId);
                updates.propertyId = pId;
                historyEntry.propertyId = pId;
                historyEntry.note = `Scheduled Visit. ${note || ''}`;
            }
        }

        // Handle Deal Stage - Calculate Commission
        if (nextStage === "Deal") {
            let propertyId = data.propertyId ? new ObjectId(data.propertyId) : lead.propertyId;

            if (!propertyId) {
                return NextResponse.json({ message: "Property must be linked to close a deal" }, { status: 400 });
            }

            const property = await db.collection("properties").findOne({ _id: propertyId });

            if (!property) {
                return NextResponse.json({ message: "Linked property not found" }, { status: 404 });
            }

            const price = parseFloat(property.price);
            const commission = price * 0.30;

            updates.dealPrice = price;
            updates.commission = commission;
            updates.propertyId = propertyId; // Ensure it's set if it wasn't before

            historyEntry.propertyId = propertyId;
            historyEntry.dealPrice = price;
            historyEntry.commission = commission;

            // Update Agent's Total Commission
            // Assuming agent is stored in session or we use the lead's assigned agent
            // The lead has assignedAgent (email). We need to update the user with that email.
            if (lead.assignedAgent) {
                await db.collection("user").updateOne(
                    { email: lead.assignedAgent },
                    { $inc: { commission: commission } }
                );
            }

            // Mark Property as Sold
            await db.collection("properties").updateOne(
                { _id: propertyId },
                { $set: { status: "Sold" } }
            );
        }

        await db.collection("leads").updateOne(
            { _id: new ObjectId(leadId) },
            {
                $set: updates,
                $push: { history: historyEntry } as any
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
