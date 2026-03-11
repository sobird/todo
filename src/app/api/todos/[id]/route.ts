import { NextRequest, NextResponse } from 'next/server';
import DatabaseManager from '@/lib/db';

// PUT /api/todos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = DatabaseManager;
    await db.isConnected();

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { text, completed } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // 验证输入
    if (text !== undefined && (typeof text !== 'string' || !text.trim())) {
      return NextResponse.json(
        { error: 'Text must be a non-empty string' },
        { status: 400 }
      );
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed must be a boolean' },
        { status: 400 }
      );
    }

    // 查找并更新 todo
    const todo = await db.models.Todo.findByPk(id);
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: { text?: string; completed?: boolean } = {};
    if (text !== undefined) updateData.text = text.trim();
    if (completed !== undefined) updateData.completed = completed;

    // 应用更新
    await todo.update(updateData);

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = DatabaseManager;
    await db.isConnected();

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // 查找并删除 todo
    const todo = await db.models.Todo.findByPk(id);
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    await todo.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}