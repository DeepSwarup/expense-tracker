import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json()
        const db = await getDb()

        const existingUser = await db.collection('user').findOne({ email })

        if (existingUser) {
            return new Response(JSON.stringify({ error: 'User already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const hashedPassword = bcrypt.hashSync(password, 10)
        const result = await db.collection('users').insertOne({
            email,
            password: hashedPassword,
        })

        return new Response(JSON.stringify({ success: true, userId: result.inseredId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
