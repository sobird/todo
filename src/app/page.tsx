"use client";

import { useTodos } from '@/hooks/useTodos';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { TodoFilter } from '@/components/TodoFilter';

export default function Home() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    activeCount,
    completedCount,
    totalCount
  } = useTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">代办事项</h1>
          <p className="text-gray-600">管理您的日常任务</p>
        </div>

        {/* 添加表单 */}
        <TodoForm onAdd={addTodo} />

        {/* 统计信息 */}
        {totalCount > 0 && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm text-gray-600">
                总计: <span className="font-semibold text-gray-800">{totalCount}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                待完成: <span className="font-semibold text-orange-600">{activeCount}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                已完成: <span className="font-semibold text-green-600">{completedCount}</span>
              </span>
            </div>
          </div>
        )}

        {/* 过滤器 */}
        {totalCount > 0 && (
          <div className="mb-6">
            <TodoFilter
              currentFilter={filter}
              onFilterChange={setFilter}
              activeCount={activeCount}
              completedCount={completedCount}
              onClearCompleted={clearCompleted}
            />
          </div>
        )}

        {/* 代办事项列表 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>💡 提示: 点击文本可以编辑，点击圆圈可以标记完成状态</p>
        </div>
      </div>
    </div>
  );
}
