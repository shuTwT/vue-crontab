<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />月，允许的通配符[, - * /]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />月
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />从<input type="number" v-model='average01' />月开始，每<input type="number" v-model='average02' />月执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />指定
			<div class="popup-check-warp popup-check-short">
				<label v-for='item in 12'><input type="checkbox" :value="item" v-model='checkboxList'>{{item < 10 ? "0"+(item):item}}</label>
			</div>
		</div>
	</li>
</template>

<script lang="ts">
export default {
	data() {
		return {
			radioValue:'1',
			cycle01:1,
			cycle02:2,
			average01:1,
			average02:1,
			checkboxList:[] as string[]
		}
	},
	name: 'crontab-mouth',
	props:['check','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','mouth','*');
					break;
				case '2':
					this.$emit('updata','mouth',this.cycle01 + '-' + this.cycle02);
					break;
				case '3':
					this.$emit('updata','mouth',this.average01 + '/' + this.average02);
					break;
				case '4':
					this.$emit('updata','mouth',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='2'){
				this.$emit('updata','mouth',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','mouth',this.averageTotal);
			}
		},
		checkboxChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','mouth',this.checkboxString);
			}
		}
	},
	watch: {
		"radioValue":"radioChange",
		'cycleTotal':'cycleChange',
		'averageTotal':'averageChange',
		'checkboxString':'checkboxChange'
	},
	computed: {
		cycleTotal(): string{
			this.cycle01 = this.check(this.cycle01,1,12)
			this.cycle02 = this.check(this.cycle02,1,12)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(): string{
			this.average01 = this.check(this.average01,1,12)
			this.average02 = this.check(this.average02,1,12)
			return this.average01+'/'+this.average02;
		},
		checkboxString(): string{
			let str = this.checkboxList.join();
			return str===''?'*':str;
		}
	},
  mounted() {
    let cycleArr = this.init.split('-');
    if(cycleArr.length === 2){
      this.radioValue = '2';
      this.cycle01 = Number(cycleArr[0]);
      this.cycle02 = Number(cycleArr[1]);
      return;
    }
    let averageArr = this.init.split('/');
    if(averageArr.length === 2){
      this.radioValue = '3';
      this.average01 = Number(averageArr[0]);
      this.average02 = Number(averageArr[1]);
      return;
    }
    if(this.init !== '*'){
      this.radioValue = '4';
      let list = this.init.split(',');
      this.checkboxList = list;
    }
  }
}
</script>
