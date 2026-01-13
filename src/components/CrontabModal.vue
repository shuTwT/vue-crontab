<template>
	<div class="crontab-warp" v-if="inited" role="dialog" aria-modal="true" aria-labelledby="crontab-title">
		<div class="crontab-main">
			<Crontab 
				:value="internalValue"
				@input="handleCrontabInput"
				@update:modelValue="handleCrontabInput"
			/>
			<div class="crontab-btns">
				<button type="button" @click='submitFill'>确定</button>
				<button type="button" @click='hidePopup'>取消</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * CronTab 弹层组件
 * 
 * 功能描述：
 * 提供弹层容器，包含Crontab编辑器和确定取消按钮
 * 
 * 核心功能：
 * 1. 弹层展示与隐藏
 * 2. 确定和取消按钮事件处理
 * 3. 内部集成Crontab编辑器
 */

import { ref, watch, onMounted } from 'vue'
import Crontab from './Crontab.vue'

/**
 * 组件 Props 定义
 * @property render - 控制组件是否渲染，默认为 true
 * @property value - 初始的 Cron 表达式字符串
 */
const props = withDefaults(defineProps<{
	render?: boolean | string
	value?: string
}>(), {
	render: true,
	value: '',
})

/**
 * 组件 Emits 定义
 * @event hide - 隐藏弹窗时触发
 * @event fill - 点击确定按钮时触发，返回完整的 Cron 表达式
 * @event input - Cron 表达式变化时触发
 * @event update:modelValue - 用于 v-model 双向绑定
 */
const emit = defineEmits<{
	hide: []
	fill: [value: string]
	input: [value: string]
	'update:modelValue': [value: string]
}>()

/**
 * 组件是否已初始化
 * 用于控制组件的渲染时机
 */
const inited = ref(false)

/**
 * 内部 Cron 表达式值
 * 用于同步和管理 Crontab 组件的值
 */
const internalValue = ref(props.value)

/**
 * 处理 Crontab 组件的输入事件
 * @param value - 新的 Cron 表达式值
 */
const handleCrontabInput = (value: string) => {
	internalValue.value = value;
	emit('input', value);
	emit('update:modelValue', value);
}

/**
 * 隐藏弹窗
 * 触发 hide 事件通知父组件隐藏弹窗
 */
const hidePopup = () => {
	emit('hide');
}

/**
 * 提交填充
 * 点击确定按钮时触发，将当前的 Cron 表达式返回给父组件
 */
const submitFill = () => {
	emit('fill', internalValue.value);
	hidePopup();
}

/**
 * 监听 render 属性变化
 * 控制组件的初始化时机
 */
watch(() => props.render, (value) => {
	if ((value === true || value === "true") && !inited.value) {
		inited.value = true;
	}
})

/**
 * 监听外部 value 属性变化
 * 同步到内部值
 */
watch(() => props.value, (newValue) => {
	if (newValue !== internalValue.value) {
		internalValue.value = newValue;
	}
})

/**
 * 组件初始化
 */
onMounted(() => {
	inited.value = props.render === true || props.render === 'true';
	internalValue.value = props.value;
})
</script>

<style scoped>
/* 弹层样式 */
.crontab-warp {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: var(--crontab-color-overlay);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: var(--crontab-z-index-modal);
	backdrop-filter: blur(4px);
	animation: fadeIn var(--crontab-transition-duration) var(--crontab-transition-timing);
}

/* 弹层淡出动画 */
.crontab-warp.fade-out {
	animation: fadeOut var(--crontab-transition-duration) var(--crontab-transition-timing) forwards;
}

@keyframes fadeOut {
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
		visibility: hidden;
	}
}

/* 弹窗主体样式 */
.crontab-main {
	position: relative;
	width: var(--crontab-width-main);
	max-width: 95%;
	max-height: 95vh;
	height: var(--crontab-height-main);
	background: var(--crontab-color-background);
	border-radius: var(--crontab-border-radius-lg);
	font-size: var(--crontab-font-size-base);
	overflow: hidden;
	box-shadow: var(--crontab-shadow-xl);
	transition: all var(--crontab-transition-all);
	display: flex;
	flex-direction: column;
	animation: slideUp var(--crontab-transition-duration) var(--crontab-transition-timing);
}

