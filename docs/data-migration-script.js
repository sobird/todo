// 数据迁移脚本：从 localStorage 迁移到 SQLite
// 这个脚本需要在浏览器控制台中运行

async function migrateFromLocalStorage() {
  console.log('🔄 开始数据迁移...');

  // 从 localStorage 获取数据
  const storedTodos = localStorage.getItem('todos');

  if (!storedTodos) {
    console.log('📭 localStorage 中没有找到数据，无需迁移');
    return;
  }

  try {
    const todos = JSON.parse(storedTodos);
    console.log(`📦 找到 ${todos.length} 个代办事项需要迁移`);

    // 逐个迁移到 SQLite
    for (const todo of todos) {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: todo.text
          }),
        });

        if (response.ok) {
          const newTodo = await response.json();

          // 如果原来的任务是已完成的，更新状态
          if (todo.completed) {
            await fetch(`/api/todos/${newTodo.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: newTodo.text,
                completed: true
              }),
            });
          }

          console.log(`✅ 已迁移: ${todo.text}`);
        } else {
          console.error(`❌ 迁移失败: ${todo.text}`);
        }
      } catch (error) {
        console.error(`❌ 迁移错误: ${todo.text}`, error);
      }
    }

    console.log('🎉 数据迁移完成！');
    console.log('💡 您可以选择清除 localStorage 中的旧数据：');
    console.log('   localStorage.removeItem("todos");');

  } catch (error) {
    console.error('❌ 数据解析失败:', error);
  }
}

// 运行迁移
migrateFromLocalStorage();