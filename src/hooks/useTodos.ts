"use client";

import { useState, useEffect } from 'react';
import { Todo, FilterType } from '@/types/todo';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 加载数据
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/todos?filter=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filter]);

  const addTodo = async (text: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const newTodo = await response.json();
      setTodos(prev => [newTodo, ...prev]);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: todo.text,
          completed: !todo.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const editTodo = async (id: string, newText: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newText,
          completed: todo.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error editing todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit todo');
    }
  };

  const clearCompleted = async () => {
    try {
      const response = await fetch('/api/todos/completed', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear completed todos');
      }

      setTodos(prev => prev.filter(todo => !todo.completed));
    } catch (err) {
      console.error('Error clearing completed todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear completed todos');
    }
  };

  const filteredTodos = todos;

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return {
    todos: filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    activeCount,
    completedCount,
    totalCount: todos.length,
    loading,
    error,
    refetch: fetchTodos
  };
};