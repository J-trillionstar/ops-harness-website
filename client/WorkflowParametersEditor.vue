<script setup lang="ts">
import { computed, nextTick, ref, type Directive } from 'vue'
import { maxWorkflowName } from '../shared/knowledge'
import { parameterDraft, type ParameterDraft } from './workflow-parameters'

defineProps<{ workflowLabel: string }>()
const parameters = defineModel<ParameterDraft[]>({ required: true })
const addButton = ref<HTMLButtonElement>()
const nameInputs = new Map<number, HTMLInputElement>()
function setNameInput(id: number, element: unknown) {
  if (element instanceof HTMLInputElement) nameInputs.set(id, element)
  else nameInputs.delete(id)
}
async function add() {
  const draft = parameterDraft()
  parameters.value = [...parameters.value, draft]
  await nextTick()
  nameInputs.get(draft.id)?.focus()
}
async function remove(index: number) {
  const remaining = parameters.value.filter((_, i) => i !== index)
  parameters.value = remaining
  await nextTick()
  const next = remaining[index] ?? remaining[index - 1]
  if (next) nameInputs.get(next.id)?.focus()
  else addButton.value?.focus()
}

const nameErrors = computed(() => {
  const names = new Set<string>()
  return parameters.value.map(draft => {
    const name = draft.name.trim()
    const duplicate = names.has(name)
    names.add(name)
    if (draft.name && !name) return '参数名不能为空。'
    if (name && duplicate) return '同一工作流中的参数名不能重复。'
    return ''
  })
})
// Participate in the parent form's native validation, including keyboard submission.
const vValidity: Directive<HTMLInputElement, string> = (field, binding) => {
  field.setCustomValidity(binding.value)
}
</script>

<template>
  <fieldset class="workflow-parameters" :aria-label="`${workflowLabel}的额外参数`">
    <div v-for="(param, index) in parameters" :key="param.id" class="parameter-row" role="group" :aria-label="`参数 ${index + 1}`">
      <label class="parameter-name">参数名
        <input :ref="el => setNameInput(param.id, el)" v-model="param.name" v-validity="nameErrors[index]!" required
          :maxlength="maxWorkflowName" :aria-invalid="Boolean(nameErrors[index])" :aria-describedby="nameErrors[index] ? `param-name-error-${param.id}` : undefined" />
        <span v-if="nameErrors[index]" :id="`param-name-error-${param.id}`" class="parameter-error">{{ nameErrors[index] }}</span>
      </label>
      <fieldset class="parameter-type">
        <legend>客户端类型</legend>
        <label class="check-label"><input v-model="param.type" type="radio" :name="`param-type-${param.id}`" value="string" />字符串</label>
        <label class="check-label"><input v-model="param.type" type="radio" :name="`param-type-${param.id}`" value="json" />JSON</label>
      </fieldset>
      <label class="parameter-value">参数值
        <textarea v-model="param.value" rows="2" :spellcheck="false"></textarea>
      </label>
      <button type="button" class="button secondary remove-parameter" @click="remove(index)">移除参数</button>
    </div>
    <button ref="addButton" type="button" class="button secondary" @click="add">
      <span aria-hidden="true">＋</span> 添加参数
    </button>
  </fieldset>
</template>

<style scoped>
.guide-admin .workflow-parameters { margin-top: 12px; container-type: inline-size; }
.parameter-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) auto minmax(0, 3fr) auto;
  align-items: start;
  gap: 10px 14px;
  margin-bottom: 10px;
  padding: 12px;
  background: var(--bg-subtle, #f7f8fa);
  border-radius: 6px;
}
.parameter-name, .parameter-value { display: grid; gap: 6px; min-width: 0; font-size: 12px; }
.parameter-value textarea { resize: vertical; min-height: 38px; }
.parameter-type { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.parameter-type legend { font-size: 12px; margin-bottom: 6px; }
.parameter-type .check-label { min-height: 38px; }
.remove-parameter { margin-top: 22px; }
.parameter-error { color: #973d3d; font-size: 12px; }
@container (max-width: 620px) {
  .parameter-row { grid-template-columns: minmax(0, 1fr) auto; }
  .parameter-value { grid-column: 1 / -1; }
  .remove-parameter { margin: 0; justify-self: start; }
}
</style>
