import type { WorkflowParameter } from '../shared/knowledge'

export type ParameterDraft = WorkflowParameter & { id: number }
let sequence = 0

export function parameterDraft(parameter: WorkflowParameter = { name: '', type: 'string', value: '' }): ParameterDraft {
  return { ...parameter, id: ++sequence }
}
