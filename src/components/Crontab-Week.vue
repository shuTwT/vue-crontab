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

<script lang="ts">
export default {
	data() {
		return {
			radioValue:'2',
			weekday:1,
			cycle01:1,
			cycle02:2,
			average01:1,
			average02:1,
			checkboxList:[] as string[],
			weekList:['周一','周二','周三','周四','周五','周六','周日']
		}
	},
	name: 'crontab-week',
	props:['check','day','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','week','*');
					break;
				case '2':
					this.$emit('updata','week','?');
					break;
				case '3':
					this.$emit('updata','week',this.cycle01 + '-' + this.cycle02);
					break;
				case '4':
					this.$emit('updata','week',this.average01 + '#' + this.average02);
					break;
				case '5':
					this.$emit('updata','week',this.weekday+'L');
					break;
				case '6':
					this.$emit('updata','week',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','week',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','week',this.averageTotal);
			}
		},
		weekdayChange(){
			if(this.radioValue==='5'){
				this.$emit('updata','week',this.weekday+'L');
			}
		},
		checkboxChange(){
			if(this.radioValue==='6'){
				this.$emit('updata','week',this.checkboxString);
			}
		},
		dayChange(){
			if(this.day === '?' && this.radioValue == '2'){
				this.radioValue = '1';
			}else if(this.day !== '?' && this.radioValue != '2'){
				this.radioValue = '2';
			}
		}
	},
	watch: {
		"radioValue":"radioChange",
		'cycleTotal':'cycleChange',
		'averageTotal':'averageChange',
		'weekdayCheck':'weekdayChange',
		'checkboxString':'checkboxChange',
		'day':'dayChange'
	},
	computed: {
		cycleTotal(): string{
			this.cycle01 = this.check(this.cycle01,1,7)
			this.cycle02 = this.check(this.cycle02,1,7)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(): string{
			this.average01 = this.check(this.average01,1,4)
			this.average02 = this.check(this.average02,1,7)
			return this.average01+'#'+this.average02;
		},
		weekdayCheck(): number{
			this.weekday = this.check(this.weekday,1,7)
			return this.weekday;
		},
		checkboxString(): string{
			let str = this.checkboxList.join();
			return str===''?'*':str;
		}
	},
  mounted() {
    if(this.init === '?'){
      this.radioValue = '2';
      return;
    }
    let cycleArr = this.init.split('-');
    if(cycleArr.length === 2){
      this.radioValue = '3';
      this.cycle01 = Number(cycleArr[0]);
      this.cycle02 = Number(cycleArr[1]);
      return;
    }
    let averageArr = this.init.split('#');
    if(averageArr.length === 2){
      this.radioValue = '4';
      this.average01 = Number(averageArr[0]);
      this.average02 = Number(averageArr[1]);
      return;
    }
    if(/L/.test(this.init)){
      this.radioValue = '5';
      this.weekday = Number(this.init.replace('L',''));
      return;
    }
    if(this.init !== '*'){
      this.radioValue = '6';
      let list = this.init.split(',');
      this.checkboxList = list;
    }
  }
}
</script>
