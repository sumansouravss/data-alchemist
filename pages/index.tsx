import { useEffect, useState } from 'react';
import FileUploader from '../component/FileUploader';
import EditableTable from '../component/EditableTable';
import { ValidationError, Rule } from '../utils/types';
import { validateData } from '../utils/validateData';

import TaskSearchBar from '../component/TaskSearchBar';
import PriorityPanel from '../component/PriorityPanel';
import ExportManager from '../component/ExportManager';
import RuleBuilder from '../component/RuleBuilder';
import NLRuleGenerator from '../component/NLRuleGenerator';
import DarkModeToggle from '../component/DarkModeToggle';
import NLTaskSearchBar from '../component/NLTaskSearchBar';
import ValidationSummary from '../component/ValidationSummary';
import AISuggestionsPanel from '../component/AISuggestionPanel';

type EntityType = 'clients' | 'workers' | 'tasks';
type EntityData = Record<string, string>[];

const isValidTaskId = (taskIds: string[], id: string) => taskIds.includes(id);

export default function Home() {
  const [clients, setClients] = useState<EntityData>([]);
  const [workers, setWorkers] = useState<EntityData>([]);
  const [tasks, setTasks] = useState<EntityData>([]);
  const [filteredTasks, setFilteredTasks] = useState<EntityData>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const [priorities, setPriorities] = useState({
    priorityLevelWeight: 3,
    fairnessWeight: 2,
    fulfillmentWeight: 5,
  });

  const taskIds = tasks.map(t => t.TaskID);

  const handleDataParsed = ({
    entity,
    data,
  }: {
    entity: EntityType;
    data: EntityData;
  }) => {
    if (entity === 'clients') setClients(data);
    if (entity === 'workers') setWorkers(data);
    if (entity === 'tasks') setTasks(data);
  };

  const handleAddRule = (newRule: Rule) => {
    if (newRule.type === 'dependency') {
      if (!isValidTaskId(taskIds, newRule.before) || !isValidTaskId(taskIds, newRule.after)) {
        alert('Invalid task IDs in rule. Please ensure both tasks exist.');
        return;
      }
    }
    setRules(prev => [...prev, newRule]);
  };

  const handleDeleteRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
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
    const validationResults = validateData({ clients, workers, tasks, rules });
    setErrors(validationResults);
  }, [clients, workers, tasks, rules]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#3751AE] to-[#010719] text-slate-100 transition-colors duration-500 ease-in-out">
      {/* Navbar */}
      <div className="scrollable top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md shadow-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-100">
          <h1 className="text-xl font-bold tracking-wide whitespace-nowrap">🧙‍♂️ Data Alchemist</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset the session?')) {
                  localStorage.removeItem('data-alchemist-session');
                  location.reload();
                }
              }}
              className="text-red-300 underline hover:text-red-500 transition"
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
              className="text-blue-300 underline hover:text-blue-500 transition"
            >
              📤 Export
            </button>

            <label htmlFor="import-session" className="text-green-300 underline hover:text-green-500 cursor-pointer transition">
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
                      alert('Invalid session file');
                    }
                  } catch {
                    alert('Failed to parse JSON file');
                  }
                };
                reader.readAsText(file);
              }}
            />

            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative pt-28 p-6 max-w-7xl mx-auto">
        <div className="bg-white/10 rounded-lg shadow-xl p-6 mb-6 backdrop-blur-md">
          <FileUploader onDataParsed={handleDataParsed} />
        </div>

        {errors.length > 0 && <ValidationSummary errors={errors} />}

        {errors.length > 0 && (
          <div className="bg-red-100/80 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 p-4 rounded mt-6 shadow-md">
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

        {[clients, workers, tasks].map((dataSet, idx) => (
          dataSet.length > 0 && (
            <div key={idx} className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
              {idx === 0 && <EditableTable data={clients} setData={setClients} title="Clients" />}
              {idx === 1 && <EditableTable data={workers} setData={setWorkers} title="Workers" />}
              {idx === 2 && (
                <>
                  <TaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
                  <NLTaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
                  <EditableTable
                    data={filteredTasks.length > 0 ? filteredTasks : tasks}
                    setData={setTasks}
                    title="Tasks"
                  />
                  <RuleBuilder onAddRule={handleAddRule} taskIds={taskIds} />
                </>
              )}
            </div>
          )
        ))}

        <div className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
          <NLRuleGenerator onAddRule={handleAddRule} taskIds={taskIds} />
        </div>

        <AISuggestionsPanel tasks={tasks} onAddRule={handleAddRule} />

        {rules.length > 0 && (
          <div className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold mb-2">📋 Defined Rules</h2>
            <ul className="list-disc list-inside text-sm">
              {rules.map((rule, i) => (
                <li key={i} className="flex justify-between items-center mb-1">
                  <code className="bg-gray-100/20 dark:bg-gray-700 px-2 py-1 rounded">{JSON.stringify(rule)}</code>
                  <button
                    className="text-red-400 hover:underline ml-2"
                    onClick={() => handleDeleteRule(i)}
                  >
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
          <PriorityPanel priorities={priorities} setPriorities={setPriorities} />
        </div>

        <div className="bg-white/10 rounded-lg shadow-md p-6 mb-6 backdrop-blur-md">
          <ExportManager clients={clients} workers={workers} tasks={tasks} rules={{ rules, priorities }} />
        </div>

        <pre className="bg-gray-100/10 dark:bg-gray-800 text-sm p-4 mt-6 rounded overflow-auto max-h-80">
          {JSON.stringify({ clients, workers, tasks, rules, priorities }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
