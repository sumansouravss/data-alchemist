import React, { useState } from 'react';

interface TaskSearchBarProps {
  originalData: Record<string, string>[];
  onFiltered: (filtered: Record<string, string>[]) => void;
}

const TaskSearchBar: React.FC<TaskSearchBarProps> = ({ originalData, onFiltered }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const lower = query.toLowerCase();

    const filtered = originalData.filter((task) => {
      const skillMatch =
        lower.includes('skill') &&
        task.RequiredSkills?.toLowerCase().includes(lower.split('skill')[1]?.trim());

      const durMatch = lower.match(/duration\s*(>|<|=)\s*(\d+)/);
      const durationMatch = durMatch
        ? (() => {
            const [, op, num] = durMatch;
            const duration = parseInt(task.Duration, 10);
            return (
              (op === '>' && duration > +num) ||
              (op === '<' && duration < +num) ||
              (op === '=' && duration === +num)
            );
          })()
        : false;

      const phaseMatch = lower.match(/phase.*\b(\d+)\b/);
      const preferredPhaseMatch = phaseMatch
        ? task.PreferredPhases?.includes(phaseMatch[1])
        : false;

      const priorityMatch = lower.match(/priority\s*(\d+)/);
      const priority = priorityMatch ? priorityMatch[1] : '';
      const priorityLevelMatch =
        priority && task.PriorityLevel?.toString() === priority;

      const clientMatch = lower.match(/(assigned to|client)\s*(c\d+)/i);
      const clientIDMatch =
        clientMatch && task.ClientID?.toUpperCase() === clientMatch[2].toUpperCase();

      const taskIDMatch =
        lower.includes('task') && task.TaskID?.toLowerCase().includes(lower.split('task')[1]?.trim());

      return (
        skillMatch ||
        durationMatch ||
        preferredPhaseMatch ||
        priorityLevelMatch ||
        clientIDMatch ||
        taskIDMatch
      );
    });

    onFiltered(filtered);
  };

  const handleClear = () => {
    setQuery('');
    onFiltered(originalData);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="my-4 flex flex-col sm:flex-row gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="🔍 e.g. duration > 2, skill welding, client C1, priority 5"
        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm dark:bg-gray-800 dark:text-white"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded dark:bg-gray-600 dark:text-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TaskSearchBar;
