# vue-crontab

基于 Vue 3 实现的可视化 Crontab 表达式生成器，支持秒、分钟、小时、日、月、周、年七个维度的配置，能够实时预览最近5次执行时间。

## 项目特性

- ✅ 基于 Vue 3 + TypeScript 开发
- ✅ 支持七个时间维度的可视化配置
- ✅ 实时预览最近5次执行时间
- ✅ 提供弹层组件，方便集成到现有项目
- ✅ 支持自定义样式变量
- ✅ 响应式设计，适配不同屏幕尺寸
- ✅ 支持键盘导航和无障碍访问

## 安装

```bash
npm install @shutwt/vue-crontab
```

## 基本使用

### 1. 直接使用弹层组件（推荐）

```vue
<template>
  <div>
    <input readonly v-model="crontabValue" />
    <button @click="showCrontab = true">选择时间规则</button>
    <CrontabModal 
      v-if="showCrontab" 
      @hide="showCrontab = false" 
      @fill="handleFill" 
      :value="crontabValue"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CrontabModal } from '@shutwt/vue-crontab'

const crontabValue = ref('')
const showCrontab = ref(false)

const handleFill = (value) => {
  crontabValue.value = value
}
</script>
```

### 2. 单独使用内容组件

```vue
<template>
  <div>
    <Crontab 
      :value="crontabValue"
      @update:value="handleInput"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Crontab } from '@shutwt/vue-crontab'

const crontabValue = ref('')

const handleInput = (value) => {
  crontabValue.value = value
}
</script>
```

## 组件 API

### CrontabModal 组件

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| value | string | '' | 初始的 Cron 表达式 |
| render | boolean/string | true | 控制组件是否渲染 |

#### Emits

| 事件名 | 参数 | 说明 |
|-------|------|------|
| hide | - | 关闭弹窗时触发 |
| fill | value: string | 点击确定按钮时触发，返回完整的 Cron 表达式 |
| input | value: string | Cron 表达式变化时触发 |
| update:modelValue | value: string | 用于 v-model 双向绑定 |

### Crontab 组件

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| value | string | '' | 初始的 Cron 表达式 |

#### Emits

| 事件名 | 参数 | 说明 |
|-------|------|------|
| input | value: string | Cron 表达式变化时触发 |
| update:modelValue | value: string | 用于 v-model 双向绑定 |

## 目录结构

```pre
├── App.vue                      // 示例页面
├── main.ts                      // 入口文件
├── lib.ts                       // 组件库入口
├── assets                       // 静态资源:样式/图片等
│   └── global.css               // 全局样式变量
├── components                   // crontab组件们
│   ├── CrontabModal.vue         // 弹层组件
│   ├── Crontab.vue              // 主内容组件
│   ├── Crontab-Second.vue       // “秒”组件
│   ├── Crontab-Min.vue          // “分”组件
│   ├── Crontab-Hour.vue         // “时”组件
│   ├── Crontab-Day.vue          // “日”组件
│   ├── Crontab-Mouth.vue        // “月”组件
│   ├── Crontab-Week.vue         // “周”组件
│   ├── Crontab-Year.vue         // “年”组件
│   └── Crontab-Result.vue       // 结果预览组件
```

## 解析逻辑

解析 Crontab 表达式的核心逻辑位于 `Crontab-Result.vue` 组件中，主要通过以下步骤实现：

1. 将 Cron 表达式按空格分割成多个时间字段
2. 对每个字段进行解析，生成符合规则的时间数组
3. 根据当前时间和解析结果，计算出最近5次执行时间
4. 实时更新预览结果

## 样式定制

组件使用 CSS 变量定义主题样式，可以通过覆盖这些变量来自定义外观：

```css
:root {
  --crontab-color-primary: #4f46e5;          /* 主题色 */
  --crontab-color-background: #ffffff;        /* 背景色 */
  --crontab-color-surface: #f8fafc;          /* 表面色 */
  --crontab-color-text-primary: #1e293b;     /* 主文本色 */
  /* 更多样式变量请参考 src/assets/global.css */
}
```

## 效果截图

![效果截图](https://github.com/shuTwT/vue-crontab/blob/master/static/effect.png?raw=true)

## 开发与构建

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License
