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
  const requiredClientCols = ['ClientID', 'PriorityLevel', 'RequestedTaskIDs'];
  const requiredWorkerCols = ['WorkerID', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase'];
  const requiredTaskCols = ['TaskID', 'Duration', 'RequiredSkills'];

  const checkMissingColumns = (
    rows: Record<string, string>[],
    required: string[],
    entity: 'clients' | 'workers' | 'tasks'
  ) => {
    if (!rows || !rows.length) return;
    required.forEach((col) => {
      if (!Object.keys(rows[0]).includes(col)) {
        errors.push({
          type: 'error',
          entity,
          row: -1,
          column: col,
          message: `${col} column is missing`,
        });
      }
    });
  };

  checkMissingColumns(clients, requiredClientCols, 'clients');
  checkMissingColumns(workers, requiredWorkerCols, 'workers');
  checkMissingColumns(tasks, requiredTaskCols, 'tasks');

  // ✅ Rule b: Duplicate IDs
  const checkDuplicates = (data: Record<string, string>[], key: string, entity: 'clients' | 'workers' | 'tasks') => {
    const seen = new Set();
    data.forEach((row, i) => {
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

  // ✅ Rule c: Malformed Lists (AvailableSlots must be a JSON array)
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
    const taskIDs = row.RequestedTaskIDs?.split(',') || [];
    taskIDs.forEach((id) => {
      if (!validTaskIDs.has(id.trim())) {
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

  // ✅ Rule i: Overloaded workers (AvailableSlots.length < MaxLoadPerPhase)
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
          message: 'Available slots less than max load',
        });
      }
    } catch {
      // already handled in malformed list
    }
  });

  // ✅ Rule k: Skill-coverage matrix (RequiredSkills exist in at least one worker)
  const allWorkerSkills = new Set(workers.flatMap((w) => w.Skills.split(',')));
  tasks.forEach((row, i) => {
    const requiredSkills = row.RequiredSkills?.split(',') || [];
    requiredSkills.forEach((skill) => {
      if (!allWorkerSkills.has(skill.trim())) {
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