/* 弹窗主体淡出动画 */
.crontab-main.fade-out {
	animation: slideDown var(--crontab-transition-duration) var(--crontab-transition-timing) forwards;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px) scale(0.95);
		box-shadow: var(--crontab-shadow-md);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
		box-shadow: var(--crontab-shadow-xl);
	}
}

@keyframes slideDown {
	from {
		opacity: 1;
		transform: translateY(0) scale(1);
		box-shadow: var(--crontab-shadow-xl);
	}
	to {
		opacity: 0;
		transform: translateY(20px) scale(0.95);
		box-shadow: var(--crontab-shadow-md);
	}
}

/* 底部按钮区域样式 */
.crontab-btns {
	padding: var(--crontab-spacing-xl) var(--crontab-spacing-2xl);
	text-align: center;
	border-top: 1px solid var(--crontab-color-border);
	background: var(--crontab-color-surface);
	display: flex;
	gap: var(--crontab-spacing-lg);
	justify-content: center;
}

/* 按钮样式 */
.crontab-btns button {
	height: 40px;
	width: var(--crontab-width-btn);
	margin: 0 var(--crontab-spacing-sm);
	border: none;
	border-radius: var(--crontab-border-radius-md);
	color: var(--crontab-color-text-primary);
	cursor: pointer;
	transition: all var(--crontab-transition-all);
	font-size: var(--crontab-font-size-sm);
	font-weight: var(--crontab-font-weight-medium);
	font-family: var(--crontab-font-family);
	outline: none;
	position: relative;
	overflow: hidden;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	user-select: none;
	white-space: nowrap;
	background: var(--crontab-color-surface);
	border: 1px solid var(--crontab-color-border);
}

.crontab-btns button:hover {
	background: var(--crontab-color-surface-hover);
	border-color: var(--crontab-color-border-focus);
	transform: translateY(-2px);
	box-shadow: var(--crontab-shadow-md);
}

.crontab-btns button:active {
	transform: translateY(0);
	box-shadow: var(--crontab-shadow-sm);
}

.crontab-btns button:focus {
	outline: none;
	box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

/* 主要按钮样式 */
.crontab-btns button:first-child {
	background: var(--crontab-color-primary);
	color: var(--crontab-color-background);
	border-color: var(--crontab-color-primary);
}

.crontab-btns button:first-child:hover {
	background: var(--crontab-color-primary-hover);
	border-color: var(--crontab-color-primary-hover);
	box-shadow: var(--crontab-shadow-lg);
}

.crontab-btns button:first-child:active {
	background: var(--crontab-color-primary-active);
	border-color: var(--crontab-color-primary-active);
	box-shadow: var(--crontab-shadow-md);
}

.crontab-btns button:first-child:focus {
	box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

/* 次要按钮样式 */
.crontab-btns button:last-child {
	background: var(--crontab-color-background);
	color: var(--crontab-color-text-primary);
	border: 1px solid var(--crontab-color-border);
}

.crontab-btns button:last-child:hover {
	background: var(--crontab-color-surface);
	border-color: var(--crontab-color-border-focus);
}

.crontab-btns button:last-child:active {
	background: var(--crontab-color-surface-active);
	border-color: var(--crontab-color-border);
}

/* 按钮禁用样式 */
.crontab-btns button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

.crontab-btns button:disabled:hover {
	transform: none;
	box-shadow: none;
}

/* 淡入动画 */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.crontab-main {
		width: 95%;
		height: auto;
		max-height: 90vh;
		margin: 20px auto;
		top: 0;
		transform: none;
	}
	
	.crontab-btns {
		padding: var(--crontab-spacing-lg);
		flex-direction: column;
	}
	
	.crontab-btns button {
		width: 100%;
		margin: 0 0 var(--crontab-spacing-sm) 0;
	}
	
	.crontab-btns button:last-child {
		margin-bottom: 0;
	}
}

@media (max-width: 480px) {
	.crontab-main {
		width: 100%;
		max-width: 100%;
		max-height: 100vh;
		border-radius: 0;
	}
}
</style>