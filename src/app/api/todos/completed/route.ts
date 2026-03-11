import { NextRequest, NextResponse } from 'next/server';
import DatabaseManager from '@/lib/db';

// DELETE /api/todos/completed
export async function DELETE(request: NextRequest) {
  try {
    const db = DatabaseManager;
    await db.isConnected();

    // 删除所有已完成的 todo
    const deletedCount = await db.models.Todo.destroy({
      where: { completed: true }
    });

    return NextResponse.json({
      success: true,
      deletedCount
    });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    return NextResponse.json(
      { error: 'Failed to clear completed todos' },
      { status: 500 }
    );
  }
}