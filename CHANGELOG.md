# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-13

### Added
- TypeScript 支持和类型定义
- 为所有组件添加详细的 JSDoc 注释，包括功能描述、参数说明和实现思路
- cron-parser 库依赖，用于更可靠的 Cron 表达式解析
- Vue 3 Composition API 支持
- Vite 构建工具支持

### Changed
- **重构**: 将项目从 webpack 迁移到 Vite
- **重构**: 将所有组件从 Options API 迁移到 Composition API 的 `<script setup>` 语法
- **重构**: 将所有 JavaScript 代码迁移到 TypeScript
- **重构**: Crontab-Result 组件使用 cron-parser 库替代复杂的手动解析逻辑
- **优化**: 简化 Cron 表达式计算逻辑，从约 500 行代码减少到约 170 行
- **优化**: 改进错误处理机制，提供更友好的错误提示

### Fixed
- 修复模板中缺少 `<tr>` 标签的结构问题
- 修复 TypeScript 类型注解问题

### Technical Details
- 升级 Vue 2 到 Vue 3
- 更新构建配置以支持库模式打包
- 优化组件代码结构和逻辑
- 改进日期格式化函数，使用更标准的输出格式 (YYYY-MM-DD HH:mm:ss)

### Breaking Changes
- 最低 Node.js 版本要求从 Node.js 14 升级到 Node.js 18
- 最低 pnpm 版本要求从 pnpm 7 升级到 pnpm 8
- Vue 3 要求 peerDependencies 为 `^3.4.0`

### Dependencies
- 新增: `cron-parser@^5.4.0`
- 新增: `typescript@^5.0.0`
- 新增: `vue-tsc@^2.0.0`
- 新增: `vite@^5.0.0`
- 新增: `@vitejs/plugin-vue@^5.0.0`
- 移除: webpack 相关依赖
- 移除: babel 相关依赖
- 移除: Vue 2 相关依赖

[0.1.0]: https://github.com/shutwt/vue-crontab/commit/ea1e2d4f92cb570aa4cf93702fe35e4875d91da8
