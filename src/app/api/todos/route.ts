import { NextRequest, NextResponse } from 'next/server';
import { dbOperations, TodoRow } from '@/lib/db';
import { Todo } from '@/types/todo';

// GET /api/todos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let todos: TodoRow[];
    if (filter === 'active' || filter === 'completed') {
      todos = dbOperations.getFilteredTodos(filter);
    } else {
      todos = dbOperations.getAllTodos();
    }

    // 转换数据格式
    const formattedTodos: Todo[] = todos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: Boolean(todo.completed),
      createdAt: new Date(todo.createdAt)
    }));

    return NextResponse.json(formattedTodos);
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
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date();

    dbOperations.createTodo(id, text.trim(), createdAt);

    const newTodo: Todo = {
      id,
      text: text.trim(),
      completed: false,
      createdAt
    };

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}