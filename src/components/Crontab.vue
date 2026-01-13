<template>
	<div class="crontab-warp" v-if="inited">
		<div class="crontab-main">
			<ul class="crontab-title">
				<li>规则类型</li>
				<li v-for='(item, index) of tabTitles' :class='{ on: index === tabActive }' @click='tabCheck(index)'>{{
					item }}
				</li>
			</ul>
			<ul class="crontab-body">
				<CrontabSecond :class='{ on: tabActive === 0 }' :init="contabValueObj.second"
					@updata='updataContabValue' :check='checkNumber'></CrontabSecond>
				<CrontabMin :class='{ on: tabActive === 1 }' :init="contabValueObj.min" @updata='updataContabValue'
					:check='checkNumber'></CrontabMin>
				<CrontabHour :class='{ on: tabActive === 2 }' :init="contabValueObj.hour" @updata='updataContabValue'
					:check='checkNumber'></CrontabHour>
				<CrontabDay :class='{ on: tabActive === 3 }' :init="contabValueObj.day" @updata='updataContabValue'
					:check='checkNumber' :week='contabValueObj.week'></CrontabDay>
				<CrontabMouth :class='{ on: tabActive === 4 }' :init="contabValueObj.mouth" @updata='updataContabValue'
					:check='checkNumber'></CrontabMouth>
				<CrontabWeek :class='{ on: tabActive === 5 }' :init="contabValueObj.week" @updata='updataContabValue'
					:check='checkNumber' :day='contabValueObj.day'></CrontabWeek>
				<CrontabYear :class='{ on: tabActive === 6 }' :init="contabValueObj.year" @updata='updataContabValue'
					:check='checkNumber'></CrontabYear>
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
@import '../assets/popup.css';

.crontab-warp {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: var(--crontab-color-overlay);
}

.crontab-main {
	position: relative;
	width: var(--crontab-width-main);
	height: var(--crontab-height-main);
	top: 50%;
	margin: var(--crontab-margin-top-main) auto 0;
	background: var(--crontab-color-background);
	border-radius: var(--crontab-border-radius);
	font-size: var(--crontab-font-size-base);
	overflow: hidden;
}

.crontab-title {
	overflow: hidden;
	line-height: var(--crontab-line-height-title);
	padding-top: var(--crontab-margin-top-title);
	background: var(--crontab-color-title-background);
}

.crontab-title li {
	float: left;
	width: var(--crontab-width-tab);
	margin: 0 var(--crontab-spacing-xs);
	display: inline;
	text-align: center;
	border-top-left-radius: var(--crontab-border-radius-tab);
	border-top-right-radius: var(--crontab-border-radius-tab);
}

.crontab-title li:first-child {
	width: var(--crontab-width-tab-first);
}

.crontab-title li:not(:first-child):hover {
	background: var(--crontab-color-title-hover);
	cursor: pointer;
	transition: background-color var(--crontab-transition-duration) var(--crontab-transition-timing);
}

.crontab-title .on,
.crontab-title li.on:hover {
	background: var(--crontab-color-title-active);
}

.crontab-body {
	padding: var(--crontab-padding-body);
	line-height: var(--crontab-line-height-base);
	height: var(--crontab-height-body);
}

.crontab-body li {
	display: none;
}

.crontab-body .on {
	display: block;
}

.crontab-body input[type="radio"] {
	position: relative;
	top: var(--crontab-position-radio-top);
	margin-right: var(--crontab-margin-radio);
}

.crontab-body input[type="number"] {
	margin: var(--crontab-margin-input);
	padding: var(--crontab-padding-input);
	width: var(--crontab-width-input);
	color: var(--crontab-color-text-secondary);
}

.crontab-body input[type="checkbox"] {
	position: relative;
	top: var(--crontab-position-checkbox-top);
	margin: var(--crontab-margin-checkbox);
}

.crontab-input-warp {
	margin-top: var(--crontab-margin-top-input-warp);
}

.crontab-check-warp {
	width: var(--crontab-width-check-warp);
	padding-left: var(--crontab-margin-left-check-warp);
	overflow: hidden;
}

.crontab-check-warp label {
	float: left;
	width: var(--crontab-width-check-label);
}

.crontab-check-short label {
	width: var(--crontab-width-check-label-short);
}

.crontab-result {
	line-height: var(--crontab-line-height-base);
	margin: var(--crontab-margin-top-result) var(--crontab-spacing-lg) 0;
	padding: var(--crontab-padding-result);
	border: 1px solid var(--crontab-color-border);
	position: relative;
}

.crontab-result__title {
	position: absolute;
	top: var(--crontab-position-title-top);
	left: 50%;
	width: 140px;
	font-size: var(--crontab-font-size-title);
	margin-left: var(--crontab-margin-left-title);
	text-align: center;
	line-height: 30px;
	background: var(--crontab-color-background);
}

.crontab-result table {
	text-align: center;
	width: 100%;
	margin: 0 auto;
}

.crontab-result table span {
	display: block;
	width: 100%;
	font-family: arial;
	line-height: var(--crontab-line-height-cell);
	height: var(--crontab-height-cell);
	white-space: nowrap;
	overflow: hidden;
	border: 1px solid var(--crontab-color-border-light);
}

.crontab-result-scroll {
	font-size: var(--crontab-font-size-base);
	line-height: var(--crontab-line-height-base);
	height: var(--crontab-height-result-scroll);
	overflow-y: scroll;
}

.crontab-btns {
	padding-top: var(--crontab-margin-top-btns);
	text-align: center;
}

.crontab-btns button {
	height: 30px;
	width: var(--crontab-width-btn);
	margin: 0 var(--crontab-spacing-sm);
	background-color: var(--crontab-color-title-background);
	border: 1px solid var(--crontab-color-border-light);
	border-radius: var(--crontab-border-radius);
	color: var(--crontab-color-text-primary);
	cursor: pointer;
	transition: all var(--crontab-transition-duration) var(--crontab-transition-timing);
}

.crontab-btns button:hover {
	background-color: var(--crontab-color-title-hover);
	border-color: var(--crontab-color-border);
}

.crontab-btns button:first-child {
	background-color: var(--crontab-color-text-secondary);
	color: var(--crontab-color-background);
}

.crontab-btns button:first-child:hover {
	background-color: var(--crontab-color-text-primary);
}
</style>
