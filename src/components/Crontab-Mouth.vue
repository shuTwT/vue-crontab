<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />月，允许的通配符[, - * /]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />月
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />从<input type="number" v-model='average01' />月开始，每<input type="number" v-model='average02' />月执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />指定
			<div class="popup-check-warp popup-check-short">
				<label v-for='item in 12'><input type="checkbox" :value="item" v-model='checkboxList'>{{item < 10 ? "0"+(item):item}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
/**
 * CronTab 月份字段配置组件
 * 
 * 功能描述：
 * 提供 Cron 表达式中月份字段的配置界面，支持四种配置模式：
 * 1. 每月：使用通配符 *
 * 2. 周期：指定一个月份范围，如 5-10 表示5月到10月
 * 3. 间隔：从某月开始，每隔多少月执行一次，如 1/2 表示从1月开始，每2个月执行一次
 * 4. 指定：手动选择具体的月份，如 1,5,10 表示1月、5月、10月
 * 
 * 取值范围：1-12
 * 允许的通配符：, - * /
 */

import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件 Props 定义
 * @property check - 数值范围校验函数，由父组件传入
 * @property init - 初始的月份字段值，如 "*"、"5-10"、"1/2"、"1,5,10"
 */
const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	init: string
}>()

/**
 * 组件 Emits 定义
 * @event updata - 当月份字段值变化时触发，返回字段名称和新的值
 */
const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

/**
 * 当前选中的配置模式
 * '1': 每月 (*)
 * '2': 周期 (如 5-10)
 * '3': 间隔 (如 1/2)
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
const average01 = ref(1)

/**
 * 间隔模式的步长值
 * 当 radioValue 为 '3' 时有效
 */
const average02 = ref(1)

/**
 * 指定模式选中的月份列表
 * 当 radioValue 为 '4' 时有效
 * 存储用户通过复选框选择的月份
 */
const checkboxList = ref<string[]>([])

/**
 * 计算属性：生成周期模式的 Cron 表达式
 * 格式：起始值-结束值，如 "5-10"
 * 自动校验数值范围在 1-12 之间
 */
const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 1, 12)
	cycle02.value = props.check(cycle02.value, 1, 12)
	return cycle01.value + '-' + cycle02.value
})

/**
 * 计算属性：生成间隔模式的 Cron 表达式
 * 格式：起始值/步长，如 "1/2"
 * 自动校验起始值范围在 1-12 之间，步长范围在 1-12 之间
 */
const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 1, 12)
	average02.value = props.check(average02.value, 1, 12)
	return average01.value + '/' + average02.value
})

/**
 * 计算属性：生成指定模式的 Cron 表达式
 * 格式：逗号分隔的月份，如 "1,5,10"
 * 如果没有选择任何月份，返回 "*"
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
			// 每月
			emit('updata', 'mouth', '*')
			break
		case '2':
			// 周期模式
			emit('updata', 'mouth', cycleTotal.value)
			break
		case '3':
			// 间隔模式
			emit('updata', 'mouth', averageTotal.value)
			break
		case '4':
			// 指定模式
			emit('updata', 'mouth', checkboxString.value)
			break
	}
}

/**
 * 处理周期模式数值变化
 * 仅在当前模式为周期模式时更新父组件
 */
const cycleChange = () => {
	if(radioValue.value === '2'){
		emit('updata', 'mouth', cycleTotal.value)
	}
}

/**
 * 处理间隔模式数值变化
 * 仅在当前模式为间隔模式时更新父组件
 */
const averageChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'mouth', averageTotal.value)
	}
}

/**
 * 处理指定模式复选框变化
 * 仅在当前模式为指定模式时更新父组件
 */
const checkboxChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'mouth', checkboxString.value)
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
	
	// 尝试解析为间隔模式 (如 "1/2")
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
	// 如果是 "*"，则保持默认的 radioValue = '1'（每月模式）
})
</script>
