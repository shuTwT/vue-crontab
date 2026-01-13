<template>
	<div class="crontab-warp" v-if="inited" role="dialog" aria-modal="true" aria-labelledby="crontab-title">
		<div class="crontab-main">
			<ul class="crontab-title" role="tablist" aria-label="时间维度选择">
				<li id="crontab-title" role="presentation">规则类型</li>
				<li 
					v-for='(item, index) of tabTitles' 
					:key="index"
					:id="`tab-${index}`"
					:class='{ on: index === tabActive }' 
					@click='tabCheck(index)'
					@keydown.enter='tabCheck(index)'
					@keydown.space='tabCheck(index)'
					role="tab"
					:aria-selected="index === tabActive"
					:aria-controls="`tabpanel-${index}`"
					tabindex="0"
				>{{ item }}
				</li>
			</ul>
			<ul class="crontab-body">
				<CrontabSecond 
					:class='{ on: tabActive === 0 }' 
					:init="contabValueObj.second"
					@updata='updataContabValue' 
					:check='checkNumber'
					role="tabpanel"
					:id="`tabpanel-0`"
					:aria-labelledby="`tab-0`"
					:aria-hidden="tabActive !== 0"
				></CrontabSecond>
				<CrontabMin 
					:class='{ on: tabActive === 1 }' 
					:init="contabValueObj.min" 
					@updata='updataContabValue'
					:check='checkNumber'
					role="tabpanel"
					:id="`tabpanel-1`"
					:aria-labelledby="`tab-1`"
					:aria-hidden="tabActive !== 1"
				></CrontabMin>
				<CrontabHour 
					:class='{ on: tabActive === 2 }' 
					:init="contabValueObj.hour" 
					@updata='updataContabValue'
					:check='checkNumber'
					role="tabpanel"
					:id="`tabpanel-2`"
					:aria-labelledby="`tab-2`"
					:aria-hidden="tabActive !== 2"
				></CrontabHour>
				<CrontabDay 
					:class='{ on: tabActive === 3 }' 
					:init="contabValueObj.day" 
					@updata='updataContabValue'
					:check='checkNumber' 
					:week='contabValueObj.week'
					role="tabpanel"
					:id="`tabpanel-3`"
					:aria-labelledby="`tab-3`"
					:aria-hidden="tabActive !== 3"
				></CrontabDay>
				<CrontabMouth 
					:class='{ on: tabActive === 4 }' 
					:init="contabValueObj.mouth" 
					@updata='updataContabValue'
					:check='checkNumber'
					role="tabpanel"
					:id="`tabpanel-4`"
					:aria-labelledby="`tab-4`"
					:aria-hidden="tabActive !== 4"
				></CrontabMouth>
				<CrontabWeek 
					:class='{ on: tabActive === 5 }' 
					:init="contabValueObj.week" 
					@updata='updataContabValue'
					:check='checkNumber' 
					:day='contabValueObj.day'
					role="tabpanel"
					:id="`tabpanel-5`"
					:aria-labelledby="`tab-5`"
					:aria-hidden="tabActive !== 5"
				></CrontabWeek>
				<CrontabYear 
					:class='{ on: tabActive === 6 }' 
					:init="contabValueObj.year" 
					@updata='updataContabValue'
					:check='checkNumber'
					role="tabpanel"
					:id="`tabpanel-6`"
					:aria-labelledby="`tab-6`"
					:aria-hidden="tabActive !== 6"
				></CrontabYear>
			</ul>
			<div class="crontab-result">
				<p class="crontab-result__title">时间表达式</p>
				<table>
					<thead>
						<tr>
							<th v-for='item of tabTitles' width='40'>{{ item }}</th>
							<th>crontab完整表达式</th>
						</tr>

					</thead>
					<tbody>
						<tr>
							<td><span>{{ contabValueObj.second }}</span></td>
							<td><span>{{ contabValueObj.min }}</span></td>
							<td><span>{{ contabValueObj.hour }}</span></td>
							<td><span>{{ contabValueObj.day }}</span></td>
							<td><span>{{ contabValueObj.mouth }}</span></td>
							<td><span>{{ contabValueObj.week }}</span></td>
							<td><span>{{ contabValueObj.year }}</span></td>
							<td><span>{{ contabValueString }}</span></td>
						</tr>
					</tbody>
				</table>
			</div>
			<CrontabResult :ex='contabValueString'></CrontabResult>
			<div class="crontab-btns">
				<button type="button" @click='submitFill'>确定</button>
				<button type="button" @click='hidePopup'>取消</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * CronTab 主组件
 * 
 * 功能描述：
 * 提供可视化的 Cron 表达式编辑器界面，支持秒、分钟、小时、日、月、周、年七个维度的配置。
 * 用户可以通过选项卡切换不同时间维度的配置，实时预览生成的 Cron 表达式，并查看最近5次执行时间。
 * 
 * 核心功能：
 * 1. Tab 切换：支持秒、分钟、小时、日、月、周、年七个维度的配置
 * 2. 实时预览：实时显示当前配置的 Cron 表达式
 * 3. 执行时间预览：计算并显示最近5次执行时间
 * 4. 数据校验：对用户输入的数值进行范围校验
 * 5. 互斥规则：日和周字段互斥，不能同时设置
 */

