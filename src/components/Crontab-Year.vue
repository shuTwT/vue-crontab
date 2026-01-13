<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />不填，允许的通配符[, - * /]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />每年
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />年
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />从<input type="number" v-model='average01' />年开始，每<input type="number" v-model='average02' />年执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="5" />指定
			<div class="popup-check-warp">
				<label v-for='item in 9'><input type="checkbox" :value="item - 1 + fullYear" v-model='checkboxList'>{{item -1 + fullYear}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
/**
 * CronTab 年份字段配置组件
 * 
 * 功能描述：
 * 提供 Cron 表达式中年份字段的配置界面，支持五种配置模式：
 * 1. 不填：年份字段为空，表示不限制年份
 * 2. 每年：使用通配符 *
 * 3. 周期：指定一个年份范围，如 2025-2030 表示2025年到2030年
 * 4. 间隔：从某年开始，每隔多少年执行一次，如 2025/2 表示从2025年开始，每2年执行一次
 * 5. 指定：手动选择具体的年份，如 2025,2027,2029
 * 
 * 取值范围：当前年份到当前年份+100年
 * 允许的通配符：, - * /
 * 
 * 特殊说明：
 * - 年份字段是可选的，不填写时表示不限制年份
 * - 组件会自动获取当前年份，并显示未来9年的选项供用户选择
 * - 年份范围从当前年份开始，最多支持未来100年
 */

import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件 Props 定义
 * @property check - 数值范围校验函数，由父组件传入
 * @property init - 初始的年份字段值，如 ""、"*"、"2025-2030"、"2025/2"、"2025,2027,2029"
 */
const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	init: string
}>()

/**
 * 组件 Emits 定义
 * @event updata - 当年份字段值变化时触发，返回字段名称和新的值
 */
const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

/**
 * 当前年份
 * 从系统时间获取，作为年份计算的基准值
 */
const fullYear = ref('')

/**
 * 当前选中的配置模式
 * '1': 不填 (空字符串)
 * '2': 每年 (*)
 * '3': 周期 (如 2025-2030)
 * '4': 间隔 (如 2025/2)
 * '5': 指定 (如 2025,2027,2029)
 */
const radioValue = ref('1')

/**
 * 周期模式的起始值
 * 当 radioValue 为 '3' 时有效
 */
const cycle01 = ref(0)

/**
 * 周期模式的结束值
 * 当 radioValue 为 '3' 时有效
 */
const cycle02 = ref(0)

/**
 * 间隔模式的起始值
 * 当 radioValue 为 '4' 时有效
 */
const average01 = ref(0)

/**
 * 间隔模式的步长值
 * 当 radioValue 为 '4' 时有效
 */
const average02 = ref(1)

/**
 * 指定模式选中的年份列表
 * 当 radioValue 为 '5' 时有效
 * 存储用户通过复选框选择的年份
 */
const checkboxList = ref<string[]>([])

/**
 * 计算属性：生成周期模式的 Cron 表达式
 * 格式：起始值-结束值，如 "2025-2030"
 * 自动校验起始值范围在当前年份到当前年份+100年之间
 * 自动校验结束值范围在当前年份+1到当前年份+101年之间
 */
const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, Number(fullYear.value), Number(fullYear.value) + 100)
	cycle02.value = props.check(cycle02.value, Number(fullYear.value) + 1, Number(fullYear.value) + 101)
	return cycle01.value + '-' + cycle02.value
})

/**
 * 计算属性：生成间隔模式的 Cron 表达式
 * 格式：起始值/步长，如 "2025/2"
 * 自动校验起始值范围在当前年份到当前年份+100年之间
 * 自动校验步长范围在 1-10 年之间
 */
const averageTotal = computed(() => {
	average01.value = props.check(average01.value, Number(fullYear.value), Number(fullYear.value) + 100)
	average02.value = props.check(average02.value, 1, 10)
	return average01.value + '/' + average02.value
})

/**
 * 计算属性：生成指定模式的 Cron 表达式
 * 格式：逗号分隔的年份，如 "2025,2027,2029"
 * 如果没有选择任何年份，返回空字符串
 */
const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str
})

/**
 * 处理配置模式切换
 * 根据当前选中的模式，生成对应的 Cron 表达式并通知父组件
 */
const radioChange = () => {
	switch(radioValue.value){
		case '1':
			// 不填（不限制年份）
			emit('updata', 'year', '')
			break
		case '2':
			// 每年
			emit('updata', 'year', '*')
			break
		case '3':
			// 周期模式
			emit('updata', 'year', cycleTotal.value)
			break
		case '4':
			// 间隔模式
			emit('updata', 'year', averageTotal.value)
			break
		case '5':
			// 指定模式
			emit('updata', 'year', checkboxString.value)
			break
	}
}

/**
 * 处理周期模式数值变化
 * 仅在当前模式为周期模式时更新父组件
 */
const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'year', cycleTotal.value)
	}
}

/**
 * 处理间隔模式数值变化
 * 仅在当前模式为间隔模式时更新父组件
 */
const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'year', averageTotal.value)
	}
}

/**
 * 处理指定模式复选框变化
 * 仅在当前模式为指定模式时更新父组件
 */
const checkboxChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'year', checkboxString.value)
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
 * 1. 获取当前年份作为基准
 * 2. 解析传入的 init 值，设置对应的配置模式和数值
 */
onMounted(() => {
	// 获取当前年份
	fullYear.value = String(new Date().getFullYear())
	
	// 尝试解析为每年模式
	if(props.init === '*'){
		radioValue.value = '2'
		return
	}
	
	// 尝试解析为周期模式 (如 "2025-2030")
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '3'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	
	// 尝试解析为间隔模式 (如 "2025/2")
	const averageArr = props.init.split('/')
	if(averageArr.length === 2){
		radioValue.value = '4'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	
	// 尝试解析为指定模式 (如 "2025,2027,2029")
	if(props.init !== ''){
		radioValue.value = '5'
		const list = props.init.split(',')
		checkboxList.value.length = 0
		list.forEach(num => {
			checkboxList.value.push(String(num))
		})
	}
	// 如果是空字符串，则保持默认的 radioValue = '1'（不填模式）
})
</script>
