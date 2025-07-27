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
      // Match skill
      if (lower.includes('skill') && task.RequiredSkills?.toLowerCase().includes(lower.split('skill')[1]?.trim())) {
        return true;
      }

      // Match duration
      const durMatch = lower.match(/duration\s*(>|<|=)\s*(\d+)/);
      if (durMatch) {
        const [, op, num] = durMatch;
        const duration = parseInt(task.Duration, 10);
        if (
          (op === '>' && duration > +num) ||
          (op === '<' && duration < +num) ||
          (op === '=' && duration === +num)
        ) {
          return true;
        }
      }

      // Match preferred phase
      const phaseMatch = lower.match(/phase.*\b(\d+)\b/);
      if (phaseMatch) {
        const phase = phaseMatch[1];
        if (task.PreferredPhases?.includes(phase)) return true;
      }

      return false;
    });

    onFiltered(filtered);
  };

  return (
    <div className="my-4 flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 e.g. tasks with duration > 2 and skill welding"
        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Filter
      </button>
    </div>
  );
};

export default TaskSearchBar;
