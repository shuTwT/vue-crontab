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
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	day: string
	init: string
}>()

const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

const radioValue = ref('2')
const weekday = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref<string[]>([])
const weekList = ['周一','周二','周三','周四','周五','周六','周日']

const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 1, 7)
	cycle02.value = props.check(cycle02.value, 1, 7)
	return cycle01.value + '-' + cycle02.value
})

const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 1, 4)
	average02.value = props.check(average02.value, 1, 7)
	return average01.value + '#' + average02.value
})

const weekdayCheck = computed(() => {
	weekday.value = props.check(weekday.value, 1, 7)
	return weekday.value
})

const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str === '' ? '*' : str
})

const radioChange = () => {
	switch(radioValue.value){
		case '1':
			emit('updata', 'week', '*')
			break
		case '2':
			emit('updata', 'week', '?')
			break
		case '3':
			emit('updata', 'week', cycleTotal.value)
			break
		case '4':
			emit('updata', 'week', averageTotal.value)
			break
		case '5':
			emit('updata', 'week', weekday.value + 'L')
			break
		case '6':
			emit('updata', 'week', checkboxString.value)
			break
	}
}

const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'week', cycleTotal.value)
	}
}

const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'week', averageTotal.value)
	}
}

const weekdayChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'week', weekday.value + 'L')
	}
}

const checkboxChange = () => {
	if(radioValue.value === '6'){
		emit('updata', 'week', checkboxString.value)
	}
}

const dayChange = () => {
	if(props.day === '?' && radioValue.value == '2'){
		radioValue.value = '1'
	}else if(props.day !== '?' && radioValue.value != '2'){
		radioValue.value = '2'
	}
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(weekdayCheck, weekdayChange)
watch(checkboxString, checkboxChange)
watch(() => props.day, dayChange)

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
	const averageArr = props.init.split('#')
	if(averageArr.length === 2){
		radioValue.value = '4'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	if(/L/.test(props.init)){
		radioValue.value = '5'
		weekday.value = Number(props.init.replace('L',''))
		return
	}
	if(props.init !== '*'){
		radioValue.value = '6'
		const list = props.init.split(',')
		checkboxList.value = list
	}
})
</script>
