<template>
	<li>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="1" />秒，允许的通配符[, - * /]
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="2" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />秒
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="3" />从<input type="number" v-model='average01' />秒开始，每<input type="number" v-model='average02' />秒执行一次
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="4" />指定
			<div class="crontab-check-warp">
				<label v-for='item in 60'><input type="checkbox" :value="item-1" v-model='checkboxList'>{{item-1 < 10 ? "0"+(item-1):item-1}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
/**
 * CronTab 秒字段配置组件
 * 
 * 功能描述：
 * 提供 Cron 表达式中秒字段的配置界面，支持四种配置模式：
 * 1. 每秒：使用通配符 *
 * 2. 周期：指定一个时间范围，如 5-10 表示第5秒到第10秒
 * 3. 间隔：从某秒开始，每隔多少秒执行一次，如 0/5 表示从0秒开始，每5秒执行一次
 * 4. 指定：手动选择具体的秒数，如 1,5,10 表示第1、5、10秒
 * 
 * 取值范围：0-59
 * 允许的通配符：, - * /
 */

import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件 Props 定义
 * @property check - 数值范围校验函数，由父组件传入
 * @property init - 初始的秒字段值，如 "*"、"5-10"、"0/5"、"1,5,10"
 */
const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	init: string
}>()

/**
 * 组件 Emits 定义
 * @event updata - 当秒字段值变化时触发，返回字段名称和新的值
 */
const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

/**
 * 当前选中的配置模式
 * '1': 每秒 (*)
 * '2': 周期 (如 5-10)
 * '3': 间隔 (如 0/5)
 * '4': 指定 (如 1,5,10)
 */
const radioValue = ref('1')

/**
 * 周期模式的起始值
 * 当 radioValue 为 '2' 时有效
 */
const cycle01 = ref(1)

/**
 * 周期模式的结束值
 * 当 radioValue 为 '2' 时有效
 */
const cycle02 = ref(2)

/**
 * 间隔模式的起始值
 * 当 radioValue 为 '3' 时有效
 */
const average01 = ref(0)

/**
 * 间隔模式的步长值
 * 当 radioValue 为 '3' 时有效
 */
const average02 = ref(1)

/**
 * 指定模式选中的秒数列表
 * 当 radioValue 为 '4' 时有效
 * 存储用户通过复选框选择的秒数
 */
const checkboxList = ref<string[]>([])

/**
 * 计算属性：生成周期模式的 Cron 表达式
 * 格式：起始值-结束值，如 "5-10"
 * 自动校验数值范围在 0-59 之间
 */
const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 0, 59)
	cycle02.value = props.check(cycle02.value, 0, 59)
	return cycle01.value + '-' + cycle02.value
})

/**
 * 计算属性：生成间隔模式的 Cron 表达式
 * 格式：起始值/步长，如 "0/5"
 * 自动校验起始值范围在 0-59 之间，步长范围在 1-59 之间
 */
const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 0, 59)
	average02.value = props.check(average02.value, 1, 59)
	return average01.value + '/' + average02.value
})

/**
 * 计算属性：生成指定模式的 Cron 表达式
 * 格式：逗号分隔的秒数，如 "1,5,10"
 * 如果没有选择任何秒数，返回 "*"
 */
const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str === '' ? '*' : str
})

/**
 * 处理配置模式切换
 * 根据当前选中的模式，生成对应的 Cron 表达式并通知父组件
 */
const radioChange = () => {
	switch(radioValue.value){
		case '1':
			// 每秒
			emit('updata', 'second', '*')
			break
		case '2':
			// 周期模式
			emit('updata', 'second', cycleTotal.value)
			break
		case '3':
			// 间隔模式
			emit('updata', 'second', averageTotal.value)
			break
		case '4':
			// 指定模式
			emit('updata', 'second', checkboxString.value)
			break
	}
}

/**
 * 处理周期模式数值变化
 * 仅在当前模式为周期模式时更新父组件
 */
const cycleChange = () => {
	if(radioValue.value === '2'){
		emit('updata', 'second', cycleTotal.value)
	}
}

/**
 * 处理间隔模式数值变化
 * 仅在当前模式为间隔模式时更新父组件
 */
const averageChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'second', averageTotal.value)
	}
}

/**
 * 处理指定模式复选框变化
 * 仅在当前模式为指定模式时更新父组件
 */
const checkboxChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'second', checkboxString.value)
	}
}

/**
 * 监听配置模式变化
 */
watch(radioValue, radioChange)

/**
 * 监听周期表达式变化
 */
watch(cycleTotal, cycleChange)

/**
 * 监听间隔表达式变化
 */
watch(averageTotal, averageChange)

/**
 * 监听指定表达式变化
 */
watch(checkboxString, checkboxChange)

/**
 * 组件挂载时的初始化逻辑
 * 解析传入的 init 值，设置对应的配置模式和数值
 */
