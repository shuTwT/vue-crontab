import CrontabSecond from './Crontab-Second.vue'
import CrontabMin from './Crontab-Min.vue'
import CrontabHour from './Crontab-Hour.vue'
import CrontabDay from './Crontab-Day.vue'
import CrontabMouth from './Crontab-Mouth.vue'
import CrontabWeek from './Crontab-Week.vue'
import CrontabYear from './Crontab-Year.vue'
import CrontabResult from './Crontab-Result.vue'

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
			},
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
		tabCheck(index){
			this.tabActive = index;
		},
		updataContabValue(name,value){
			this.contabValueObj[name] = value;
		},
		checkNumber(value,minLimit,maxLimit){
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
			this.$emit('fill',this.contabValueString);
			this.hidePopup();
		}
	},
	computed: {
		contabValueString(){
			let obj = this.contabValueObj;
			let str = obj.second + " " + obj.min + " " + obj.hour + " " + obj.day + " " + obj.mouth + " " + obj.week + (obj.year===""?"":" "+obj.year)
			return str;
		}
	},
  watch:{
    contabValueString(value) {
      this.$emit('input',value);
      this.$emit('update:modelValue',value);
    },
    render(value) {
      if ((value === true || value === "true") && !this.inited) {
        this.inited = true;
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
    this.inited = (this.render === true || this.render === 'true');
    if (this.value === '') {
      this.$emit('input', this.contabValueString);
    } else {
      let array = this.value.split(' ');
      if (array.length >= 6) {
        this.contabValueObj.second = array[0];
        this.contabValueObj.min = array[1];
        this.contabValueObj.hour = array[2];
        this.contabValueObj.day = array[3];
        this.contabValueObj.mouth = array[4];
        this.contabValueObj.week = array[5];
        this.contabValueObj.year = array[6] || '';
      }
    }
	}
}
