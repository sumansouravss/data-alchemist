// utils/types.ts

export type Rule =
  | { type: 'dependency'; before: string; after: string }
  | { type: 'coRun'; tasks: [string, string] };

export interface RuleSet {
  rules: Rule[];
  priorities: Record<string, number>;
}

export interface ValidationError {
  type: 'error' | 'warning';
  entity: 'clients' | 'workers' | 'tasks';
  row: number;
  column: string;
  message: string;
}

export interface PriorityWeights {
  priorityLevelWeight: number;
  fairnessWeight: number;
  fulfillmentWeight: number;
}
