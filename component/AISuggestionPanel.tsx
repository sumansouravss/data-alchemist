import React, { useEffect, useState } from 'react';

export interface CoRunRule {
  type: 'coRun';
  tasks: [string, string];
}

interface AISuggestionsPanelProps {
  tasks: Record<string, string>[]; // Only 'tasks' is used
  onAddRule: (rule: CoRunRule) => void;
}

const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  tasks,
  onAddRule,
}) => {
  const [suggestions, setSuggestions] = useState<CoRunRule[]>([]);

  useEffect(() => {
    const phaseMap: Record<number, string[]> = {};

    tasks.forEach((task) => {
      try {
        const phases = JSON.parse(task.PreferredPhases || '[]');
        if (Array.isArray(phases)) {
          phases.forEach((p: number) => {
            if (!phaseMap[p]) phaseMap[p] = [];
            phaseMap[p].push(task.TaskID);
          });
        }
      } catch {
        // Ignore JSON parsing errors silently
      }
    });

    const newSuggestions: CoRunRule[] = [];

    Object.values(phaseMap).forEach((taskList) => {
      if (taskList.length >= 2) {
        const coRunSet = new Set<string>();
        for (let i = 0; i < taskList.length; i++) {
          for (let j = i + 1; j < taskList.length; j++) {
            const pairKey = [taskList[i], taskList[j]].sort().join(',');
            if (!coRunSet.has(pairKey)) {
              coRunSet.add(pairKey);
              newSuggestions.push({
                type: 'coRun',
                tasks: [taskList[i], taskList[j]],
              });
            }
          }
        }
      }
    });

    setSuggestions(newSuggestions);
  }, [tasks]);

  return (
    <div className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
      <h2 className="text-xl font-semibold mb-2">🧠 AI Rule Suggestions</h2>

      {suggestions.length === 0 ? (
        <p className="text-sm text-slate-300">
          No suggestions available. Upload task data with valid PreferredPhases.
        </p>
      ) : (
        <ul className="list-disc list-inside text-sm text-slate-100 space-y-2">
          {suggestions.map((rule, i) => (
            <li key={i}>
              📐 Suggest: <strong>{rule.tasks[0]}</strong> ↔ <strong>{rule.tasks[1]}</strong> should co-run
              <button
                onClick={() => onAddRule(rule)}
                className="ml-3 text-green-300 hover:text-green-500 underline"
              >
                ➕ Add Rule
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AISuggestionsPanel;
