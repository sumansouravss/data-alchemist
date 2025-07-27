// components/ExportManager.tsx
import React from 'react';
import { saveAs } from 'file-saver';
import { Parser } from 'json2csv';

interface ExportManagerProps {
  clients: Record<string, string>[];
  workers: Record<string, string>[];
  tasks: Record<string, string>[];
  rules: {
    rules: any[];
    priorities: {
      priorityLevelWeight: number;
      fairnessWeight: number;
      fulfillmentWeight: number;
    };
  };
}

const ExportManager: React.FC<ExportManagerProps> = ({ clients, workers, tasks, rules }) => {
  const exportCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      alert(`⛔ Cannot export ${fileName} — no data found.`);
      return;
    }

    try {
      const fields = Object.keys(data[0]); // 💡 Dynamically get columns
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, fileName);
    } catch (err) {
      console.error(`❌ CSV export failed for ${fileName}:`, err);
    }
  };

  const exportJSON = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, fileName);
  };

  const handleExportAll = () => {
    exportCSV(clients, 'clients_clean.csv');
    exportCSV(workers, 'workers_clean.csv');
    exportCSV(tasks, 'tasks_clean.csv');
    exportJSON(rules, 'rules.json');
  };

  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleExportAll}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
      >
        📤 Export Clean CSV + rules.json
      </button>
    </div>
  );
};

export default ExportManager;
