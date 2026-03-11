# 🚀 Todo App - Vercel 部署指南

## 📋 项目部署概览

- **项目名称**: Todo App (代办事项应用)
- **当前版本**: v1.0 (生产就绪)
- **技术栈**: Next.js 16.1.6 + React 19 + TypeScript + pnpm
- **数据库**: PostgreSQL (Vercel Postgres) - 即将迁移
- **部署状态**: ⚠️ 需要数据库迁移

## 🎯 部署目标

### 主要目标
- ✅ **快速部署**: 5-10 分钟内完成上线
- ✅ **自动 CI/CD**: Git push 自动触发部署
- ✅ **高性能**: < 1.5s 页面加载时间
- ✅ **可靠性**: 99.9% 正常运行时间
- ✅ **可扩展性**: 支持用户增长和流量增加

### 验证标准
- [ ] 主页正常访问 (https://your-app.vercel.app)
- [ ] API 端点工作正常 (/api/todos)
- [ ] 所有 CRUD 操作功能完整
- [ ] 响应式设计适配各种设备
- [ ] 数据库连接和操作正常
- [ ] 错误处理和加载状态完善

## 🔧 部署前准备

### 项目状态检查

#### ✅ 已完成的工作
- [x] **代码质量**: TypeScript 编译通过，无错误
- [x] **功能实现**: 完整的 CRUD 操作和用户界面
- [x] **数据库**: SQLite 生产级数据存储
- [x] **API 设计**: RESTful 接口规范
- [x] **文档体系**: 完整的 docs/ 目录
- [x] **版本控制**: 完整的 Git 历史记录

#### ✅ 构建验证
```bash
pnpm build
# 预期结果: ✅ 构建成功 (3-5秒)
# 输出: .next/ 目录生成
```

## 🌐 Vercel 部署步骤

### 步骤 1: 登录 Vercel

1. **访问 Vercel**: https://vercel.com
2. **选择登录方式**:
   - GitHub 账户授权 (推荐)
   - GitLab 账户授权
   - Bitbucket 账户授权

### 步骤 2: 连接项目仓库

1. **点击 "Add New..."**
2. **选择 "Project"**
3. **授权访问 GitHub 账户**
4. **搜索并选择仓库**: `sobird/todo`
5. **点击 "Import"**

### 步骤 3: 配置项目设置

Vercel 会自动检测 Next.js 项目配置：

#### 自动检测的配置
```
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

#### 手动调整选项 (可选)
- **Environment Variables**: 添加必要的环境变量
- **Build Settings**: 高级构建配置
- **Deployment Protection**: 部署保护设置

### 步骤 4: 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-deployment-url.vercel.app
VERCEL_URL=https://your-deployment-url.vercel.app
```

#### 环境变量说明
- `NODE_ENV`: 设置为 `production` 以启用优化
- `NEXT_PUBLIC_API_URL`: 公开 API URL (用于前端调用)
- `VERCEL_URL`: Vercel 分配的域名

### 步骤 5: 启动部署

1. **点击 "Deploy"**
2. **等待构建过程**:
   - 依赖安装: ~30-60秒
   - 代码构建: ~3-5秒
   - 函数部署: ~10-20秒
3. **查看实时日志**:
   - 构建进度
   - 错误信息 (如有)
   - 部署状态

## ⚙️ 高级配置

### 自定义构建配置

如果您需要自定义构建配置，可以在 `package.json` 中添加：

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### 自定义域配置

1. **在 Vercel 项目中添加自定义域名**
2. **DNS 配置**:
   ```dns
   # A 记录
   your-domain.com -> 76.76.21.21

   # CNAME 记录
   www.your-domain.com -> your-project.vercel.app
   ```
3. **SSL 证书**: Vercel 自动提供免费的 SSL 证书

### 性能优化

#### 缓存策略
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};
```

#### 图片优化
```javascript
// 使用 Next.js Image 组件
import Image from 'next/image';

<Image
  src="/vercel.svg"
  alt="Vercel Logo"
  width={100}
  height={100}
  priority
/>
```

## 📊 监控和日志

### 实时监控

Vercel 控制台提供：
- **部署历史**: 查看所有部署版本
- **性能指标**: 页面加载时间和错误统计
- **函数监控**: API 端点的调用情况
- **资源使用情况**: 内存和 CPU 使用率

### 日志查看

#### 实时日志
```bash
# 查看最新部署的日志
vercel logs your-deployment-url.vercel.app

# 查看特定函数的日志
vercel functions your-deployment-url.vercel.app
```

#### 错误日志
- **构建错误**: 查看 `BUILD ERROR` 日志
- **运行时错误**: 查看 `ERROR` 日志
- **API 错误**: 查看 `/api/` 路由的错误信息

## 🚨 故障排除

### 常见问题及解决方案

#### 问题 1: 构建失败
**症状**: `pnpm build` 命令执行失败
**原因**: TypeScript 错误、依赖冲突、配置文件问题
**解决方案**:
```bash
# 本地测试构建
pnpm build

# 检查 TypeScript 错误
npx tsc --noEmit

