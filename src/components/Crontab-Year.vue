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
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
	check: (value: number, minLimit: number, maxLimit: number) => number
	init: string
}>()

const emit = defineEmits<{
	updata: [name: string, value: string]
}>()

const fullYear = ref('')
const radioValue = ref('1')
const cycle01 = ref(0)
const cycle02 = ref(0)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref<string[]>([])

const cycleTotal = computed(() => {
	cycle01.value = props.check(cycle01.value, fullYear.value, fullYear.value + 100)
	cycle02.value = props.check(cycle02.value, fullYear.value + 1, fullYear.value + 101)
	return cycle01.value + '-' + cycle02.value
})

const averageTotal = computed(() => {
	average01.value = props.check(average01.value, fullYear.value, fullYear.value + 100)
	average02.value = props.check(average02.value, 1, 10)
	return average01.value + '/' + average02.value
})

const checkboxString = computed(() => {
	const str = checkboxList.value.join()
	return str
})

const radioChange = () => {
	switch(radioValue.value){
		case '1':
			emit('updata', 'year', '')
			break
		case '2':
			emit('updata', 'year', '*')
			break
		case '3':
			emit('updata', 'year', cycleTotal.value)
			break
		case '4':
			emit('updata', 'year', averageTotal.value)
			break
		case '5':
			emit('updata', 'year', checkboxString.value)
			break
	}
}

const cycleChange = () => {
	if(radioValue.value === '3'){
		emit('updata', 'year', cycleTotal.value)
	}
}

const averageChange = () => {
	if(radioValue.value === '4'){
		emit('updata', 'year', averageTotal.value)
	}
}

const checkboxChange = () => {
	if(radioValue.value === '5'){
		emit('updata', 'year', checkboxString.value)
	}
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)

onMounted(() => {
	fullYear.value = String(new Date().getFullYear())
	if(props.init === '*'){
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
	if(props.init !== ''){
		radioValue.value = '5'
		const list = props.init.split(',')
		checkboxList.value.length = 0
		list.forEach(num => {
			checkboxList.value.push(String(num))
		})
	}
})
</script>
