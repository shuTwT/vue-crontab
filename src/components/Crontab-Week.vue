<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />周，允许的通配符[, - * / L #]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />不指定
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />周期从星期<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />第<input type="number" v-model='average01' />周的星期<input type="number" v-model='average02' />
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="5" />本月最后一个星期<input type="number" v-model='weekday' />
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="6" />指定
			<div class="popup-check-warp">
				<label v-for='(item,index) of weekList'><input type="checkbox" :value='index+1' v-model='checkboxList'>{{item}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
/**
 * CronTab 星期字段配置组件
 * 
 * 功能描述：
 * 提供 Cron 表达式中星期字段的配置界面，支持六种配置模式：
 * 1. 每周：使用通配符 *
 * 2. 不指定：使用通配符 ?（与日期字段互斥）
 * 3. 周期：指定一个星期范围，如 1-5 表示周一到周五
 * 4. 第N周的星期X：指定第几个周的星期几，如 2#3 表示第3周的周二
 * 5. 本月最后一个星期X：本月最后一个指定的星期几，如 5L 表示本月最后一个周五
 * 6. 指定：手动选择具体的星期，如 1,3,5 表示周一、周三、周五
 * 
 * 取值范围：1-7（1=周一，2=周二，...，7=周日）
 * 允许的通配符：, - * / L #
 * 
 * 重要规则：
 * - 星期字段和日期字段互斥，不能同时设置具体值
 * - 当日期字段为 "?" 时，星期字段可以设置具体值
 * - 当日期字段不为 "?" 时，星期字段必须为 "?"
 */

import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件 Props 定义
 * @property check - 数值范围校验函数，由父组件传入
 * @property day - 日期字段的当前值，用于互斥判断
 * @property init - 初始的星期字段值，如 "*"、"?"、"1-5"、"2#3"、"5L"、"1,3,5"
 */
const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	day: string
	init: string
}>()

/**
 * 组件 Emits 定义
 * @event updata - 当星期字段值变化时触发，返回字段名称和新的值
 */
const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

/**
 * 当前选中的配置模式
 * '1': 每周 (*)
 * '2': 不指定 (?)
 * '3': 周期 (如 1-5)
 * '4': 第N周的星期X (如 2#3)
 * '5': 本月最后一个星期X (如 5L)
 * '6': 指定 (如 1,3,5)
 */
const radioValue = ref('2')

/**
 * 本月最后一个星期X的星期值
 * 当 radioValue 为 '5' 时有效
 * 表示本月最后一个星期几
 */
const weekday = ref(1)

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
 * 第N周的星期X模式的周数
 * 当 radioValue 为 '4' 时有效
 * 表示第几个周
 */
const average01 = ref(1)

/**
 * 第N周的星期X模式的星期值
 * 当 radioValue 为 '4' 时有效
 * 表示星期几
 */
const average02 = ref(1)

/**
 * 指定模式选中的星期列表
 * 当 radioValue 为 '6' 时有效
 * 存储用户通过复选框选择的星期
 */
const checkboxList = ref<string[]>([])

/**
 * 星期显示名称列表
 * 用于界面显示，索引对应星期值（0=周日，1=周一，...，6=周六）
 * 注意：Cron 表达式中 1=周一，7=周日，但 JavaScript Date 对象中 0=周日，1=周一，...，6=周六
 */
const weekList = ['周一','周二','周三','周四','周五','周六','周日']

/**
 * 计算属性：生成周期模式的 Cron 表达式
 * 格式：起始值-结束值，如 "1-5"
 * 自动校验数值范围在 1-7 之间
 */
const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 1, 7)
	cycle02.value = props.check(cycle02.value, 1, 7)
	return cycle01.value + '-' + cycle02.value
})

/**
 * 计算属性：生成第N周的星期X模式的 Cron 表达式
 * 格式：周数#星期，如 "2#3" 表示第3周的周二
 * 自动校验周数范围在 1-4 之间，星期值范围在 1-7 之间
 */
const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 1, 4)
	average02.value = props.check(average02.value, 1, 7)
	return average01.value + '#' + average02.value
})

/**
 * 计算属性：生成本月最后一个星期X模式的 Cron 表达式
 * 格式：星期L，如 "5L" 表示本月最后一个周五
 * 自动校验数值范围在 1-7 之间
 */
const weekdayCheck = computed(() => {
	weekday.value = props.check(weekday.value, 1, 7)
	return weekday.value
})

/**
 * 计算属性：生成指定模式的 Cron 表达式
 * 格式：逗号分隔的星期，如 "1,3,5"
 * 如果没有选择任何星期，返回 "*"
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
			// 每周
			emit('updata', 'week', '*')
			break
		case '2':
			// 不指定（与日期字段互斥）
			emit('updata', 'week', '?')
			break
		case '3':
			// 周期模式
			emit('updata', 'week', cycleTotal.value)
			break
		case '4':
			// 第N周的星期X模式
			emit('updata', 'week', averageTotal.value)
			break
		case '5':
			// 本月最后一个星期X模式
			emit('updata', 'week', weekday.value + 'L')
			break
		case '6':
			// 指定模式
			emit('updata', 'week', checkboxString.value)
			break
	}
}

/**
 * 处理周期模式数值变化
 * 仅在当前模式为周期模式时更新父组件
 */
const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'week', cycleTotal.value)
	}
}

/**
 * 处理第N周的星期X模式数值变化
 * 仅在当前模式为第N周的星期X模式时更新父组件
 */
const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'week', averageTotal.value)
	}
}

/**
 * 处理本月最后一个星期X模式数值变化
 * 仅在当前模式为本月最后一个星期X模式时更新父组件
 */
const weekdayChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'week', weekday.value + 'L')
	}
}

/**
 * 处理指定模式复选框变化
 * 仅在当前模式为指定模式时更新父组件
 */
const checkboxChange = () => {
	if(radioValue.value === '6'){
		emit('updata', 'week', checkboxString.value)
	}
}

/**
 * 处理日期字段变化，实现星期和日期的互斥规则
 * - 如果日期字段为 "?"，且当前模式为不指定，则切换到每周模式
 * - 如果日期字段不为 "?"，且当前模式不是不指定，则切换到不指定模式
 */
const dayChange = () => {
	if(props.day === '?' && radioValue.value == '2'){
		radioValue.value = '1'
	}else if(props.day !== '?' && radioValue.value != '2'){
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
 * 监听第N周的星期X表达式变化
 */
watch(averageTotal, averageChange)

/**
 * 监听本月最后一个星期X表达式变化
 */
watch(weekdayCheck, weekdayChange)

/**
 * 监听指定表达式变化
 */
watch(checkboxString, checkboxChange)

/**
 * 监听日期字段变化，处理互斥规则
 */
watch(() => props.day, dayChange)

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
	
	// 尝试解析为周期模式 (如 "1-5")
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '3'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	
	// 尝试解析为第N周的星期X模式 (如 "2#3")
	const averageArr = props.init.split('#')
	if(averageArr.length === 2){
		radioValue.value = '4'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	
	// 尝试解析为本月最后一个星期X模式 (如 "5L")
	if(/L/.test(props.init)){
		radioValue.value = '5'
		weekday.value = Number(props.init.replace('L',''))
		return
	}
	
	// 尝试解析为指定模式 (如 "1,3,5")
	if(props.init !== '*'){
		radioValue.value = '6'
		const list = props.init.split(',')
		checkboxList.value = list
	}
	// 如果是 "*"，则保持默认的 radioValue = '1'（每周模式）
})
</script>