import { ref, computed, watch, onMounted } from 'vue'
import CrontabSecond from './Crontab-Second.vue'
import CrontabMin from './Crontab-Min.vue'
import CrontabHour from './Crontab-Hour.vue'
import CrontabDay from './Crontab-Day.vue'
import CrontabMouth from './Crontab-Mouth.vue'
import CrontabWeek from './Crontab-Week.vue'
import CrontabYear from './Crontab-Year.vue'
import CrontabResult from './Crontab-Result.vue'

/**
 * Cron 表达式值对象接口
 * 定义了 Cron 表达式中各个字段的类型
 */
interface ContabValueObj {
	second: string  // 秒字段 (0-59)
	min: string     // 分钟字段 (0-59)
	hour: string    // 小时字段 (0-23)
	day: string     // 日期字段 (1-31)
	mouth: string   // 月份字段 (1-12)
	week: string    // 星期字段 (1-7 或 ?)
	year: string    // 年份字段 (可选)
}

/**
 * 组件 Props 定义
 * @property render - 控制组件是否渲染，默认为 true
 * @property value - 初始的 Cron 表达式字符串，格式如 "0 0 12 * * ?"
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
 * Tab 标题数组
 * 定义了七个时间维度的显示名称
 */
const tabTitles = ["秒", "分钟", "小时", "日", "月", "周", "年"]

/**
 * 当前激活的 Tab 索引
 * 0: 秒, 1: 分钟, 2: 小时, 3: 日, 4: 月, 5: 周, 6: 年
 */
const tabActive = ref(0)

/**
 * 当前索引（未使用，保留用于兼容性）
 */
// const myindex = ref(0)

/**
 * Cron 表达式各字段的当前值
 * 存储用户在各个维度配置的值
 */
const contabValueObj = ref<ContabValueObj>({
	second: '*',   // 默认每秒
	min: '*',      // 默认每分钟
	hour: '*',     // 默认每小时
	day: '*',      // 默认每天
	mouth: '*',    // 默认每月
	week: '?',     // 默认不指定周（日和周互斥）
	year: '',      // 默认不指定年份
})

/**
 * 组件是否已初始化
 * 用于控制组件的渲染时机
 */
const inited = ref(false)

/**
 * 切换 Tab
 * @param index - 要切换到的 Tab 索引
 */
const tabCheck = (index: number) => {
	tabActive.value = index;
}

/**
 * 更新 Cron 表达式字段值
 * 由子组件调用，用于更新特定字段的值
 * @param name - 字段名称（second, min, hour, day, mouth, week, year）
 * @param value - 字段的新值
 */
const updataContabValue = (name: string, value: string) => {
	(contabValueObj.value as any)[name] = value;
}

/**
 * 数值范围校验函数
 * 确保数值在指定的最小值和最大值之间
 * @param value - 需要校验的数值
 * @param minLimit - 最小值限制
 * @param maxLimit - 最大值限制
 * @returns 校验后的数值（在范围内）
 */
const checkNumber = (value: number, minLimit: number, maxLimit: number): number => {
	value = Math.floor(value);
	if (value < minLimit) {
		value = minLimit
	} else if (value > maxLimit) {
		value = maxLimit
	}
	return value;
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
	emit('fill', contabValueString.value);
	hidePopup();
}

/**
 * 计算属性：生成完整的 Cron 表达式字符串
 * 将各个字段的值拼接成标准的 Cron 表达式格式
 * 格式：秒 分钟 小时 日 月 周 [年]
 * 示例：0 0 12 * * ?
 */
const contabValueString = computed(() => {
	let obj = contabValueObj.value;
	let str = obj.second + " " + obj.min + " " + obj.hour + " " + obj.day + " " + obj.mouth + " " + obj.week + (obj.year === "" ? "" : " " + obj.year)
	return str;
})

