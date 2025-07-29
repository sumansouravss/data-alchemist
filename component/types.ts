// types.ts

export type Rule =
  | { type: 'coRun'; tasks: [string, string] }
  | { type: 'dependency'; before: string; after: string };

export interface RuleSet {
  rules: Rule[];
  priorities: Record<string, number>;
}
