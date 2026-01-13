<template>
	<li>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="1" />日，允许的通配符[, - * / L M]
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="2" />不指定
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="3" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />日
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="4" />从<input type="number" v-model='average01' />号开始，每<input type="number" v-model='average02' />日执行一次
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="5" />每月<input type="number" v-model='workday' />号最近的那个工作日
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="6" />本月最后一天
		</div>
		<div class="crontab-input-warp">
			<input type="radio" v-model='radioValue' value="7" />指定
			<div class="crontab-check-warp crontab-check-short">
				<label v-for='item in 31'><input type="checkbox" :value="item" v-model='checkboxList'>{{item < 10 ? "0"+(item):item}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
/**
 * CronTab 日期字段配置组件
 * 
 * 功能描述：
 * 提供 Cron 表达式中日期字段的配置界面，支持七种配置模式：
 * 1. 每天：使用通配符 *
 * 2. 不指定：使用通配符 ?（与周字段互斥）
 * 3. 周期：指定一个日期范围，如 5-10 表示第5天到第10天
 * 4. 间隔：从某天开始，每隔多少天执行一次，如 1/2 表示从1号开始，每2天执行一次
 * 5. 工作日：指定某号最近的工作日，如 15W 表示15号最近的工作日
 * 6. 月末：本月最后一天，使用 L
 * 7. 指定：手动选择具体的日期，如 1,5,10 表示第1、5、10天
 * 
 * 取值范围：1-31
 * 允许的通配符：, - * / L W
 * 
 * 重要规则：
 * - 日期字段和周字段互斥，不能同时设置具体值
 * - 当周字段为 "?" 时，日期字段可以设置具体值
 * - 当周字段不为 "?" 时，日期字段必须为 "?"
 */

import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件 Props 定义
 * @property check - 数值范围校验函数，由父组件传入
 * @property week - 周字段的当前值，用于互斥判断
 * @property init - 初始的日期字段值，如 "*"、"?"、"5-10"、"1/2"、"15W"、"L"、"1,5,10"
 */
const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	week: string
	init: string
}>()

/**
 * 组件 Emits 定义
 * @event updata - 当日期字段值变化时触发，返回字段名称和新的值
 */
const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

/**
 * 当前选中的配置模式
 * '1': 每天 (*)
 * '2': 不指定 (?)
 * '3': 周期 (如 5-10)
 * '4': 间隔 (如 1/2)
 * '5': 工作日 (如 15W)
 * '6': 月末 (L)
 * '7': 指定 (如 1,5,10)
 */
const radioValue = ref('1')

/**
 * 工作日模式的日期值
 * 当 radioValue 为 '5' 时有效
 * 表示指定某号最近的工作日
 */
const workday = ref(1)

/**
 * 周期模式的起始值
 * 当 radioValue 为 '3' 时有效
 */
const cycle01 = ref(1)

/**
 * 周期模式的结束值
 * 当 radioValue 为 '3' 时有效
 */
const cycle02 = ref(2)

/**
 * 间隔模式的起始值
 * 当 radioValue 为 '4' 时有效
 */
const average01 = ref(1)

/**
 * 间隔模式的步长值
 * 当 radioValue 为 '4' 时有效
 */
const average02 = ref(1)

/**
 * 指定模式选中的日期列表
 * 当 radioValue 为 '7' 时有效
 * 存储用户通过复选框选择的日期
 */
const checkboxList = ref<string[]>([])

/**
 * 计算属性：生成周期模式的 Cron 表达式
 * 格式：起始值-结束值，如 "5-10"
 * 自动校验数值范围在 1-31 之间
 */
const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 1, 31)
	cycle02.value = props.check(cycle02.value, 1, 31)
	return cycle01.value + '-' + cycle02.value
})

/**
 * 计算属性：生成间隔模式的 Cron 表达式
 * 格式：起始值/步长，如 "1/2"
 * 自动校验起始值范围在 1-31 之间，步长范围在 1-31 之间
 */
