import React, { useState } from 'react';

type Rule =
  | { type: 'coRun'; tasks: [string, string] }
  | { type: 'dependency'; before: string; after: string };

interface RuleBuilderProps {
  taskIds: string[];
  onAddRule: (rule: Rule) => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ taskIds, onAddRule }) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const addCoRunRule = () => {
    if (selectedTasks.length !== 2) {
      alert('Please select exactly two tasks for co-run.');
      return;
    }
    onAddRule({ type: 'coRun', tasks: [selectedTasks[0], selectedTasks[1]] });
    setSelectedTasks([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4 mt-6">
      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">⚙️ Rule Builder</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Select exactly two tasks to define a co-run rule.
      </p>

      <div className="flex flex-wrap gap-2">
        {taskIds.map((id) => (
          <button
            key={id}
            onClick={() => toggleTask(id)}
            className={`px-3 py-1 border rounded transition-all duration-200 ${
              selectedTasks.includes(id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <button
        onClick={addCoRunRule}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
      >
        ➕ Add Co-Run Rule
      </button>
    </div>
  );
};

export default RuleBuilder;
