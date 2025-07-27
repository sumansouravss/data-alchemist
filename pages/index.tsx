import { useState } from 'react';
import FileUploader from '../component/FileUploader';
import EditableTable from '../component/EditableTable';

type EntityType = 'clients' | 'workers' | 'tasks';

export default function Home() {
  const [clients, setClients] = useState<Record<string, string>[]>([]);
  const [workers, setWorkers] = useState<Record<string, string>[]>([]);
  const [tasks, setTasks] = useState<Record<string, string>[]>([]);

  const handleDataParsed = ({ entity, data }: { entity: EntityType; data: Record<string, string>[] }) => {
    console.log('📥 Parsed:', entity, data);
    if (entity === 'clients') setClients(data);
    else if (entity === 'workers') setWorkers(data);
    else if (entity === 'tasks') setTasks(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🧙‍♂️ Data Alchemist</h1>

      <FileUploader onDataParsed={handleDataParsed} />

      {clients.length > 0 && (
        <EditableTable data={clients} setData={setClients} title="Clients" />
      )}
      {workers.length > 0 && (
        <EditableTable data={workers} setData={setWorkers} title="Workers" />
      )}
      {tasks.length > 0 && (
        <EditableTable data={tasks} setData={setTasks} title="Tasks" />
      )}

      <pre className="bg-gray-100 text-sm p-4 mt-6 rounded overflow-auto max-h-80">
        {JSON.stringify({ clients, workers, tasks }, null, 2)}
      </pre>
    </div>
  );
}
