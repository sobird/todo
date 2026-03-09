import { FilterType } from '@/types/todo';

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export const TodoFilter = ({
  currentFilter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted
}: TodoFilterProps) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '未完成' },
    { key: 'completed', label: '已完成' }
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentFilter === key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{activeCount} 个待完成</span>
        {completedCount > 0 && (
          <>
            <span>•</span>
            <span>{completedCount} 个已完成</span>
            <button
              onClick={onClearCompleted}
              className="text-red-500 hover:text-red-700 underline"
            >
              清除已完成
            </button>
          </>
        )}
      </div>
    </div>
  );
};