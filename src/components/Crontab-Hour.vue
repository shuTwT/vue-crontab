<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />小时，允许的通配符[, - * /]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />小时
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />从<input type="number" v-model='average01' />小时开始，每<input type="number" v-model='average02' />小时执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />指定
			<div class="popup-check-warp">
				<label v-for='item in 24'><input type="checkbox" :value="item-1" v-model='checkboxList'>{{item-1 < 10 ? "0"+(item-1):item-1}}</label>
			</div>
		</div>
	</li>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	init: string
}>()

const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

const radioValue = ref('1')
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref<string[]>([])

const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, 0, 23)
	cycle02.value = props.check(cycle02.value, 0, 23)
	return cycle01.value + '-' + cycle02.value
})

const averageTotal = computed(() => {
	average01.value = props.check(average01.value, 0, 23)
	average02.value = props.check(average02.value, 1, 23)
	return average01.value + '/' + average02.value
})

const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str === '' ? '*' : str
})

const radioChange = () => {
	switch(radioValue.value){
		case '1':
			emit('updata', 'hour', '*')
			break
		case '2':
			emit('updata', 'hour', cycleTotal.value)
			break
		case '3':
			emit('updata', 'hour', averageTotal.value)
			break
		case '4':
			emit('updata', 'hour', checkboxString.value)
			break
	}
}

const cycleChange = () => {
	if(radioValue.value === '2'){
		emit('updata', 'hour', cycleTotal.value)
	}
}

const averageChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'hour', averageTotal.value)
	}
}

const checkboxChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'hour', checkboxString.value)
	}
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)

onMounted(() => {
	const cycleArr = props.init.split('-')
	if(cycleArr.length === 2){
		radioValue.value = '2'
		cycle01.value = Number(cycleArr[0])
		cycle02.value = Number(cycleArr[1])
		return
	}
	const averageArr = props.init.split('/')
	if(averageArr.length === 2){
		radioValue.value = '3'
		average01.value = Number(averageArr[0])
		average02.value = Number(averageArr[1])
		return
	}
	if(props.init !== '*'){
		radioValue.value = '4'
		const list = props.init.split(',')
		checkboxList.value = list
	}
})
</script>
