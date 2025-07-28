import React, { useState } from 'react';

interface NLTaskSearchBarProps {
  originalData: Record<string, string>[];
  onFiltered: (filtered: Record<string, string>[]) => void;
}

const NLTaskSearchBar: React.FC<NLTaskSearchBarProps> = ({ originalData, onFiltered }) => {
  const [query, setQuery] = useState('');

  const handleNLSearch = () => {
    const lower = query.toLowerCase();

    const filtered = originalData.filter((task) => {
      // 🔍 Skill Match
      if (lower.includes('skill')) {
        const skill = lower.split('skill')[1]?.trim();
        return task.RequiredSkills?.toLowerCase().includes(skill);
      }

      // ⏱ Duration Match (e.g., "duration > 2")
      const durMatch = lower.match(/duration\s*(>|<|=)\s*(\d+)/);
      if (durMatch) {
        const [, op, num] = durMatch;
        const duration = parseInt(task.Duration, 10);
        if ((op === '>' && duration > +num) || (op === '<' && duration < +num) || (op === '=' && duration === +num)) {
          return true;
        }
      }

      // 📆 Phase Match (e.g., "phase 1")
      const phaseMatch = lower.match(/phase\s*(\d+)/);
      if (phaseMatch) {
        const phase = phaseMatch[1];
        return task.PreferredPhases?.includes(phase);
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
        placeholder="🧠 e.g. skill welding, duration > 2, phase 1"
        className="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
      />
      <button
        onClick={handleNLSearch}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
      >
        Natural Filter
      </button>
    </div>
  );
};

export default NLTaskSearchBar;
