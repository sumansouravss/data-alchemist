import React from 'react';

interface PriorityPanelProps {
  priorities: {
    priorityLevelWeight: number;
    fairnessWeight: number;
    fulfillmentWeight: number;
  };
  setPriorities: React.Dispatch<React.SetStateAction<{
    priorityLevelWeight: number;
    fairnessWeight: number;
    fulfillmentWeight: number;
  }>>;
}

const PriorityPanel: React.FC<PriorityPanelProps> = ({ priorities, setPriorities }) => {
  const handleChange = (key: string, value: number) => {
    setPriorities((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white shadow rounded p-4 mt-6">
      <h2 className="text-lg font-bold mb-4">🎛 Prioritization Settings</h2>

      {(['priorityLevelWeight', 'fairnessWeight', 'fulfillmentWeight'] as const).map((key) => (
        <div key={key} className="mb-4">
          <label className="block font-medium text-sm mb-1 capitalize">
            {key.replace(/Weight/, '').replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={priorities[key]}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-600">Value: {priorities[key]}</span>
        </div>
      ))}
    </div>
  );
};

export default PriorityPanel;