# 清理并重新安装依赖
rm -rf node_modules && pnpm install
```

#### 问题 2: 数据库连接失败
**症状**: SQLite 数据库无法访问或写入
**原因**: 文件系统权限、路径配置错误
**解决方案**:
```javascript
// 确保数据库路径正确
const dbPath = path.join(process.cwd(), 'data', 'todos.db');

// 确保 data 目录存在并有写权限
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
```

#### 问题 3: 环境变量未生效
**症状**: 环境变量在应用中显示为 undefined
**原因**: 变量名称错误、大小写敏感、作用域问题
**解决方案**:
```bash
# 在 Vercel 控制台中验证环境变量
vercel env ls

# 重新部署以应用新的环境变量
vercel --prod
```

#### 问题 4: API 路由不工作
**症状**: /api/todos 返回 404 或 500 错误
**原因**: 路由配置错误、函数超时、内存不足
**解决方案**:
```javascript
// 检查路由文件结构
/app/api/todos/route.ts
/app/api/todos/[id]/route.ts

// 增加函数超时限制 (如果必要)
export const config = {
  maxDuration: 30, // 秒
};
```

### 性能调优

#### 数据库查询优化
```sql
-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_created_at ON todos(created_at);
```

#### 内存使用优化
```typescript
// 避免在内存中存储大量数据
const MAX_TODOS = 1000; // 限制查询数量

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), MAX_TODOS);

  // 分页查询
  return dbOperations.getPagedTodos(page, limit);
}
```

## 🔄 持续部署

### 自动化部署流程

每次 Git 推送到 `main` 分支时：

1. **Git Webhook 触发**: Vercel 检测到代码变更
2. **增量构建**: 仅重新构建修改的部分
3. **预览部署**: 自动生成预览链接 (用于测试)
4. **生产部署**: 更新生产环境 (如果配置了自动部署)

### 分支策略建议

```bash
# 推荐的分支策略
main           -> 生产环境 (自动部署)
develop        -> 开发环境 (手动部署)
feature/*      -> 功能分支 (预览环境)
release/*      -> 发布分支 (预发布环境)
```

## 📈 部署后验证

### 功能测试清单

#### 前端功能测试
- [ ] 添加代办事项功能正常
- [ ] 编辑代办事项内容正常
- [ ] 标记完成状态正常
- [ ] 删除代办事项正常
- [ ] 过滤功能正常工作
- [ ] 统计信息显示正常
- [ ] 响应式设计适配移动设备

#### API 端点测试
- [ ] GET /api/todos 返回所有事项
- [ ] POST /api/todos 创建新事项
- [ ] PUT /api/todos/[id] 更新事项
- [ ] DELETE /api/todos/[id] 删除事项
- [ ] DELETE /api/todos/completed 清除已完成事项

#### 性能基准测试
- [ ] 页面加载时间 < 1.5s
- [ ] API 响应时间 < 100ms
- [ ] 并发用户支持 > 100
- [ ] 错误率 < 0.1%

### 监控指标

#### 关键性能指标
| 指标 | 目标值 | 测量工具 |
|------|--------|----------|
| FCP (首次内容渲染) | < 1.2s | Google Lighthouse |
| TTI (可交互时间) | < 2.0s | Chrome DevTools |
| API 延迟 | < 100ms | Postman/Newman |
| 错误率 | < 0.1% | Sentry/Vercel Analytics |

#### 业务指标
- **用户活跃度**: 日活跃用户数
- **功能使用率**: CRUD 操作的使用频率
- **留存率**: 用户回访比例
- **转化率**: 从访问到使用的转化

## 🛡 安全和维护

### 安全最佳实践

#### 输入验证
```typescript
// 验证用户输入
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // 继续处理...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
```

#### 错误处理
```typescript
// 统一错误处理中间件
export function errorHandler(error: Error, request: Request) {
  console.error('Application Error:', error);

  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    { status: 500 }
  );
}
```

### 定期维护任务

#### 每周维护
- [ ] 检查部署日志和错误报告
- [ ] 更新依赖包 (`pnpm update`)
- [ ] 运行性能测试
- [ ] 备份重要数据

#### 每月维护
- [ ] 安全漏洞扫描 (`pnpm audit`)
- [ ] 性能基准测试
- [ ] 容量规划评估
- [ ] 文档更新

## 📞 技术支持

### 获取帮助

如果在部署过程中遇到问题，请参考：

1. **Vercel 文档**: https://vercel.com/docs
2. **Next.js 文档**: https://nextjs.org/docs
3. **项目 Issue**: https://github.com/sobird/todo/issues
4. **GitHub Discussions**: https://github.com/sobird/todo/discussions

### 联系信息

- **项目维护者**: @sobird
- **技术问题**: 查看 docs/SQLITE_SETUP.md
- **部署问题**: 查看本指南
- **Bug 报告**: GitHub Issues

---

## 🎉 部署完成！

**恭喜！您的 Todo App 现在已经成功部署到 Vercel！**

**项目链接**: https://your-app-name.vercel.app
**GitHub 仓库**: https://github.com/sobird/todo.git
**文档中心**: https://github.com/sobird/todo/tree/main/docs

**下次部署**: 只需推送代码到 main 分支即可自动部署！

*部署指南更新时间: 2026年3月10日*