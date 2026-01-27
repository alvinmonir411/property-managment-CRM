"use server";

import { auth } from "@/app/auth";
import clientPromise from "@/app/lib/mongodbClient";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { leadId, action, note, metadata } = body;
        // metadata can contain: nextStage, followUpDate, propertyId, etc.

        if (!leadId || !action) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("monir");
        const leadObjectId = new ObjectId(leadId);

        // 1. Create Activity Log Entry
        const activityEntry = {
            leadId: leadObjectId,
            agentEmail: session.user?.email,
            agentName: session.user?.name || "Agent",
            actionType: action, // 'Call', 'Note', 'Stage Change', 'Reschedule', 'Complete'
            note: note || "",
            metadata: metadata || {},
            createdAt: new Date(),
        };

        await db.collection("lead_activities").insertOne(activityEntry);

        // 2. Prepare Lead Updates (Side Effects)
        const updates: any = {
            updatedAt: new Date(),
            lastContactedAt: new Date().toISOString(), // Always update on action
        };
        const incUpdates: any = { score: 0 };

        // Side Effects based on Action Type
        switch (action) {
            case "Call":
                incUpdates.score += 2;
                updates.contactMethod = "Phone";
                break;

            case "Note":
                incUpdates.score += 1;
                // Append to legacy notes field just in case
                // We won't overwrite the whole note string to avoid conflicts, just relying on activity log is better but for legacy UI:
                // We could fetch and append but for now let's skip legacy note append if we are moving to activity logs
                // Or we can just set `notes` to the latest note? Let's skip modifying legacy `notes` field to avoid overwriting.
                break;

            case "Stage Change":
                incUpdates.score += 5;
                if (metadata.nextStage) {
                    updates.status = metadata.nextStage;
                }
                break;

            case "Reschedule":
                incUpdates.score += 2;
                if (metadata.followUpDate) {
                    updates.nextFollowUpDate = metadata.followUpDate;
                    incUpdates.followUpCount = 1;
                }
                break;

            case "Complete":
                incUpdates.score += 5;
                if (metadata.nextStage) {
                    updates.status = metadata.nextStage;
                }
                if (metadata.followUpDate) {
                    updates.nextFollowUpDate = metadata.followUpDate;
                    incUpdates.followUpCount = 1;
                }
                break;

            case "WhatsApp":
                incUpdates.score += 2;
                updates.contactMethod = "WhatsApp";
                break;
        }

        // 3. Execute Updates
        const updateOp: any = { $set: updates };
        if (incUpdates.score > 0 || incUpdates.followUpCount > 0) {
            updateOp.$inc = incUpdates;
        }

        await db.collection("leads").updateOne(
            { _id: leadObjectId },
            updateOp
        );

        return NextResponse.json({ success: true, activityId: activityEntry }, { status: 200 });

    } catch (error: any) {
        console.error("Action API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
