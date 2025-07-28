export interface ValidationError {
  type: 'error' | 'warning';
  entity: 'clients' | 'workers' | 'tasks';
  row: number;
  column: string;
  message: string;
}

export function validateData({
  clients,
  workers,
  tasks,
}: {
  clients: Record<string, string>[];
  workers: Record<string, string>[];
  tasks: Record<string, string>[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // ✅ Rule a: Missing Required Columns
  const requiredColumns = {
    clients: ['ClientID', 'PriorityLevel', 'RequestedTaskIDs'],
    workers: ['WorkerID', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase'],
    tasks: ['TaskID', 'Duration', 'RequiredSkills'],
  };

  for (const [entity, required] of Object.entries(requiredColumns)) {
    const rows = { clients, workers, tasks }[entity as keyof typeof requiredColumns];
    if (!rows || !rows.length) continue;

    required.forEach((col) => {
      if (!Object.keys(rows[0]).includes(col)) {
        errors.push({
          type: 'error',
          entity: entity as 'clients' | 'workers' | 'tasks',
          row: -1,
          column: col,
          message: `${col} column is missing`,
        });
      }
    });
  }

  // ✅ Rule b: Duplicate IDs
  const checkDuplicates = (rows: Record<string, string>[], key: string, entity: 'clients' | 'workers' | 'tasks') => {
    const seen = new Set();
    rows.forEach((row, i) => {
      const id = row[key];
      if (seen.has(id)) {
        errors.push({
          type: 'error',
          entity,
          row: i + 1,
          column: key,
          message: `Duplicate ${key}: ${id}`,
        });
      }
      seen.add(id);
    });
  };

  checkDuplicates(clients, 'ClientID', 'clients');
  checkDuplicates(workers, 'WorkerID', 'workers');
  checkDuplicates(tasks, 'TaskID', 'tasks');

  // ✅ Rule c: Malformed Lists
  workers.forEach((row, i) => {
    try {
      const parsed = JSON.parse(row.AvailableSlots);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      errors.push({
        type: 'error',
        entity: 'workers',
        row: i + 1,
        column: 'AvailableSlots',
        message: 'AvailableSlots must be a valid array like [1,2]',
      });
    }
  });

  // ✅ Rule f: Unknown TaskIDs in RequestedTaskIDs
  const validTaskIDs = new Set(tasks.map((t) => t.TaskID));
  clients.forEach((row, i) => {
    const ids = row.RequestedTaskIDs?.split(',').map((s) => s.trim()) || [];
    ids.forEach((id) => {
      if (id && !validTaskIDs.has(id)) {
        errors.push({
          type: 'error',
          entity: 'clients',
          row: i + 1,
          column: 'RequestedTaskIDs',
          message: `Unknown TaskID requested: ${id}`,
        });
      }
    });
  });

  // ✅ Rule i: Overloaded Workers
  workers.forEach((row, i) => {
    try {
      const slots = JSON.parse(row.AvailableSlots);
      const maxLoad = parseInt(row.MaxLoadPerPhase, 10);
      if (Array.isArray(slots) && slots.length < maxLoad) {
        errors.push({
          type: 'warning',
          entity: 'workers',
          row: i + 1,
          column: 'AvailableSlots',
          message: 'AvailableSlots count is less than MaxLoadPerPhase',
        });
      }
    } catch {
      // already reported as malformed above
    }
  });

  // ✅ Rule k: Skill Coverage (Tasks require at least one matching worker skill)
  const allWorkerSkills = new Set(
    workers.flatMap((w) => w.Skills?.split(',').map((s) => s.trim()))
  );

  tasks.forEach((row, i) => {
    const required = row.RequiredSkills?.split(',').map((s) => s.trim()) || [];
    required.forEach((skill) => {
      if (skill && !allWorkerSkills.has(skill)) {
        errors.push({
          type: 'error',
          entity: 'tasks',
          row: i + 1,
          column: 'RequiredSkills',
          message: `No worker found with skill "${skill}"`,
        });
      }
    });
  });

  return errors;
}
