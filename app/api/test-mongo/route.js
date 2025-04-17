import { getDb } from "@/lib/mongodb";

export async function GET() {
    try {
        const db = await getDb()
        const collections = await db.listCollections().toArray()
        return new Response(JSON.stringify({ success: true, collections }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
