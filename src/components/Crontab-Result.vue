<template>
	<div class="crontab-result">
		<p class="crontab-result__title">最近5次运行时间</p>
		<ul class="crontab-result__scroll">
			<template v-if='isShow'>
				<li  v-for='item in resultList'>{{item}}</li>
			</template>
			<template v-else>
				<li>计算结果中...</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="ts">
/**
 * CronTab 执行时间计算组件
 * 
 * 功能描述：
 * 使用 cron-parser 库计算 Cron 表达式的最近5次执行时间
 * 该组件接收一个完整的 Cron 表达式，解析并计算未来的执行时间点
 * 
 * 核心功能：
 * 1. 解析 Cron 表达式：使用 cron-parser 库解析标准的 Cron 表达式
 * 2. 计算执行时间：从当前时间开始，计算接下来的5次执行时间
 * 3. 格式化输出：将计算结果格式化为易读的日期时间字符串
 * 4. 错误处理：处理无效的 Cron 表达式，显示友好的错误提示
 * 
 * 依赖库：
 * - cron-parser: 用于解析和计算 Cron 表达式
 * 
 * 支持的 Cron 表达式格式：
 * - 标准6位格式：秒 分钟 小时 日 月 周
 * - 扩展7位格式：秒 分钟 小时 日 月 周 年
 * 
 * 示例：
 * - "0 0 12 * * ?" - 每天中午12点执行
 * - "0 0/5 * * * ?" - 每5分钟执行一次
 * - "0 0 12 ? * MON-FRI" - 周一到周五中午12点执行
 */

import { ref, watch, onMounted } from 'vue'
import { CronExpressionParser } from 'cron-parser'

/**
 * 组件 Props 定义
 * @property ex - 完整的 Cron 表达式字符串，格式如 "0 0 12 * * ?"
 */
const props = defineProps<{
	ex: string
}>()

/**
 * 计算结果列表
 * 存储计算得到的最近5次执行时间
 */
const resultList = ref<string[]>([])

/**
 * 是否显示计算结果
 * true: 显示计算结果
 * false: 显示"计算结果中..."
 */
const isShow = ref(false)

/**
 * 格式化日期为字符串
 * @param date - Date 对象
 * @returns 格式化后的日期时间字符串，格式：YYYY-MM-DD HH:mm:ss
 */
const formatDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 计算最近5次执行时间
 * 
 * 实现思路：
 * 1. 使用 cron-parser 库解析 Cron 表达式
 * 2. 从当前时间开始，使用 next() 方法获取下一次执行时间
 * 3. 循环调用 next() 方法，获取5次执行时间
 * 4. 将每次执行时间格式化为字符串并存储到结果列表中
 * 5. 处理可能的错误（如无效的 Cron 表达式）
 * 
 * 注意事项：
 * - 如果 Cron 表达式无效，会显示错误提示
 * - 如果在100年内找不到5次执行时间，会显示实际找到的结果
 * - 计算过程是异步的，使用 try-catch 捕获可能的异常
 */
const expressionChange = () => {
	isShow.value = false
	
	try {
		// 解析 Cron 表达式
		const expression = props.ex.trim()
		
		// 如果表达式为空，显示提示
		if (!expression) {
			resultList.value = ['请输入 Cron 表达式']
			isShow.value = true
			return
		}
		
		// 使用 cron-parser 解析表达式
		const interval = CronExpressionParser.parse(expression, {
			currentDate: new Date()
		})
		
		// 计算最近5次执行时间
		const results: string[] = []
		
		for (let i = 0; i < 5; i++) {
			try {
				// 获取下一次执行时间
				const nextDate = interval.next()
				
				// 检查是否超出100年范围
				const maxDate = new Date()
				maxDate.setFullYear(maxDate.getFullYear() + 100)
				
				if (nextDate.toDate() > maxDate) {
					break
				}
				
				// 格式化并添加到结果列表
				results.push(formatDate(nextDate.toDate()))
			} catch (error) {
				// 如果无法找到更多执行时间，跳出循环
				break
			}
		}
		
		// 设置结果
		if (results.length === 0) {
			resultList.value = ['没有达到条件的结果！']
		} else {
			resultList.value = results
			if (results.length !== 5) {
				resultList.value.push(`最近100年内只有上面${results.length}条结果！`)
			}
		}
	} catch (error) {
		// 处理解析错误
		resultList.value = ['无效的 Cron 表达式！']
		console.error('Cron 表达式解析错误:', error)
	}
	
	isShow.value = true
}

/**
 * 监听 Cron 表达式变化
 * 当表达式变化时，重新计算执行时间
 */
watch(() => props.ex, expressionChange)

/**
 * 组件挂载时初始化
 * 计算初始表达式的执行时间
 */
onMounted(() => {
	expressionChange()
})
</script>
