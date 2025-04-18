import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'category' or 'month'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    let pipeline = [{ $match: { userId: new ObjectId(session.user.id) } }];

    if (startDate && endDate) {
      pipeline[0].$match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (type === 'category') {
      pipeline.push(
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      );
    } else if (type === 'month') {
      pipeline.push(
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      );
    } else {
      return new Response(JSON.stringify({ error: 'Invalid summary type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const summaries = await db.collection('expenses').aggregate(pipeline).toArray();

    // Format month summaries for display
    if (type === 'month') {
      return new Response(
        JSON.stringify(
          summaries.map((s) => ({
            label: `${s._id.year}-${String(s._id.month).padStart(2, '0')}`,
            total: s.total,
          }))
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Format category summaries
    return new Response(
      JSON.stringify(
        summaries.map((s) => ({
          label: s._id,
          total: s.total,
        }))
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}