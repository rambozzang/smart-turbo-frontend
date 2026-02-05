<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Stage {
  id: string
  duration: string
  target: number
  color: string
}

const props = defineProps<{
  modelValue: Array<{ duration: string; target: number }>
  maxVUs?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Array<{ duration: string; target: number }>]
}>()

const stages = ref<Stage[]>(
  props.modelValue.map((stage, idx) => ({
    id: `stage-${idx}`,
    duration: stage.duration,
    target: stage.target,
    color: getStageColor(idx)
  }))
)

const selectedStageId = ref<string | null>(null)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStageId = ref<string | null>(null)

function getStageColor(index: number): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smh])$/)
  if (!match) return 60

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 3600
    default: return 60
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h`
}

const totalDuration = computed(() => {
  return stages.value.reduce((sum, stage) => sum + parseDuration(stage.duration), 0)
})

const maxTarget = computed(() => {
  return Math.max(...stages.value.map(s => s.target), props.maxVUs || 1000)
})

const timelineWidth = 800
const timelineHeight = 200

const stageBlocks = computed(() => {
  let cumulativeTime = 0

  return stages.value.map((stage, idx) => {
    const durationSeconds = parseDuration(stage.duration)
    const widthPercent = (durationSeconds / totalDuration.value) * 100
    const x = (cumulativeTime / totalDuration.value) * timelineWidth
    const width = (durationSeconds / totalDuration.value) * timelineWidth
    const heightPercent = (stage.target / maxTarget.value) * 100
    const y = timelineHeight - (heightPercent / 100) * (timelineHeight - 40)
    const height = (heightPercent / 100) * (timelineHeight - 40)

    cumulativeTime += durationSeconds

    // Create path for area chart
    const nextStage = stages.value[idx + 1]
    const nextHeight = nextStage
      ? (nextStage.target / maxTarget.value) * (timelineHeight - 40)
      : height
    const nextY = timelineHeight - nextHeight

    return {
      id: stage.id,
      x,
      y,
      width,
      height,
      color: stage.color,
      duration: stage.duration,
      target: stage.target,
      widthPercent,
      path: `M ${x} ${timelineHeight} L ${x} ${y} L ${x + width} ${nextY} L ${x + width} ${timelineHeight} Z`
    }
  })
})

function addStage() {
  const newStage: Stage = {
    id: `stage-${Date.now()}`,
    duration: '1m',
    target: 100,
    color: getStageColor(stages.value.length)
  }
  stages.value.push(newStage)
  updateModelValue()
}

function removeStage(id: string) {
  const index = stages.value.findIndex(s => s.id === id)
  if (index !== -1 && stages.value.length > 1) {
    stages.value.splice(index, 1)
    updateModelValue()
  }
}

function selectStage(id: string) {
  selectedStageId.value = id
}

function updateStage(id: string, field: 'duration' | 'target', value: string | number) {
  const stage = stages.value.find(s => s.id === id)
  if (stage) {
    if (field === 'duration') {
      stage.duration = value as string
    } else {
      stage.target = value as number
    }
    updateModelValue()
  }
}

function updateModelValue() {
  emit('update:modelValue', stages.value.map(s => ({
    duration: s.duration,
    target: s.target
  })))
}

function handleMouseDown(event: MouseEvent, stageId: string) {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStageId.value = stageId
  selectedStageId.value = stageId
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value || !dragStageId.value) return

  const stage = stages.value.find(s => s.id === dragStageId.value)
  if (!stage) return

  const deltaX = event.clientX - dragStartX.value
  const deltaTarget = Math.round((deltaX / timelineWidth) * maxTarget.value * 2)

  const newTarget = Math.max(1, Math.min(maxTarget.value, stage.target - deltaTarget))
  stage.target = newTarget

  dragStartX.value = event.clientX
  updateModelValue()
}

function handleMouseUp() {
  isDragging.value = false
  dragStageId.value = null
}
</script>

<template>
  <div class="space-y-4">
    <!-- Visual Timeline -->
    <div class="bg-slate-950 border border-slate-800 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-mono text-slate-400 uppercase">Visual Timeline</h3>
        <div class="text-xs font-mono text-slate-500">
          Total Duration: <span class="text-slate-300">{{ formatDuration(totalDuration) }}</span>
        </div>
      </div>

      <svg
        :width="timelineWidth"
        :height="timelineHeight"
        class="w-full"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <!-- Grid lines -->
        <g class="grid">
          <line
            v-for="i in 5"
            :key="`grid-h-${i}`"
            :x1="0"
            :y1="(i - 1) * (timelineHeight / 4)"
            :x2="timelineWidth"
            :y2="(i - 1) * (timelineHeight / 4)"
            stroke="#334155"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <line
            v-for="i in 5"
            :key="`grid-v-${i}`"
            :x1="(i - 1) * (timelineWidth / 4)"
            :y1="0"
            :x2="(i - 1) * (timelineWidth / 4)"
            :y2="timelineHeight"
            stroke="#334155"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
        </g>

        <!-- Y-axis labels (VUs) -->
        <g class="y-axis">
          <text
            v-for="i in 5"
            :key="`y-label-${i}`"
            :x="-5"
            :y="timelineHeight - ((i - 1) * (timelineHeight - 40) / 4)"
            font-family="JetBrains Mono, monospace"
            font-size="10"
            fill="#64748b"
            text-anchor="end"
          >
            {{ Math.round(((i - 1) / 4) * maxTarget) }}
          </text>
        </g>

        <!-- Stage blocks -->
        <g class="stages">
          <path
            v-for="block in stageBlocks"
            :key="block.id"
            :d="block.path"
            :fill="block.color"
            :fill-opacity="selectedStageId === block.id ? 0.8 : 0.5"
            :stroke="block.color"
            stroke-width="2"
            class="cursor-pointer transition-all"
            @click="selectStage(block.id)"
            @mousedown="handleMouseDown($event, block.id)"
          />
        </g>

        <!-- Stage labels -->
        <g class="labels">
          <text
            v-for="(block, idx) in stageBlocks"
            :key="`label-${block.id}`"
            :x="block.x + block.width / 2"
            :y="block.y - 10"
            font-family="JetBrains Mono, monospace"
            font-size="10"
            :fill="block.color"
            text-anchor="middle"
          >
            Stage {{ idx + 1 }}
          </text>
          <text
            v-for="block in stageBlocks"
            :key="`target-${block.id}`"
            :x="block.x + block.width / 2"
            :y="block.y + 15"
            font-family="JetBrains Mono, monospace"
            font-size="9"
            fill="#e2e8f0"
            text-anchor="middle"
          >
            {{ block.target }} VUs
          </text>
          <text
            v-for="block in stageBlocks"
            :key="`duration-${block.id}`"
            :x="block.x + block.width / 2"
            :y="timelineHeight - 5"
            font-family="JetBrains Mono, monospace"
            font-size="9"
            fill="#94a3b8"
            text-anchor="middle"
          >
            {{ block.duration }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Stage Configuration List -->
    <div class="space-y-2">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-mono text-slate-400 uppercase">Stage Configuration</h3>
        <button
          @click="addStage"
          type="button"
          class="px-3 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
        >
          + Add Stage
        </button>
      </div>

      <div
        v-for="(stage, idx) in stages"
        :key="stage.id"
        class="flex items-center space-x-3 p-3 border transition-all"
        :class="selectedStageId === stage.id
          ? 'border-accent-primary bg-accent-primary/5'
          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'"
        @click="selectStage(stage.id)"
      >
        <div class="w-1 h-8" :style="{ backgroundColor: stage.color }"></div>

        <div class="flex-1 grid grid-cols-3 gap-3">
          <div>
            <label class="text-[9px] text-slate-500 uppercase block mb-1">Stage {{ idx + 1 }}</label>
            <div class="text-xs font-mono text-slate-300">{{ stage.duration }} → {{ stage.target }} VUs</div>
          </div>

          <div>
            <label class="text-[9px] text-slate-500 uppercase block mb-1">Duration</label>
            <input
              :value="stage.duration"
              @input="updateStage(stage.id, 'duration', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="2m"
              class="w-full px-2 py-1 bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary font-mono"
            />
          </div>

          <div>
            <label class="text-[9px] text-slate-500 uppercase block mb-1">Target VUs</label>
            <input
              :value="stage.target"
              @input="updateStage(stage.id, 'target', parseInt(($event.target as HTMLInputElement).value))"
              type="number"
              placeholder="100"
              class="w-full px-2 py-1 bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary font-mono"
            />
          </div>
        </div>

        <button
          v-if="stages.length > 1"
          @click.stop="removeStage(stage.id)"
          type="button"
          class="p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div class="p-3 bg-blue-900/20 border border-blue-800/30 text-xs font-mono text-blue-300">
      <div class="flex items-start space-x-2">
        <svg class="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <strong>Tip:</strong> Click on stages to select them. Drag vertically to adjust target VUs. Use the inputs below for precise control.
        </div>
      </div>
    </div>
  </div>
</template>
