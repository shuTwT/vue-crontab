export default {
	data() {
		return {
			radioValue:'1',
			cycle01:1,
			cycle02:2,
			average01:0,
			average02:1,
			checkboxList:[]
		}
	},
	name: 'crontab-min',
	props:['check','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','min','*');
					break;
				case '2':
					this.$emit('updata','min',this.cycle01 + '-' + this.cycle02);
					break;
				case '3':
					this.$emit('updata','min',this.average01 + '/' + this.average02);
					break;
				case '4':
					this.$emit('updata','min',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='2'){
				this.$emit('updata','min',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','min',this.averageTotal);
			}
		},
		checkboxChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','min',this.checkboxString);
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
		cycleTotal(){
			this.cycle01 = this.check(this.cycle01,0,59)
			this.cycle02 = this.check(this.cycle02,0,59)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(){
			this.average01 = this.check(this.average01,0,59)
			this.average02 = this.check(this.average02,1,59)
			return this.average01+'/'+this.average02;
		},
		checkboxString(){
			let str = this.checkboxList.join();
			return str===''?'*':str;
		}
	},
  mounted() {
    let cycleArr = this.init.split('-');
    if(cycleArr.length === 2){
      this.radioValue = '2';
      this.cycle01 = cycleArr[0];
      this.cycle02 = cycleArr[1];
      return;
    }
    let averageArr = this.init.split('/');
    if(averageArr.length === 2){
      this.radioValue = '3';
      this.average01 = averageArr[0];
      this.average02 = averageArr[1];
      return;
    }
    if(this.init !== '*'){
      this.radioValue = '4';
      let list = this.init.split(',');
      this.checkboxList = list;
    }
  }
}
