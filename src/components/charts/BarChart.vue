<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useECharts, chartColors } from '../../composables/useECharts'

interface Props {
  title?: string
  data: {
    labels: string[]
    series: {
      name: string
      data: number[]
      color?: string
    }[]
  }
  height?: string
  showLegend?: boolean
  horizontal?: boolean
  stacked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: '300px',
  showLegend: true,
  horizontal: false,
  stacked: false
})

const chartRef = ref<HTMLDivElement>()
const { setOption } = useECharts(chartRef)

const updateChart = () => {
  if (!props.data || !props.data.series || props.data.series.length === 0) return

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: props.showLegend ? {
      data: props.data.series.map(s => s.name),
      bottom: 0
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: props.showLegend ? '12%' : '3%',
      top: props.title ? '15%' : '3%',
      containLabel: true
    },
    xAxis: props.horizontal ? {
      type: 'value'
    } : {
      type: 'category',
      data: props.data.labels
    },
    yAxis: props.horizontal ? {
      type: 'category',
      data: props.data.labels
    } : {
      type: 'value'
    },
    series: props.data.series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      stack: props.stacked ? 'total' : undefined,
      data: s.data,
      itemStyle: {
        color: s.color || Object.values(chartColors)[index % 8]
      },
      emphasis: {
        focus: 'series'
      }
    }))
  }

  setOption(option)
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  updateChart()
})
</script>

<template>
  <div ref="chartRef" :style="{ height, width: '100%' }" />
</template>
