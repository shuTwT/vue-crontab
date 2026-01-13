<template>
	<div class="popup-warp" v-if="inited">
		<div class="popup-main">
			<ul class="popup-title">
				<li>规则类型</li>
				<li v-for='(item, index) of tabTitles' :class='{ on: index === tabActive }' @click='tabCheck(index)'>{{
					item }}
				</li>
			</ul>
			<ul class="popup-body">
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
			<div class="popup-result">
				<p class="title">时间表达式</p>
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
			<div class="popup-btns">
				<button type="button" @click='submitFill'>确定</button>
				<button type="button" @click='hidePopup'>取消</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import CrontabSecond from './Crontab-Second.vue'
import CrontabMin from './Crontab-Min.vue'
import CrontabHour from './Crontab-Hour.vue'
import CrontabDay from './Crontab-Day.vue'
import CrontabMouth from './Crontab-Mouth.vue'
import CrontabWeek from './Crontab-Week.vue'
import CrontabYear from './Crontab-Year.vue'
import CrontabResult from './Crontab-Result.vue'

interface ContabValueObj {
	second: string
	min: string
	hour: string
	day: string
	mouth: string
	week: string
	year: string
}

const props = withDefaults(defineProps<{
	render?: boolean | string
	value?: string
}>(), {
	render: true,
	value: '',
})

const emit = defineEmits<{
	hide: []
	fill: [value: string]
	input: [value: string]
	'update:modelValue': [value: string]
}>()

const tabTitles = ["秒", "分钟", "小时", "日", "月", "周", "年"]
const tabActive = ref(0)
const myindex = ref(0)
const contabValueObj = ref<ContabValueObj>({
	second: '*',
	min: '*',
	hour: '*',
	day: '*',
	mouth: '*',
	week: '?',
	year: '',
})
const inited = ref(false)

const tabCheck = (index: number) => {
	tabActive.value = index;
}

const updataContabValue = (name: string, value: string) => {
	(contabValueObj.value as any)[name] = value;
}

const checkNumber = (value: number, minLimit: number, maxLimit: number): number => {
	value = Math.floor(value);
	if (value < minLimit) {
		value = minLimit
	} else if (value > maxLimit) {
		value = maxLimit
	}
	return value;
}

const hidePopup = () => {
	emit('hide');
}

const submitFill = () => {
	emit('fill', contabValueString.value);
	hidePopup();
}

const contabValueString = computed(() => {
	let obj = contabValueObj.value;
	let str = obj.second + " " + obj.min + " " + obj.hour + " " + obj.day + " " + obj.mouth + " " + obj.week + (obj.year === "" ? "" : " " + obj.year)
	return str;
})

watch(contabValueString, (value) => {
	emit('input', value);
	emit('update:modelValue', value);
})

watch(() => props.render, (value) => {
	if ((value === true || value === "true") && !inited.value) {
		inited.value = true;
	}
})

onMounted(() => {
	inited.value = props.render === true || props.render === 'true';
	if (props.value === '') {
		emit('input', contabValueString.value);
	} else {
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

<style>
@import '../assets/popup.css';
</style>
