import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { Todo } from '@/types/todo';

// PUT /api/todos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // 更新数据库
    const updateData: { text?: string; completed?: boolean } = {};
    if (text !== undefined) updateData.text = text.trim();
    if (completed !== undefined) updateData.completed = completed;

    dbOperations.updateTodo(id, updateData.text || '', updateData.completed || false);

    // 返回更新后的 todo（这里简化处理，实际应用中可能需要重新查询）
    const updatedTodo: Todo = {
      id,
      text: updateData.text || '',
      completed: updateData.completed || false,
      createdAt: new Date() // 这里应该从数据库获取实际时间
    };

    return NextResponse.json(updatedTodo);
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
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    dbOperations.deleteTodo(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}