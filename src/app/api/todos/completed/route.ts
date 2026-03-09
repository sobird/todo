import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

// DELETE /api/todos/completed
export async function DELETE(request: NextRequest) {
  try {
    dbOperations.clearCompleted();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    return NextResponse.json(
      { error: 'Failed to clear completed todos' },
      { status: 500 }
    );
  }
}