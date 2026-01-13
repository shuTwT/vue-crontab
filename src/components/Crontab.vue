<template>
  <div class="popup-warp" v-if="inited">
    <div class="popup-main">
    	<ul class="popup-title">
    		<li>规则类型</li>
    		<li v-for='(item,index) of tabTitles' :class='{on:index===tabActive}' @click='tabCheck(index)' >{{item}}</li>
    	</ul>
    	<ul class="popup-body">
    		<CrontabSecond :class='{ on:tabActive===0 }' :init="contabValueObj.second" @updata='updataContabValue' :check='checkNumber'></CrontabSecond>
    		<CrontabMin :class='{ on:tabActive===1 }' :init="contabValueObj.min" @updata='updataContabValue' :check='checkNumber'></CrontabMin>
    		<CrontabHour :class='{ on:tabActive===2 }' :init="contabValueObj.hour" @updata='updataContabValue' :check='checkNumber'></CrontabHour>
    		<CrontabDay :class='{ on:tabActive===3 }' :init="contabValueObj.day" @updata='updataContabValue' :check='checkNumber' :week='contabValueObj.week'></CrontabDay>
    		<CrontabMouth :class='{ on:tabActive===4 }' :init="contabValueObj.mouth" @updata='updataContabValue' :check='checkNumber'></CrontabMouth>
    		<CrontabWeek :class='{ on:tabActive===5 }' :init="contabValueObj.week" @updata='updataContabValue' :check='checkNumber' :day='contabValueObj.day'></CrontabWeek>
    		<CrontabYear :class='{ on:tabActive===6 }' :init="contabValueObj.year" @updata='updataContabValue' :check='checkNumber'></CrontabYear>
    	</ul>
    	<div class="popup-result">
				<p class="title">时间表达式</p>
				<table>
					<thead>
						<th v-for='item of tabTitles' width='40'>{{item}}</th>
						<th>crontab完整表达式</th>
					</thead>
					<tbody>
						<td><span>{{contabValueObj.second}}</span></td>
						<td><span>{{contabValueObj.min}}</span></td>
						<td><span>{{contabValueObj.hour}}</span></td>
						<td><span>{{contabValueObj.day}}</span></td>
						<td><span>{{contabValueObj.mouth}}</span></td>
						<td><span>{{contabValueObj.week}}</span></td>
						<td><span>{{contabValueObj.year}}</span></td>
						<td><span>{{contabValueString}}</span></td>
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

<script lang="ts">
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

export default {
	data() {
		return {
			tabTitles:["秒","分钟","小时","日","月","周","年"],
			tabActive:0,
			myindex:0,
			contabValueObj:{
				second:'*',
				min:'*',
				hour:'*',
				day:'*',
				mouth:'*',
				week:'?',
				year:'',
			} as ContabValueObj,
      inited:false
		}
	},
	name: 'crontab',
  props: {
    render: {
      type: [Boolean, String],
      default: true
    },
    value: {
      type: String,
      default: ''
    }
  },
	methods: {
		tabCheck(index: number){
			this.tabActive = index;
		},
		updataContabValue(name: string, value: string){
			(this.contabValueObj as any)[name] = value;
		},
		checkNumber(value: number, minLimit: number, maxLimit: number): number{
			value = Math.floor(value);
			if(value < minLimit){
				value = minLimit
			}else if(value > maxLimit){
				value = maxLimit
			}
			return value;
		},
		hidePopup(){
			this.$emit('hide');
		},
		submitFill(){
			this.$emit('fill',(this as any).contabValueString);
			this.hidePopup();
		}
	},
	computed: {
		contabValueString(): string{
			let obj = (this as any).contabValueObj;
			let str = obj.second + " " + obj.min + " " + obj.hour + " " + obj.day + " " + obj.mouth + " " + obj.week + (obj.year===""?"":" "+obj.year)
			return str;
		}
	},
  watch:{
    contabValueString(value: string) {
      this.$emit('input',value);
      this.$emit('update:modelValue',value);
    },
    render(value: boolean | string) {
      if ((value === true || value === "true") && !(this as any).inited) {
        (this as any).inited = true;
      }
    }
  },
	components:{
		CrontabSecond,
		CrontabMin,
		CrontabHour,
		CrontabDay,
		CrontabMouth,
		CrontabWeek,
		CrontabYear,
		CrontabResult
	},
	mounted() {
    (this as any).inited = (this as any).render === true || (this as any).render === 'true';
    if ((this as any).value === '') {
      this.$emit('input', (this as any).contabValueString);
    } else {
      let array = (this as any).value.split(' ');
      if (array.length >= 6) {
        (this as any).contabValueObj.second = array[0];
        (this as any).contabValueObj.min = array[1];
        (this as any).contabValueObj.hour = array[2];
        (this as any).contabValueObj.day = array[3];
        (this as any).contabValueObj.mouth = array[4];
        (this as any).contabValueObj.week = array[5];
        (this as any).contabValueObj.year = array[6] || '';
      }
    }
	}
}
</script>

<style>
	@import '../assets/popup.css';
</style>
