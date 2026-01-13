<template>
  <div id="app">
  	<div class="form-warp">
  		<input readonly="readonly" v-model='crontabValue' />
  		<button type="button" @click='changeShow'>选择时间规则</button>
  		<button type="button" @click='crontabValue = ""'>清空</button>
  	</div>
    <Crontab v-show='showCrontab' @hide='changeShow' @fill='crontabFill'></Crontab>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {Crontab} from './lib'

const crontabValue = ref('')
const showCrontab = ref(false)

const changeShow = () => {
	showCrontab.value = !showCrontab.value
}

const crontabFill = (value) => {
	crontabValue.value = value
}
</script>

<style>
	html,body,div,input,button,ul,li {
		padding: 0;
		margin: 0;
	}
	ul,li {
		list-style: none;
	}
	html {
		height: 100%;
	}
	body {
		min-height: 100%;
	}
	.form-warp {
		text-align: center;
		padding-top: 200px;
	}
	.form-warp input {
		padding: 1px 5px;
	}
	.form-warp button {
		padding: 0 10px;
	}
</style>
