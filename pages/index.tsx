import { useEffect, useState } from 'react';
import FileUploader from '../component/FileUploader';
import EditableTable from '../component/EditableTable';
import { validateData, ValidationError } from '../utils/validateData';
import TaskSearchBar from '../component/TaskSearchBar';
import PriorityPanel from '../component/PriorityPanel';
import ExportManager from '../component/ExportManager';
import RuleBuilder from '../component/RuleBuilder';
import NLRuleGenerator from '../component/NLRuleGenerator';
import DarkModeToggle from '../component/DarkModeToggle';
import NLTaskSearchBar from '../component/NLTaskSearchBar';

const isValidTaskId = (taskIds: string[], id: string) => taskIds.includes(id);

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

  const taskIds = tasks.map(t => t.TaskID);

  const handleDataParsed = ({ entity, data }: { entity: EntityType; data: Record<string, string>[] }) => {
    if (entity === 'clients') setClients(data);
    else if (entity === 'workers') setWorkers(data);
    else if (entity === 'tasks') setTasks(data);
  };

  const handleAddRule = (newRule: any) => {
    if (newRule.type === 'dependency') {
      if (!isValidTaskId(taskIds, newRule.before) || !isValidTaskId(taskIds, newRule.after)) {
        alert('Invalid task IDs in rule. Please ensure both tasks exist.');
        return;
      }
    }
    setRules((prev) => [...prev, newRule]);
  };

  const handleDeleteRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('data-alchemist-session');
    if (savedSession) {
      const { clients, workers, tasks, rules, priorities } = JSON.parse(savedSession);
      setClients(clients || []);
      setWorkers(workers || []);
      setTasks(tasks || []);
      setRules(rules || []);
      setPriorities(priorities || {
        priorityLevelWeight: 3,
        fairnessWeight: 2,
        fulfillmentWeight: 5,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'data-alchemist-session',
      JSON.stringify({ clients, workers, tasks, rules, priorities })
    );
  }, [clients, workers, tasks, rules, priorities]);

  useEffect(() => {
    const validationResults = validateData({ clients, workers, tasks });
    setErrors(validationResults);
  }, [clients, workers, tasks]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
      <div className="relative p-6 max-w-7xl mx-auto">
        <div className="absolute top-4 left-4 z-50">
          <DarkModeToggle />
        </div>

        <div className="flex flex-wrap items-center justify-end mb-6 space-x-4">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset the session?")) {
                localStorage.removeItem("data-alchemist-session");
                location.reload();
              }
            }}
            className="text-sm text-red-500 underline hover:text-red-700 transition-colors"
          >
            🔄 Reset
          </button>

          <button
            onClick={() => {
              const session = JSON.stringify({ clients, workers, tasks, rules, priorities }, null, 2);
              const blob = new Blob([session], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'data-alchemist-session.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="text-sm text-blue-500 underline hover:text-blue-700 transition-colors"
          >
            📤 Export
          </button>

          <label
            htmlFor="import-session"
            className="text-sm text-green-500 underline hover:text-green-700 cursor-pointer transition-colors"
          >
            📥 Import
          </label>
          <input
            type="file"
            accept=".json"
            className="hidden"
            id="import-session"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed = JSON.parse(reader.result as string);
                  if (parsed.clients && parsed.workers && parsed.tasks) {
                    setClients(parsed.clients);
                    setWorkers(parsed.workers);
                    setTasks(parsed.tasks);
                    setRules(parsed.rules || []);
                    setPriorities(parsed.priorities || priorities);
                  } else {
                    alert("Invalid session file");
                  }
                } catch {
                  alert("Failed to parse JSON file");
                }
              };
              reader.readAsText(file);
            }}
          />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">🧙‍♂️ Data Alchemist</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
          <FileUploader onDataParsed={handleDataParsed} />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 p-4 rounded mt-6 shadow-md transition-all duration-300">
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
            <EditableTable data={clients} setData={setClients} title="Clients" />
          </div>
        )}

        {workers.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
            <EditableTable data={workers} setData={setWorkers} title="Workers" />
          </div>
        )}

        {tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
            <TaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
            <NLTaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
            <EditableTable
              data={filteredTasks.length > 0 ? filteredTasks : tasks}
              setData={setTasks}
              title="Tasks"
            />
            <RuleBuilder onAddRule={handleAddRule} taskIds={taskIds} />
          </div>
        )}

        <div className="mt-10 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
            <NLRuleGenerator onAddRule={handleAddRule} taskIds={taskIds} />
          </div>
        </div>

        {rules.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
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

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
          <PriorityPanel priorities={priorities} setPriorities={setPriorities} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
          <ExportManager
            clients={clients}
            workers={workers}
            tasks={tasks}
            rules={{ rules, priorities }}
          />
        </div>

        <pre className="bg-gray-100 dark:bg-gray-800 text-sm p-4 mt-6 rounded overflow-auto max-h-80">
          {JSON.stringify({ clients, workers, tasks, rules, priorities }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
