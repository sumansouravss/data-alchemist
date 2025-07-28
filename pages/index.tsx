import { useEffect, useState } from 'react';
import FileUploader from '../component/FileUploader';
import EditableTable from '../component/EditableTable';
import { validateData, ValidationError } from '../utils/validateData';
import TaskSearchBar from '../component/TaskSearchBar';
import PriorityPanel from '../component/PriorityPanel';
import ExportManager from '../component/ExportManager';
import RuleBuilder from '../component/RuleBuilder';
import NLRuleInput from '../component/MLRuleInput';
import DarkModeToggle from '../component/DarkModeToggle';
import NLTaskSearchBar from '../component/NLTaskSearchBar'; // ✅ Added natural language search

type EntityType = 'clients' | 'workers' | 'tasks';

export default function Home() {
  const [clients, setClients] = useState<Record<string, string>[]>([]);
  const [workers, setWorkers] = useState<Record<string, string>[]>([]);
  const [tasks, setTasks] = useState<Record<string, string>[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Record<string, string>[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [priorities, setPriorities] = useState({
    priorityLevelWeight: 3,
    fairnessWeight: 2,
    fulfillmentWeight: 5,
  });

  const handleDataParsed = ({ entity, data }: { entity: EntityType; data: Record<string, string>[] }) => {
    if (entity === 'clients') setClients(data);
    else if (entity === 'workers') setWorkers(data);
    else if (entity === 'tasks') setTasks(data);
  };

  const handleAddRule = (newRule: any) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleDeleteRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const validationResults = validateData({ clients, workers, tasks });
    setErrors(validationResults);
  }, [clients, workers, tasks]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors">
      <div className="p-6 max-w-7xl mx-auto">
        <DarkModeToggle />

        <h1 className="text-3xl font-bold mb-6 text-center">🧙‍♂️ Data Alchemist</h1>

        <FileUploader onDataParsed={handleDataParsed} />

        {errors.length > 0 && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 p-4 rounded mt-6">
            <h2 className="font-semibold mb-2">⚠️ Validation Errors</h2>
            <ul className="list-disc list-inside text-sm max-h-60 overflow-auto">
              {errors.map((err, i) => (
                <li key={i}>
                  <strong>{err.entity}</strong> row {err.row} — <em>{err.column}</em>: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {clients.length > 0 && (
          <EditableTable data={clients} setData={setClients} title="Clients" />
        )}
        {workers.length > 0 && (
          <EditableTable data={workers} setData={setWorkers} title="Workers" />
        )}
        {tasks.length > 0 && (
          <>
            <TaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
            <NLTaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
            <EditableTable
              data={filteredTasks.length > 0 ? filteredTasks : tasks}
              setData={setTasks}
              title="Tasks"
            />
          </>
        )}

        <div className="mt-10 space-y-4">
          <RuleBuilder onAddRule={handleAddRule} />
          <NLRuleInput onAddRule={handleAddRule} />
        </div>

        {rules.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">📋 Defined Rules</h2>
            <ul className="list-disc list-inside text-sm">
              {rules.map((rule, i) => (
                <li key={i} className="flex justify-between items-center mb-1">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {JSON.stringify(rule)}
                  </code>
                  <button
                    className="text-red-600 hover:underline ml-2"
                    onClick={() => handleDeleteRule(i)}
                  >
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <PriorityPanel priorities={priorities} setPriorities={setPriorities} />

        <ExportManager
          clients={clients}
          workers={workers}
          tasks={tasks}
          rules={{ rules, priorities }}
        />

        <pre className="bg-gray-100 dark:bg-gray-800 text-sm p-4 mt-6 rounded overflow-auto max-h-80">
          {JSON.stringify({ clients, workers, tasks, rules, priorities }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