onMounted(() => {
	// 尝试解析为周期模式 (如 "5-10")
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '2'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	
	// 尝试解析为间隔模式 (如 "0/5")
	const averageArr = props.init.split('/')
	if(averageArr.length === 2){
		radioValue.value = '3'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	
	// 尝试解析为指定模式 (如 "1,5,10")
	if(props.init !== '*'){
		radioValue.value = '4'
		const list = props.init.split(',')
		checkboxList.value = list
	}
	// 如果是 "*"，则保持默认的 radioValue = '1'（每秒模式）
})
</script>

<style scoped>
/* 秒组件样式 */
.crontab-input-warp {
	margin-top: var(--crontab-spacing-lg);
	padding: var(--crontab-spacing-md) 0;
	transition: all var(--crontab-transition-all);
}

.crontab-input-warp:hover {
	background: var(--crontab-color-surface-hover);
	border-radius: var(--crontab-border-radius-sm);
	margin: var(--crontab-spacing-lg) -12px 0;
	padding: var(--crontab-spacing-md) 12px;
}

/* 第一个输入组去掉上边距 */
.crontab-input-warp:first-child {
	margin-top: 0;
}

/* 复选框组样式 */
.crontab-check-warp {
	width: var(--crontab-width-check-warp);
	max-width: 100%;
	padding-left: var(--crontab-margin-left-check-warp);
	overflow: hidden;
	display: flex;
	flex-wrap: wrap;
	gap: var(--crontab-spacing-md);
	margin-top: var(--crontab-spacing-sm);
	padding: var(--crontab-spacing-xs) 0;
}

.crontab-check-warp label {
	float: left;
	width: var(--crontab-width-check-label);
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: var(--crontab-spacing-sm) var(--crontab-spacing-md);
	border-radius: var(--crontab-border-radius-sm);
	transition: all var(--crontab-transition-all);
	font-size: var(--crontab-font-size-sm);
	color: var(--crontab-color-text-secondary);
	line-height: var(--crontab-line-height-lg);
}

.crontab-check-warp label:hover {
	background: var(--crontab-color-surface-hover);
	color: var(--crontab-color-text-primary);
	transform: translateY(-1px);
}

.crontab-check-short label {
	width: var(--crontab-width-check-label-short);
}

/* Radio 按钮样式 */
input[type="radio"] {
	position: relative;
	top: var(--crontab-position-radio-top);
	margin-right: var(--crontab-margin-radio);
	appearance: none;
	width: 16px;
	height: 16px;
	border: 2px solid var(--crontab-color-border-input);
	border-radius: 50%;
	outline: none;
	cursor: pointer;
	transition: all var(--crontab-transition-all);
	background: var(--crontab-color-background);
}

input[type="radio"]:hover {
	border-color: var(--crontab-color-primary);
	transform: scale(1.1);
}

input[type="radio"]:checked {
	border-color: var(--crontab-color-primary);
	background: var(--crontab-color-primary);
}

input[type="radio"]:checked::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--crontab-color-background);
}

/* Checkbox 样式 */
input[type="checkbox"] {
	position: relative;
	top: var(--crontab-position-checkbox-top);
	margin: var(--crontab-margin-checkbox);
	appearance: none;
	width: 16px;
	height: 16px;
	border: 2px solid var(--crontab-color-border-input);
	border-radius: var(--crontab-border-radius-sm);
	outline: none;
	cursor: pointer;
	transition: all var(--crontab-transition-all);
	background: var(--crontab-color-background);
}

input[type="checkbox"]:hover {
	border-color: var(--crontab-color-primary);
	transform: scale(1.1);
}

input[type="checkbox"]:checked {
	border-color: var(--crontab-color-primary);
	background: var(--crontab-color-primary);
}

input[type="checkbox"]:checked::after {
	content: '✓';
	position: absolute;
	top: -3px;
	left: 1px;
	font-size: 12px;
	color: var(--crontab-color-background);
	font-weight: bold;
}

/* Number Input 样式 */
input[type="number"] {
	margin: var(--crontab-margin-input);
	padding: var(--crontab-padding-input);
	width: var(--crontab-width-input);
	color: var(--crontab-color-text-primary);
	border: 1px solid var(--crontab-color-border-input);
	border-radius: var(--crontab-border-radius-sm);
	outline: none;
	transition: all var(--crontab-transition-all);
	font-size: var(--crontab-font-size-sm);
	font-family: var(--crontab-font-family);
	background: var(--crontab-color-background);
}

input[type="number"]:hover {
	border-color: var(--crontab-color-border-focus);
	box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

input[type="number"]:focus {
	border-color: var(--crontab-color-primary);
	box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
	color: var(--crontab-color-text-primary);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	opacity: 1;
	background: var(--crontab-color-surface);
	border-radius: var(--crontab-border-radius-sm);
	cursor: pointer;
	transition: all var(--crontab-transition-all);
}

input[type="number"]::-webkit-inner-spin-button:hover,
input[type="number"]::-webkit-outer-spin-button:hover {
	background: var(--crontab-color-surface-hover);
}
</style>
