import clientPromise from "@/app/lib/mongodbClient";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({
        massage: "missing field",
      });
    }
    const hasedPassword = await bcrypt.hash(password, 12);

    const client = await clientPromise;
    const db = client.db("monir");

    const exittingUSer = await db.collection("user").findOne({ email });

    if (exittingUSer) {
      return NextResponse.json({
        massage: "user already exits",
      });
    }

    const result = await db.collection("user").insertOne({
      email,
      hasedPassword,
      role: "user",
      createdAt: Date,
    });

    if (result) {
      return NextResponse.json({
        massage: "you have succesfully signup",
        data: result.insertedId,
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      massage: "failed to signup",
      success: false,
      data: error,
    });
  }
}
