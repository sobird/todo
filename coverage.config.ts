import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8' as const,
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // 按文件设置阈值
        './src/models/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        './src/lib/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/app/api/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // 测试文件不需要覆盖率要求
        './src/__tests__/**': {
          branches: 0,
          functions: 0,
          lines: 0,
          statements: 0,
        }
      },
      // 排除文件和目录
      exclude: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        'coverage/**',
        'src/__tests__/**',
        'src/__tests__/setup.ts',
        'vitest.config.ts',
        'coverage.config.ts'
      ],
      // 包含的文件
      include: [
        'src/**/*.ts',
        'src/**/*.tsx'
      ]
    }
  }
});