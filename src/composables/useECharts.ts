import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  GaugeChart,
  PieChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDarkMode } from './useDarkMode'

// Register required ECharts components
echarts.use([
  LineChart,
  BarChart,
  GaugeChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer
])

/**
 * ECharts theme configuration for dark and light modes
 */
export function getEChartsTheme(isDark: boolean) {
  if (isDark) {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#cbd5e1' // slate-300
      },
      title: {
        textStyle: {
          color: '#f1f5f9' // slate-100
        }
      },
      legend: {
        textStyle: {
          color: '#cbd5e1'
        }
      },
      grid: {
        borderColor: '#334155' // slate-700
      },
      categoryAxis: {
        axisLine: {
          lineStyle: {
            color: '#475569' // slate-600
          }
        },
        axisLabel: {
          color: '#94a3b8' // slate-400
        },
        splitLine: {
          lineStyle: {
            color: '#334155'
          }
        }
      },
      valueAxis: {
        axisLine: {
          lineStyle: {
            color: '#475569'
          }
        },
        axisLabel: {
          color: '#94a3b8'
        },
        splitLine: {
          lineStyle: {
            color: '#334155'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b', // slate-800
        borderColor: '#475569',
        textStyle: {
          color: '#f1f5f9'
        }
      }
    }
  } else {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#475569' // slate-600
      },
      title: {
        textStyle: {
          color: '#0f172a' // slate-900
        }
      },
      legend: {
        textStyle: {
          color: '#475569'
        }
      },
      grid: {
        borderColor: '#cbd5e1' // slate-300
      },
      categoryAxis: {
        axisLine: {
          lineStyle: {
            color: '#94a3b8' // slate-400
          }
        },
        axisLabel: {
          color: '#64748b' // slate-500
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0' // slate-200
          }
        }
      },
      valueAxis: {
        axisLine: {
          lineStyle: {
            color: '#94a3b8'
          }
        },
        axisLabel: {
          color: '#64748b'
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        textStyle: {
          color: '#0f172a'
        }
      }
    }
  }
}

/**
 * Hook for using ECharts with automatic theme switching
 */
export function useECharts(containerRef: any) {
  const { isDark } = useDarkMode()
  const chartInstance = ref<echarts.ECharts | null>(null)

  const initChart = () => {
    if (!containerRef.value) return

    // Dispose existing instance
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }

    // Create new instance with theme
    const theme = getEChartsTheme(isDark.value)
    chartInstance.value = echarts.init(containerRef.value)

    // Apply base theme
    chartInstance.value.setOption(theme)

    // Handle window resize
    const handleResize = () => {
      chartInstance.value?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  const setOption = (option: any, notMerge = false) => {
    if (!chartInstance.value) return

    const theme = getEChartsTheme(isDark.value)
    const mergedOption = {
      ...theme,
      ...option
    }

    chartInstance.value.setOption(mergedOption, notMerge)
  }

  const updateData = (seriesData: any[]) => {
    if (!chartInstance.value) return

    chartInstance.value.setOption({
      series: seriesData
    })
  }

  const clear = () => {
    chartInstance.value?.clear()
  }

  const dispose = () => {
    chartInstance.value?.dispose()
    chartInstance.value = null
  }

  // Watch for dark mode changes
  watch(isDark, () => {
    if (chartInstance.value) {
      const currentOption = chartInstance.value.getOption()
      initChart()
      if (currentOption) {
        setOption(currentOption)
      }
    }
  })

  onMounted(() => {
    initChart()
  })

  onUnmounted(() => {
    dispose()
  })

  return {
    chartInstance,
    initChart,
    setOption,
    updateData,
    clear,
    dispose
  }
}

/**
 * Common chart color palettes
 */
export const chartColors = {
  primary: '#6366f1',    // indigo-500
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  error: '#ef4444',      // red-500
  info: '#3b82f6',       // blue-500
  purple: '#a855f7',     // purple-500
  pink: '#ec4899',       // pink-500
  teal: '#14b8a6',       // teal-500
  gradient: {
    primary: ['#818cf8', '#6366f1'],
    success: ['#34d399', '#10b981'],
    warning: ['#fbbf24', '#f59e0b'],
    error: ['#f87171', '#ef4444']
  }
}
