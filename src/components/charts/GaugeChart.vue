<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useECharts, chartColors } from '../../composables/useECharts'

interface Props {
  title: string
  value: number
  max?: number
  unit?: string
  color?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  unit: '%',
  color: chartColors.primary,
  height: '250px'
})

const chartRef = ref<HTMLDivElement>()
const { setOption } = useECharts(chartRef)

const updateChart = () => {
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: props.max,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.3, chartColors.success],
              [0.7, chartColors.warning],
              [1, chartColors.error]
            ]
          }
        },
        pointer: {
          width: 4,
          itemStyle: {
            color: props.color
          }
        },
        axisTick: {
          distance: -10,
          length: 5,
          lineStyle: {
            width: 1
          }
        },
        splitLine: {
          distance: -15,
          length: 10,
          lineStyle: {
            width: 2
          }
        },
        axisLabel: {
          distance: -25,
          fontSize: 10
        },
        title: {
          offsetCenter: [0, '70%'],
          fontSize: 14
        },
        detail: {
          fontSize: 24,
          offsetCenter: [0, '40%'],
          valueAnimation: true,
          formatter: (value: number) => `{value|${value.toFixed(1)}}${props.unit}`,
          rich: {
            value: {
              fontSize: 28,
              fontWeight: 'bold',
              color: props.color
            }
          }
        },
        data: [
          {
            value: props.value,
            name: props.title
          }
        ]
      }
    ]
  }

  setOption(option)
}

watch(() => [props.value, props.title, props.max], updateChart, { deep: true })

onMounted(() => {
  updateChart()
})
</script>

<template>
  <div ref="chartRef" :style="{ height, width: '100%' }" />
</template>
