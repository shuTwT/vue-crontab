export default {
	data() {
		return {
			fullYear:'',
			radioValue:'1',
			cycle01:0,
			cycle02:0,
			average01:0,
			average02:1,
			checkboxList:[]
		}
	},
	name: 'crontab-year',
	props:['check','init'],
	methods: {
		radioChange(){
			switch(this.radioValue){
				case '1':
					this.$emit('updata','year','');
					break;
				case '2':
					this.$emit('updata','year','*');
					break;
				case '3':
					this.$emit('updata','year',this.cycle01 + '-' + this.cycle02);
					break;
				case '4':
					this.$emit('updata','year',this.average01 + '/' + this.average02);
					break;
				case '5':
					this.$emit('updata','year',this.checkboxString);
					break;
			}
		},
		cycleChange(){
			if(this.radioValue==='3'){
				this.$emit('updata','year',this.cycleTotal);
			}
		},
		averageChange(){
			if(this.radioValue==='4'){
				this.$emit('updata','year',this.averageTotal);
			}
		},
		checkboxChange(){
			if(this.radioValue==='5'){
				this.$emit('updata','year',this.checkboxString);
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
			this.cycle01 = this.check(this.cycle01,this.fullYear,this.fullYear+100)
			this.cycle02 = this.check(this.cycle02,this.fullYear+1,this.fullYear+101)
			return this.cycle01+'-'+this.cycle02;
		},
		averageTotal(){
			this.average01 = this.check(this.average01,this.fullYear,this.fullYear+100)
			this.average02 = this.check(this.average02,1,10)
			return this.average01+'/'+this.average02;
		},
		checkboxString(){
			let str = this.checkboxList.join();
			return str;
		}
	},
	mounted() {
		this.fullYear = new Date().getFullYear();
    if(this.init === '*'){
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
    if(this.init !== ''){
      this.radioValue = '5';
      let list = this.init.split(',');
      this.checkboxList.length = 0;
      list.forEach(num=>{
        this.checkboxList.push(Number(num));
      })
    }
	}
}
