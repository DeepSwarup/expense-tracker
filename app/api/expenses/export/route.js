import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { stringify } from 'csv-stringify/sync';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = { userId: new ObjectId(session.user.id) };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const db = await getDb();
    const expenses = await db
      .collection('expenses')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Format expenses for CSV
    const csvData = expenses.map((expense) => ({
      Amount: expense.amount.toFixed(2),
      Category: expense.category,
      Date: new Date(expense.date).toISOString().split('T')[0],
      CreatedAt: new Date(expense.createdAt).toISOString(),
    }));

    // Generate CSV
    const csv = stringify(csvData, {
      header: true,
      columns: ['Amount', 'Category', 'Date', 'CreatedAt'],
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="expenses.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting expenses:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}