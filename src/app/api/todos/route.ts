import { NextRequest, NextResponse } from 'next/server';
import DatabaseManager from '@/lib/db';
import { TodoAttributes } from '@/models/Todo';

// GET /api/todos
export async function GET(request: NextRequest) {
  try {
    const db = DatabaseManager;
    await db.isConnected();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let todos: TodoAttributes[];

    switch (filter) {
      case 'active':
        todos = await db.models.Todo.findAll({
          where: { completed: false },
          order: [['createdAt', 'DESC']]
        });
        break;
      case 'completed':
        todos = await db.models.Todo.findAll({
          where: { completed: true },
          order: [['createdAt', 'DESC']]
        });
        break;
      default:
        todos = await db.models.Todo.findAll({
          order: [['createdAt', 'DESC']]
        });
    }

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos
export async function POST(request: NextRequest) {
  try {
    const db = DatabaseManager;
    await db.isConnected();

    const { text } = await request.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const newTodo = await db.models.Todo.create({
      text: text.trim()
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}