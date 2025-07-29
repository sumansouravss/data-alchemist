// ExportManager.tsx
import React from 'react';
import { downloadCSV } from '../utils/exportCleanCSV';
import { RuleSet } from '../utils/types';

interface ExportManagerProps {
  clients: Record<string, string>[];
  workers: Record<string, string>[];
  tasks: Record<string, string>[];
  rules: RuleSet;
}

const ExportManager = ({ clients, workers, tasks, rules }: ExportManagerProps) => {
  const handleExportSession = () => {
    const session = JSON.stringify({ clients, workers, tasks, ...rules }, null, 2);
    const blob = new Blob([session], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-alchemist-session.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportRulesJSON = () => {
    const rulesBlob = new Blob([JSON.stringify(rules, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(rulesBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rules.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">📁 Export Options</h2>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExportSession}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          💾 Export Full Session
        </button>

        <button
          onClick={handleExportRulesJSON}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          📜 Export Rules (rules.json)
        </button>

        <button
          onClick={() => downloadCSV('clients', clients)}
          className="text-blue-500 underline hover:text-blue-700 transition"
        >
          📄 Export Clean Clients (CSV)
        </button>

        <button
          onClick={() => downloadCSV('workers', workers)}
          className="text-blue-500 underline hover:text-blue-700 transition"
        >
          📄 Export Clean Workers (CSV)
        </button>

        <button
          onClick={() => downloadCSV('tasks', tasks)}
          className="text-blue-500 underline hover:text-blue-700 transition"
        >
          📄 Export Clean Tasks (CSV)
        </button>
      </div>
    </div>
  );
};

export default ExportManager;
