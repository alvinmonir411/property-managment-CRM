import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/mongodbClient'
import { auth } from '@/app/auth'
import { ObjectId } from 'mongodb'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Promise হিসেবে ডিফাইন করো
) {
    const { id } = await params;
    const data = await req.json();
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Admin-only check
        const userRole = (session.user as any)?.role
        if (userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 })
        }


        const client = await clientPromise
        const db = client.db("monir")

        // Update user role
        const result = await db.collection("user").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    role: data.role,
                    updatedAt: new Date()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully'
        }, { status: 200 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            message: 'Internal server error',
            error: error.message
        }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Admin-only check
        const userRole = (session.user as any)?.role
        if (userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 })
        }

        const client = await clientPromise
        const db = client.db("monir")

        const result = await db.collection("user").deleteOne({
            _id: new ObjectId(params.id)
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        }, { status: 200 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            message: 'Internal server error',
            error: error.message
        }, { status: 500 })
    }
}
