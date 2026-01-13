export default {
	data() {
		return {
			radioValue:'1',
			workday:1,
			cycle01:1,
			cycle02:2,
			average01:1,
			average02:1,
			checkboxList:[]
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
		cycleTotal(){
			this.cycle01 = this.check(this.cycle01,1,31)
			this.cycle02 = this.check(this.cycle02,1,31)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(){
			this.average01 = this.check(this.average01,1,31)
			this.average02 = this.check(this.average02,1,31)
			return this.average01+'/'+this.average02;
		},
		workdayCheck(){
			this.workday = this.check(this.workday,1,31)
			return this.workday;
		},
		checkboxString(){
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
      this.cycle01 = cycleArr[0];
      this.cycle02 = cycleArr[1];
      return;
    }
    let averageArr = this.init.split('/');
    if(averageArr.length === 2){
      this.radioValue = '4';
      this.average01 = averageArr[0];
      this.average02 = averageArr[1];
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
