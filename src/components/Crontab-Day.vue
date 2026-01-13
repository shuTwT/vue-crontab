<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />日，允许的通配符[, - * / L M]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />不指定
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />日
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />从<input type="number" v-model='average01' />号开始，每<input type="number" v-model='average02' />日执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="5" />每月<input type="number" v-model='workday' />号最近的那个工作日
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="6" />本月最后一天
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="7" />指定
			<div class="popup-check-warp popup-check-short">
				<label v-for='item in 31'><input type="checkbox" :value="item" v-model='checkboxList'>{{item < 10 ? "0"+(item):item}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	week: string
	init: string
}>()

const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

const radioValue = ref('1')
const workday = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref<string[]>([])

const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 1, 31)
	cycle02.value = props.check(cycle02.value, 1, 31)
	return cycle01.value + '-' + cycle02.value
})

const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 1, 31)
	average02.value = props.check(average02.value, 1, 31)
	return average01.value + '/' + average02.value
})

const workdayCheck = computed(() => {
	workday.value = props.check(workday.value, 1, 31)
	return workday.value
})

const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str === '' ? '*' : str
})

const radioChange = () => {
	switch(radioValue.value){
		case '1':
			emit('updata', 'day', '*')
			break
		case '2':
			emit('updata', 'day', '?')
			break
		case '3':
			emit('updata', 'day', cycleTotal.value)
			break
		case '4':
			emit('updata', 'day', averageTotal.value)
			break
		case '5':
			emit('updata', 'day', workday.value + 'W')
			break
		case '6':
			emit('updata', 'day', 'L')
			break
		case '7':
			emit('updata', 'day', checkboxString.value)
			break
	}
}

const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'day', cycleTotal.value)
	}
}

const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'day', averageTotal.value)
	}
}

const workdayChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'day', workday.value + 'W')
	}
}

const checkboxChange = () => {
	if(radioValue.value === '7'){
		emit('updata', 'day', checkboxString.value)
	}
}

const weekChange = () => {
	if(props.week === '?' && radioValue.value == '2'){
		radioValue.value = '1'
	}else if(props.week !== '?' && radioValue.value != '2'){
		radioValue.value = '2'
	}
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(workdayCheck, workdayChange)
watch(checkboxString, checkboxChange)
watch(() => props.week, weekChange)

onMounted(() => {
	if(props.init === '?'){
		radioValue.value = '2'
		return
	}
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '3'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	const averageArr = props.init.split('/')
	if(averageArr.length === 2){
		radioValue.value = '4'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	if(/W/.test(props.init)){
		radioValue.value = '5'
		workday.value = Number(props.init.replace('W',''))
		return
	}
	if(props.init === 'L'){
		radioValue.value = '6'
		return
	}
	if(props.init !== '*'){
		radioValue.value = '7'
		const list = props.init.split(',')
		checkboxList.value = list
	}
})
</script>
