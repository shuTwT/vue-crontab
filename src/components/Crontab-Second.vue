<template>
	<li>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="1" />秒，允许的通配符[, - * /]
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="2" />周期从<input type="number" v-model='cycle01' />-<input type="number" v-model='cycle02' />秒
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="3" />从<input type="number" v-model='average01' />秒开始，每<input type="number" v-model='average02' />秒执行一次
		</div>
		<div class="popup-input-warp">
			<input type="radio" v-model='radioValue' value="4" />指定
			<div class="popup-check-warp">
				<label v-for='item in 60'><input type="checkbox" :value="item-1" v-model='checkboxList'>{{item-1 < 10 ? "0"+(item-1):item-1}}</label>
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
			average01:0,
			average02:1,
			checkboxList:[] as string[]
		}
	},
	name: 'crontab-second',
	props:['check','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','second','*');
					break;
				case '2':
					this.$emit('updata','second',this.cycle01 + '-' + this.cycle02);
					break;
				case '3':
					this.$emit('updata','second',this.average01 + '/' + this.average02);
					break;
				case '4':
					this.$emit('updata','second',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='2'){
				this.$emit('updata','second',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','second',this.averageTotal);
			}
		},
		checkboxChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','second',this.checkboxString);
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
			this.cycle01 = this.check(this.cycle01,0,59)
			this.cycle02 = this.check(this.cycle02,0,59)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(): string{
			this.average01 = this.check(this.average01,0,59)
			this.average02 = this.check(this.average02,1,59)
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
