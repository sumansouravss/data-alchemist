import { useEffect, useState } from 'react';
import FileUploader from '../component/FileUploader';
import EditableTable from '../component/EditableTable';
import { validateData, ValidationError } from '../utils/validateData';
import TaskSearchBar from '../component/TaskSearchBar';
import PriorityPanel from '../component/PriorityPanel';
import ExportManager from '../component/ExportManager'; 
import RuleBuilder from '../component/RuleBuilder'; 
import NLRuleInput from '../component/MLRuleInput';
// ✅ Don’t forget this import

type EntityType = 'clients' | 'workers' | 'tasks';

export default function Home() {
  const [clients, setClients] = useState<Record<string, string>[]>([]);
  const [workers, setWorkers] = useState<Record<string, string>[]>([]);
  const [tasks, setTasks] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Record<string, string>[]>([]);
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

  // ✅ Run validations on data update
  useEffect(() => {
    const validationResults = validateData({ clients, workers, tasks });
    setErrors(validationResults);
  }, [clients, workers, tasks]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🧙‍♂️ Data Alchemist</h1>

      <FileUploader onDataParsed={handleDataParsed} />

      {/* ✅ Validation Summary */}
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mt-6">
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

      {/* ✅ Editable Tables */}
      {clients.length > 0 && (
        <EditableTable data={clients} setData={setClients} title="Clients" />
      )}

      {workers.length > 0 && (
        <EditableTable data={workers} setData={setWorkers} title="Workers" />
      )}

      {tasks.length > 0 && (
        <>
          <TaskSearchBar originalData={tasks} onFiltered={setFilteredTasks} />
          <EditableTable
            data={filteredTasks.length > 0 ? filteredTasks : tasks}
            setData={setTasks}
            title="Tasks"
          />
        </>
      )}

      {/* ✅ Priority Panel */}
      <PriorityPanel priorities={priorities} setPriorities={setPriorities} />

      {/* ✅ Export Button */}
      <ExportManager
        clients={clients}
        workers={workers}
        tasks={tasks}
        rules={{ rules: [], priorities }}
      />

      {/* Optional: Debug JSON */}
      <pre className="bg-gray-100 text-sm p-4 mt-6 rounded overflow-auto max-h-80">
        {JSON.stringify({ clients, workers, tasks, priorities }, null, 2)}
      </pre>
    </div>
  );
}
