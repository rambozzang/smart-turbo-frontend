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
      smooth?: boolean
    }[]
  }
  height?: string
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  yAxisLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: '300px',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  yAxisLabel: ''
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
    tooltip: props.showTooltip ? {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    } : undefined,
    legend: props.showLegend ? {
      data: props.data.series.map(s => s.name),
      bottom: 0
    } : undefined,
    grid: props.showGrid ? {
      left: '3%',
      right: '4%',
      bottom: props.showLegend ? '12%' : '3%',
      top: props.title ? '15%' : '3%',
      containLabel: true
    } : undefined,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.labels
    },
    yAxis: {
      type: 'value',
      name: props.yAxisLabel,
      nameLocation: 'middle',
      nameGap: 40
    },
    series: props.data.series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: s.smooth !== undefined ? s.smooth : true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        width: 2,
        color: s.color || Object.values(chartColors)[index % 8]
      },
      itemStyle: {
        color: s.color || Object.values(chartColors)[index % 8]
      },
      areaStyle: {
        opacity: 0.1
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