const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 1, 31)
	average02.value = props.check(average02.value, 1, 31)
	return average01.value + '/' + average02.value
})

/**
 * 计算属性：生成工作日模式的 Cron 表达式
 * 格式：日期W，如 "15W"
 * 自动校验数值范围在 1-31 之间
 */
const workdayCheck = computed(() => {
	workday.value = props.check(workday.value, 1, 31)
	return workday.value
})

/**
 * 计算属性：生成指定模式的 Cron 表达式
 * 格式：逗号分隔的日期，如 "1,5,10"
 * 如果没有选择任何日期，返回 "*"
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
			// 每天
			emit('updata', 'day', '*')
			break
		case '2':
			// 不指定（与周字段互斥）
			emit('updata', 'day', '?')
			break
		case '3':
			// 周期模式
			emit('updata', 'day', cycleTotal.value)
			break
		case '4':
			// 间隔模式
			emit('updata', 'day', averageTotal.value)
			break
		case '5':
			// 工作日模式
			emit('updata', 'day', workday.value + 'W')
			break
		case '6':
			// 月末模式
			emit('updata', 'day', 'L')
			break
		case '7':
			// 指定模式
			emit('updata', 'day', checkboxString.value)
			break
	}
}

/**
 * 处理周期模式数值变化
 * 仅在当前模式为周期模式时更新父组件
 */
const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'day', cycleTotal.value)
	}
}

/**
 * 处理间隔模式数值变化
 * 仅在当前模式为间隔模式时更新父组件
 */
const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'day', averageTotal.value)
	}
}

/**
 * 处理工作日模式数值变化
 * 仅在当前模式为工作日模式时更新父组件
 */
const workdayChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'day', workday.value + 'W')
	}
}

/**
 * 处理指定模式复选框变化
 * 仅在当前模式为指定模式时更新父组件
 */
const checkboxChange = () => {
	if(radioValue.value === '7'){
		emit('updata', 'day', checkboxString.value)
	}
}

/**
 * 处理周字段变化，实现日期和周的互斥规则
 * - 如果周字段为 "?"，且当前模式为不指定，则切换到每天模式
 * - 如果周字段不为 "?"，且当前模式不是不指定，则切换到不指定模式
 */
const weekChange = () => {
	if(props.week === '?' && radioValue.value == '2'){
		radioValue.value = '1'
	}else if(props.week !== '?' && radioValue.value != '2'){
		radioValue.value = '2'
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
 * 监听工作日表达式变化
 */
watch(workdayCheck, workdayChange)

/**
 * 监听指定表达式变化
 */
watch(checkboxString, checkboxChange)

/**
 * 监听周字段变化，处理互斥规则
 */
watch(() => props.week, weekChange)

/**
 * 组件挂载时的初始化逻辑
 * 解析传入的 init 值，设置对应的配置模式和数值
 */
onMounted(() => {
	// 尝试解析为不指定模式
	if(props.init === '?'){
		radioValue.value = '2'
		return
	}
	
	// 尝试解析为周期模式 (如 "5-10")
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '3'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	
	// 尝试解析为间隔模式 (如 "1/2")
	const averageArr = props.init.split('/')
	if(averageArr.length === 2){
		radioValue.value = '4'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	
	// 尝试解析为工作日模式 (如 "15W")
	if(/W/.test(props.init)){
		radioValue.value = '5'
		workday.value = Number(props.init.replace('W',''))
		return
	}
	
	// 尝试解析为月末模式 (如 "L")
	if(props.init === 'L'){
		radioValue.value = '6'
		return
	}
	
	// 尝试解析为指定模式 (如 "1,5,10")
	if(props.init !== '*'){
		radioValue.value = '7'
		const list = props.init.split(',')
		checkboxList.value = list
	}
	// 如果是 "*"，则保持默认的 radioValue = '1'（每天模式）
})
</script>

<style scoped>
/* 输入组样式 */
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
