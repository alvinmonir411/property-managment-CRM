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

        const role = (session.user as any).role;
        const body = await req.json();
        const { leadId, action, note, metadata } = body;

        // RBAC: Agency Assistant (role: user) cannot move leads beyond "Assigned" or close deals
        if (role === "user") {
            if (action === "Stage Change" || action === "Complete") {
                const nextStage = metadata?.nextStage;
                if (nextStage && nextStage !== "Assigned") {
                    return NextResponse.json({ message: "Forbidden: Assistants cannot move leads beyond Assigned" }, { status: 403 });
                }
            }
        }
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
                    // Handle transition to Deal
                    if (metadata.nextStage === "Deal") {
                        const lead = await db.collection("leads").findOne({ _id: leadObjectId });
                        let propertyId = metadata.propertyId ? new ObjectId(metadata.propertyId) : (lead?.propertyId ? new ObjectId(lead.propertyId) : null);

                        if (propertyId) {
                            const property = await db.collection("properties").findOne({ _id: propertyId });
                            if (property) {
                                const price = parseFloat(property.price);
                                const commission = price * 0.30;
                                updates.dealPrice = price;
                                updates.commission = commission;
                                updates.propertyId = propertyId;

                                // Mark Property as Sold
                                await db.collection("properties").updateOne(
                                    { _id: propertyId },
                                    { $set: { status: "Sold" } }
                                );

                                // Update Agent Stats
                                if (lead?.assignedAgent) {
                                    await db.collection("user").updateOne(
                                        { email: lead.assignedAgent },
                                        {
                                            $inc: {
                                                commission: commission,
                                                dealsClosed: 1,
                                                totalSalesValue: price
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    }
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
                    // Handle transition to Deal (same as Stage Change)
                    if (metadata.nextStage === "Deal") {
                        const lead = await db.collection("leads").findOne({ _id: leadObjectId });
                        let propertyId = metadata.propertyId ? new ObjectId(metadata.propertyId) : (lead?.propertyId ? new ObjectId(lead.propertyId) : null);

                        if (propertyId) {
                            const property = await db.collection("properties").findOne({ _id: propertyId });
                            if (property) {
                                const price = parseFloat(property.price);
                                const commission = price * 0.30;
                                updates.dealPrice = price;
                                updates.commission = commission;
                                updates.propertyId = propertyId;

                                await db.collection("properties").updateOne({ _id: propertyId }, { $set: { status: "Sold" } });
                                if (lead?.assignedAgent) {
                                    await db.collection("user").updateOne(
                                        { email: lead.assignedAgent },
                                        { $inc: { commission: commission, dealsClosed: 1, totalSalesValue: price } }
                                    );
                                }
                            }
                        }
                    }
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
        // 3. Execute Updates
        const historyEntry = {
            id: new ObjectId(),
            date: new Date(),
            action: action,
            note: note || "",
            agentName: session.user?.name || "Agent",
            ...(metadata.followUpDate ? { followUpDate: metadata.followUpDate } : {})
        };

        const updateOp: any = {
            $set: updates,
            $push: { history: historyEntry }
        };

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

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const leadId = url.searchParams.get("leadId");

        if (!leadId) {
            return NextResponse.json({ message: "Missing leadId" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("monir");
        const leadObjectId = new ObjectId(leadId);

        // Fetch lead to get history
        const lead = await db.collection("leads").findOne({ _id: leadObjectId });
        if (!lead || !lead.history || lead.history.length === 0) {
            return NextResponse.json({ message: "No history to undo" }, { status: 404 });
        }

        const lastAction = lead.history[lead.history.length - 1];
        const previousStatus = lead.history.length > 1
            ? lead.history.slice(0, -1).reverse().find((h: any) => h.action === "Stage Change")?.metadata?.nextStage || "Assigned"
            : "Assigned";

        // Revert side effects if it was a Deal (harder to revert fully but let's try status)
        const updates: any = {
            updatedAt: new Date(),
        };

        if (lastAction.action === "Stage Change" || lastAction.action === "Complete") {
            updates.status = previousStatus;
            // If it was a Deal, we'd ideally revert commission but that's complex for a basic undo.
            // For now, let's just revert the status.
        }

        await db.collection("leads").updateOne(
            { _id: leadObjectId },
            {
                $set: updates,
                $pop: { history: 1 }
            }
        );

        // Also remove from lead_activities
        await db.collection("lead_activities").deleteOne({
            leadId: leadObjectId,
            createdAt: lastAction.date
        });

        return NextResponse.json({ success: true, message: "Action undone" });

    } catch (error: any) {
        console.error("Undo API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
