# 代办事项应用

一个基于 Next.js + TypeScript 的简单代办事项管理应用。

## 功能特性

- ✅ 添加新的代办事项
- ✅ 标记事项为完成/未完成
- ✅ 编辑事项内容
- ✅ 删除事项
- ✅ 过滤显示（全部/未完成/已完成）
- ✅ 清除所有已完成事项
- ✅ 本地存储持久化
- ✅ 响应式设计

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- React Hooks
- Tailwind CSS
- Local Storage

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 主页面
│   └── layout.tsx        # 应用布局
├── components/
│   ├── TodoForm.tsx      # 添加事项表单
│   ├── TodoList.tsx      # 事项列表
│   ├── TodoItem.tsx      # 单个事项组件
│   └── TodoFilter.tsx    # 过滤组件
├── hooks/
│   └── useTodos.ts       # 自定义 Hook
└── types/
    └── todo.ts           # TypeScript 类型定义
```

## 使用说明

1. **添加事项**: 在顶部输入框中输入事项内容，点击"添加"按钮
2. **标记完成**: 点击事项左侧的圆圈图标
3. **编辑事项**: 点击事项文本进行编辑
4. **删除事项**: 点击事项右侧的删除图标
5. **过滤事项**: 使用顶部的过滤按钮查看不同状态的事项
6. **清除已完成**: 点击"清除已完成"按钮删除所有已完成事项

## 数据存储

所有数据都保存在浏览器的本地存储中，刷新页面后数据不会丢失。

## 构建部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 启动开发服务器
pnpm dev
```

## 📚 **文档中心**

- [docs/README.md](docs/README.md) - 完整的项目文档导航
- [docs/SUMMARY.md](docs/SUMMARY.md) - 项目完成总结
- [docs/UPGRADE.md](docs/UPGRADE.md) - 技术栈升级记录
- [docs/SQLITE_SETUP.md](docs/SQLITE_SETUP.md) - SQLite 数据库设置指南
- [docs/PNPM_SETUP.md](docs/PNPM_SETUP.md) - pnpm 包管理器配置指南
