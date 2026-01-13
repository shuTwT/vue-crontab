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

<script lang="ts">
export default {
	data() {
		return {
			radioValue:'1',
			workday:1,
			cycle01:1,
			cycle02:2,
			average01:1,
			average02:1,
			checkboxList:[] as string[]
		}
	},
	name: 'crontab-day',
	props:['check','week','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','day','*');
					break;
				case '2':
					this.$emit('updata','day','?');
					break;
				case '3':
					this.$emit('updata','day',this.cycle01 + '-' + this.cycle02);
					break;
				case '4':
					this.$emit('updata','day',this.average01 + '/' + this.average02);
					break;
				case '5':
					this.$emit('updata','day',this.workday+'W');
					break;
				case '6':
					this.$emit('updata','day','L');
					break;
				case '7':
					this.$emit('updata','day',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','day',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','day',this.averageTotal);
			}
		},
		workdayChange(){
			if(this.radioValue==='5'){
				this.$emit('updata','day',this.workday+'W');
			}
		},
		checkboxChange(){
			if(this.radioValue==='7'){
				this.$emit('updata','day',this.checkboxString);
			}
		},
		weekChange(){
			if(this.week === '?' && this.radioValue == '2'){
				this.radioValue = '1';
			}else if(this.week !== '?' && this.radioValue != '2'){
				this.radioValue = '2';
			}
		}
	},
	watch: {
		"radioValue":"radioChange",
		'cycleTotal':'cycleChange',
		'averageTotal':'averageChange',
		'workdayCheck':'workdayChange',
		'checkboxString':'checkboxChange',
		'week':'weekChange'
	},
	computed: {
		cycleTotal(): string{
			this.cycle01 = this.check(this.cycle01,1,31)
			this.cycle02 = this.check(this.cycle02,1,31)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(): string{
			this.average01 = this.check(this.average01,1,31)
			this.average02 = this.check(this.average02,1,31)
			return this.average01+'/'+this.average02;
		},
		workdayCheck(): number{
			this.workday = this.check(this.workday,1,31)
			return this.workday;
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
    let averageArr = this.init.split('/');
    if(averageArr.length === 2){
      this.radioValue = '4';
      this.average01 = Number(averageArr[0]);
      this.average02 = Number(averageArr[1]);
      return;
    }
    if(/W/.test(this.init)){
      this.radioValue = '5';
      this.workday = Number(this.init.replace('W',''));
      return;
    }
    if(this.init === 'L'){
      this.radioValue = '6';
      return;
    }
    if(this.init !== '*'){
      this.radioValue = '7';
      let list = this.init.split(',');
      this.checkboxList = list;
    }
  }
}
</script>
