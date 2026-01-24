import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/mongodbClient'
import { auth } from '@/app/auth'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const userRole = (session.user as any)?.role
        if (userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 })
        }

        const client = await clientPromise
        const db = client.db("monir")

        const users = await db.collection("user")
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json({
            success: true,
            users
        }, { status: 200 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            message: 'Internal server error',
            error: error.message
        }, { status: 500 })
    }
}
