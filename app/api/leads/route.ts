import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodbClient";
import { auth } from "@/app/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized: No session found" }, { status: 401 });
    }

    const data = await req.json();
    if (!data.fullName || !data.phone) {
      return NextResponse.json({ message: "Full Name and Phone are required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("monir");

    // Lead Scoring Logic
    let leadScore = 0;

    // 1. Completion Score (Basic)
    if (data.notes && data.notes.length > 10) leadScore += 15;
    if (data.propertySize) leadScore += 10;
    if (data.timeline) leadScore += 10;

    // 2. High Value Signals
    if (data.timeline === "ASAP") leadScore += 20;
    if (data.financeType === "Cash") leadScore += 15;
    if (data.source === "Referral") leadScore += 15;
    if (data.purpose === "Invest") leadScore += 10;

    // 3. Budget Signal (Simple logic: if budgetMax > 200k)
    if (parseInt(data.budgetMax) > 200000) leadScore += 15;

    // Cap score at 100
    leadScore = Math.min(leadScore, 100);

    const newLead = {
      ...data,
      // Internal / System Fields
      status: "New",
      score: leadScore,
      leadsAddby: session.user?.email,
      assignedAgent: "Unassigned",
      lastContactedAt: null,
      nextFollowUpDate: data.nextFollowUpDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("leads").insertOne(newLead);

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        leadId: result.insertedId,
        score: leadScore,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized: No session found" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("monir");

    const userRole = (session.user as any)?.role;
    const userEmail = session.user?.email;

    let query = {};

    const url = new URL(req.url);
    const assignedAgent = url.searchParams.get("assignedAgent");

    if (userRole !== "admin") {
      query = {
        $or: [
          { leadsAddby: userEmail },
          { assignedAgent: userEmail },
        ],
      };
    } else {
      // Admin can filter by agent
      if (assignedAgent) {
        query = { assignedAgent: assignedAgent };
      }
    }

    const leads = await db
      .collection("leads")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        leads,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
