import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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
      .limit(10)
      .toArray();

    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = new Date(formData.get('date'));

    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'].includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isNaN(date.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDb();
    const result = await db.collection('expenses').insertOne({
      userId: new ObjectId(session.user.id),
      amount,
      category,
      date,
      createdAt: new Date(),
    });

    console.log('Expense inserted:', { expenseId: result.insertedId, amount, category, date });

    return new Response(JSON.stringify({ success: true, expenseId: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error inserting expense:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const id = formData.get('id');
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = new Date(formData.get('date'));

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid expense ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'].includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isNaN(date.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDb();
    const result = await db.collection('expenses').updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
      { $set: { amount, category, date, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Expense not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Expense updated:', { expenseId: id, amount, category, date });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid expense ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDb();
    const result = await db.collection('expenses').deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Expense not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Expense deleted:', { expenseId: id });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}