/**
 * 监听 Cron 表达式变化
 * 当表达式变化时，触发 input 和 update:modelValue 事件
 * 用于实现 v-model 双向绑定
 */
watch(contabValueString, (value) => {
	emit('input', value);
	emit('update:modelValue', value);
})

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
 * 组件挂载时的初始化逻辑
 * 1. 根据 render 属性设置初始化状态
 * 2. 如果有传入的 value，解析并填充到各个字段
 * 3. 如果没有传入 value，使用默认值并触发 input 事件
 */
onMounted(() => {
	inited.value = props.render === true || props.render === 'true';
	if (props.value === '') {
		// 没有传入初始值，使用默认值
		emit('input', contabValueString.value);
	} else {
		// 解析传入的 Cron 表达式并填充到各个字段
		let array = props.value.split(' ');
		if (array.length >= 6) {
			contabValueObj.value.second = array[0];
			contabValueObj.value.min = array[1];
			contabValueObj.value.hour = array[2];
			contabValueObj.value.day = array[3];
			contabValueObj.value.mouth = array[4];
			contabValueObj.value.week = array[5];
			contabValueObj.value.year = array[6] || '';
		}
	}
})
</script>

<style scoped>
/* 全局重置和基础样式 */
* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}


/* 主容器样式 */
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

/* 主容器淡出动画 */
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

/* 标题栏样式 */
.crontab-title {
	display: flex;
	align-items: center;
	background: var(--crontab-color-surface);
	border-bottom: 1px solid var(--crontab-color-border);
	line-height: var(--crontab-line-height-title);
	padding: 0 var(--crontab-spacing-lg);
	font-weight: var(--crontab-font-weight-semibold);
	color: var(--crontab-color-text-primary);
	gap: var(--crontab-spacing-md);
}

.crontab-title li {
	flex-shrink: 0;
	cursor: pointer;
	padding: var(--crontab-spacing-sm) var(--crontab-spacing-md);
	border-radius: var(--crontab-border-radius-md);
	transition: all var(--crontab-transition-all);
	color: var(--crontab-color-text-secondary);
	font-size: var(--crontab-font-size-sm);
	font-weight: var(--crontab-font-weight-medium);
	position: relative;
	overflow: hidden;
	min-width: var(--crontab-width-tab);
	text-align: center;
}

.crontab-title li:first-child {
	flex-shrink: 0;
	cursor: default;
	color: var(--crontab-color-text-primary);
	font-weight: var(--crontab-font-weight-semibold);
	width: var(--crontab-width-tab-first);
	text-align: left;
	padding: var(--crontab-spacing-sm) 0;
	border-radius: 0;
	background: transparent;
}

.crontab-title li:not(:first-child):hover {
	background: var(--crontab-color-surface-hover);
	color: var(--crontab-color-text-primary);
	transform: translateY(-1px);
}

.crontab-title .on,
.crontab-title li.on:hover {
	background: var(--crontab-color-primary);
	color: var(--crontab-color-background);
	transform: translateY(0);
	min-width: var(--crontab-width-tab);
}

/* 内容区域样式 */
.crontab-body {
	padding: var(--crontab-padding-body);
	line-height: var(--crontab-line-height-base);
	height: var(--crontab-height-body);
	overflow-y: auto;
	flex: 1;
	background: var(--crontab-color-background);
}

.crontab-body li {
	display: none;
	opacity: 0;
	transform: translateY(10px);
	transition: all var(--crontab-transition-duration) var(--crontab-transition-timing);
}

.crontab-body .on {
	display: block;
	opacity: 1;
	transform: translateY(0);
	animation: slideInFromBottom var(--crontab-transition-duration) var(--crontab-transition-timing);
}

