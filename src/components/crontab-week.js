export default {
	data() {
		return {
			radioValue:'2',
			weekday:1,
			cycle01:1,
			cycle02:2,
			average01:1,
			average02:1,
			checkboxList:[],
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
		cycleTotal(){
			this.cycle01 = this.check(this.cycle01,1,7)
			this.cycle02 = this.check(this.cycle02,1,7)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(){
			this.average01 = this.check(this.average01,1,4)
			this.average02 = this.check(this.average02,1,7)
			return this.average01+'#'+this.average02;
		},
		weekdayCheck(){
			this.weekday = this.check(this.weekday,1,7)
			return this.weekday;
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
    let averageArr = this.init.split('#');
    if(averageArr.length === 2){
      this.radioValue = '4';
      this.average01 = averageArr[0];
      this.average02 = averageArr[1];
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
