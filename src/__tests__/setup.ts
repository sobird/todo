// 模拟 Next.js 环境
global.window = global as any;
global.document = (global as any).window.document = {
  createElement: () => ({}),
} as any;

// 模拟 fetch API
global.fetch = vi.fn();