@keyframes slideInFromBottom {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
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

/* 结果展示区域样式 */
.crontab-result {
	line-height: var(--crontab-line-height-base);
	margin: var(--crontab-margin-top-result) var(--crontab-spacing-lg) 0;
	padding: var(--crontab-padding-result);
	border: 1px solid var(--crontab-color-border);
	position: relative;
	background: var(--crontab-color-surface);
	border-radius: var(--crontab-border-radius-md);
	transition: all var(--crontab-transition-all);
}

.crontab-result:hover {
	border-color: var(--crontab-color-border-input);
	box-shadow: var(--crontab-shadow-sm);
}

.crontab-result__title {
	position: absolute;
	top: var(--crontab-position-title-top);
	left: 50%;
	transform: translateX(-50%);
	width: auto;
	padding: 0 var(--crontab-spacing-lg);
	font-size: var(--crontab-font-size-sm);
	font-weight: var(--crontab-font-weight-semibold);
	margin-left: 0;
	text-align: center;
	line-height: 28px;
	background: var(--crontab-color-surface);
	color: var(--crontab-color-text-primary);
	border-radius: var(--crontab-border-radius-full);
	border: 1px solid var(--crontab-color-border);
	box-shadow: var(--crontab-shadow-sm);
}

.crontab-result table {
	width: 100%;
	border-collapse: collapse;
	font-size: var(--crontab-font-size-sm);
	overflow: hidden;
	border-radius: var(--crontab-border-radius-sm);
}

.crontab-result th {
	background: var(--crontab-color-surface);
	color: var(--crontab-color-text-secondary);
	font-weight: var(--crontab-font-weight-medium);
	padding: var(--crontab-spacing-sm) var(--crontab-spacing-xs);
	text-align: center;
	font-size: var(--crontab-font-size-xs);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	border-bottom: 1px solid var(--crontab-color-border);
}

.crontab-result td {
	padding: var(--crontab-spacing-sm) var(--crontab-spacing-xs);
	text-align: center;
	border-bottom: 1px solid var(--crontab-color-border-light);
}

.crontab-result table span {
	display: block;
	width: 100%;
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	line-height: var(--crontab-line-height-cell);
	height: var(--crontab-height-cell);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	background: var(--crontab-color-background);
	border-radius: var(--crontab-border-radius-sm);
	padding: 0 var(--crontab-spacing-sm);
	color: var(--crontab-color-text-primary);
	transition: all var(--crontab-transition-all);
	border: 1px solid transparent;
}

.crontab-result table span:hover {
	background: var(--crontab-color-surface-hover);
	border-color: var(--crontab-color-border-input);
	color: var(--crontab-color-primary);
	box-shadow: inset 0 0 0 1px var(--crontab-color-primary);
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
	
	.crontab-title {
		padding: var(--crontab-spacing-xs) var(--crontab-spacing-md);
		flex-wrap: wrap;
		gap: var(--crontab-spacing-xs);
		justify-content: flex-start;
	}
	
	.crontab-title li {
		padding: var(--crontab-spacing-xs) var(--crontab-spacing-sm);
		font-size: var(--crontab-font-size-xs);
		min-width: auto;
		flex: 1;
		text-align: center;
		margin: 0;
	}
	
	.crontab-title li:first-child {
		width: 100%;
		text-align: left;
		padding: var(--crontab-spacing-xs) 0;
		border-bottom: 1px solid var(--crontab-color-border);
		margin-bottom: var(--crontab-spacing-xs);
	}
	
	.crontab-body {
		padding: var(--crontab-spacing-lg) var(--crontab-spacing-md);
		height: auto;
		max-height: 300px;
	}
	
	.crontab-check-warp {
		width: 100%;
		padding-left: 0;
		gap: var(--crontab-spacing-xs);
	}
	
	.crontab-check-warp label {
		width: calc(33.333% - var(--crontab-spacing-xs));
		font-size: var(--crontab-font-size-xs);
	}
	
	.crontab-check-short label {
		width: calc(50% - var(--crontab-spacing-xs));
	}
	
	.crontab-result {
		margin: var(--crontab-spacing-lg) var(--crontab-spacing-md) 0;
		padding: var(--crontab-spacing-md);
	}
	
	.crontab-result table {
		overflow-x: auto;
		display: block;
	}
	
	.crontab-result th,
	.crontab-result td {
		padding: var(--crontab-spacing-xs);
		font-size: var(--crontab-font-size-xs);
		white-space: nowrap;
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
	
	.crontab-title li {
		padding: 0 var(--crontab-spacing-xs);
		font-size: var(--crontab-font-size-xs);
	}
	
	.crontab-check-warp label {
		width: calc(50% - var(--crontab-spacing-xs));
	}
	
	.crontab-check-short label {
		width: calc(100% - var(--crontab-spacing-xs));
	}
	
	.crontab-body input[type="number"] {
		width: calc(25% - var(--crontab-spacing-xs));
		min-width: 50px;
	}
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
	:root {
		--crontab-color-border: #000000;
		--crontab-color-border-input: #000000;
		--crontab-color-text-primary: #000000;
		--crontab-color-text-secondary: #000000;
	}
	
	.crontab-body input[type="radio"],
	.crontab-body input[type="checkbox"] {
		border-width: 3px;
	}
	
	.crontab-body input[type="number"] {
		border-width: 2px;
	}
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
</style>
