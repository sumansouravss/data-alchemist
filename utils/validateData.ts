export interface ValidationError {
  type: 'error' | 'warning';
  entity: 'clients' | 'workers' | 'tasks';
  row: number;
  column: string;
  message: string;
}

function parsePhases(input: string): number[] {
  try {
    if (input.startsWith('[')) return JSON.parse(input);
    if (input.includes('-')) {
      const [start, end] = input.split('-').map((n) => parseInt(n.trim(), 10));
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return input.split(',').map((n) => parseInt(n.trim(), 10));
  } catch {
    return [];
  }
}

export function validateData({
  clients,
  workers,
  tasks,
  rules = []
}: {
  clients: Record<string, string>[];
  workers: Record<string, string>[];
  tasks: Record<string, string>[];
  rules?: any[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

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
        errors.push({ type: 'error', entity: entity as any, row: -1, column: col, message: `${col} column is missing` });
      }
    });
  }

  const checkDuplicates = (rows: Record<string, string>[], key: string, entity: 'clients' | 'workers' | 'tasks') => {
    const seen = new Set();
    rows.forEach((row, i) => {
      const id = row[key];
      if (seen.has(id)) {
        errors.push({ type: 'error', entity, row: i + 1, column: key, message: `Duplicate ${key}: ${id}` });
      }
      seen.add(id);
    });
  };

  checkDuplicates(clients, 'ClientID', 'clients');
  checkDuplicates(workers, 'WorkerID', 'workers');
  checkDuplicates(tasks, 'TaskID', 'tasks');

  workers.forEach((row, i) => {
    try {
      const parsed = JSON.parse(row.AvailableSlots);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      errors.push({ type: 'error', entity: 'workers', row: i + 1, column: 'AvailableSlots', message: 'AvailableSlots must be a valid array like [1,2]' });
    }
  });

  const validTaskIDs = new Set(tasks.map((t) => t.TaskID));
  clients.forEach((row, i) => {
    const ids = row.RequestedTaskIDs?.split(',').map((s) => s.trim()) || [];
    ids.forEach((id) => {
      if (id && !validTaskIDs.has(id)) {
        errors.push({ type: 'error', entity: 'clients', row: i + 1, column: 'RequestedTaskIDs', message: `Unknown TaskID requested: ${id}` });
      }
    });
  });

  workers.forEach((row, i) => {
    try {
      const slots = JSON.parse(row.AvailableSlots);
      const maxLoad = parseInt(row.MaxLoadPerPhase, 10);
      if (Array.isArray(slots) && slots.length < maxLoad) {
        errors.push({ type: 'warning', entity: 'workers', row: i + 1, column: 'AvailableSlots', message: 'AvailableSlots count is less than MaxLoadPerPhase' });
      }
    } catch {}
  });

  const allWorkerSkills = new Set(
    workers.flatMap((w) => w.Skills?.split(',').map((s) => s.trim()))
  );

  tasks.forEach((row, i) => {
    const required = row.RequiredSkills?.split(',').map((s) => s.trim()) || [];
    required.forEach((skill) => {
      if (skill && !allWorkerSkills.has(skill)) {
        errors.push({ type: 'error', entity: 'tasks', row: i + 1, column: 'RequiredSkills', message: `No worker found with skill "${skill}"` });
      }
    });
  });

  const graph = new Map<string, Set<string>>();
  rules.forEach(rule => {
    if (rule.type === 'coRun') {
      for (let i = 0; i < rule.tasks.length; i++) {
        for (let j = 0; j < rule.tasks.length; j++) {
          if (i !== j) {
            const a = rule.tasks[i], b = rule.tasks[j];
            if (!graph.has(a)) graph.set(a, new Set());
            graph.get(a)!.add(b);
          }
        }
      }
    }
  });
  const visited = new Set();
  const stack = new Set();
  const hasCycle = (node: string): boolean => {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const neighbor of graph.get(node) || []) {
      if (hasCycle(neighbor)) return true;
    }
    stack.delete(node);
    return false;
  };
  for (const node of graph.keys()) {
    if (hasCycle(node)) {
      errors.push({ type: 'error', entity: 'tasks', row: -1, column: 'Rule', message: `Circular co-run detected involving task: ${node}` });
      break;
    }
  }

  tasks.forEach((task, i) => {
    const duration = Number(task.Duration);
    const phases = parsePhases(task.PreferredPhases);
    if (duration > phases.length) {
      errors.push({
        type: 'error',
        entity: 'tasks',
        row: i + 1,
        column: 'PreferredPhases',
        message: `Duration ${duration} exceeds preferred phase count (${phases.length})`,
      });
    }
  });

  const phaseLoad: Record<number, number> = {};
  const phaseCapacity: Record<number, number> = {};
  tasks.forEach(task => {
    const duration = Number(task.Duration);
    const phases = parsePhases(task.PreferredPhases);
    for (const p of phases) {
      phaseLoad[p] = (phaseLoad[p] || 0) + duration;
    }
  });
  workers.forEach(worker => {
    const slots = parsePhases(worker.AvailableSlots);
    for (const p of slots) {
      phaseCapacity[p] = (phaseCapacity[p] || 0) + 1;
    }
  });
  for (const phase in phaseLoad) {
    const phaseNum = Number(phase);
    if (phaseLoad[phaseNum] > (phaseCapacity[phaseNum] || 0)) {
      errors.push({
        type: 'error',
        entity: 'tasks',
        row: -1,
        column: 'PreferredPhases',
        message: `Phase ${phaseNum} overloaded: needs ${phaseLoad[phaseNum]} slots, but only ${phaseCapacity[phaseNum] || 0} available`,
      });
    }
  }

  tasks.forEach((task, i) => {
    const requiredSkills = (task.RequiredSkills || '').split(',').map((s) => s.trim().toLowerCase());
    const preferredPhases = parsePhases(task.PreferredPhases);
    const maxConcurrent = Number(task.MaxConcurrent || 1);

    const qualified = workers.filter(worker => {
      const skills = (worker.Skills || '').split(',').map((s) => s.trim().toLowerCase());
      const hasSkills = requiredSkills.every(rs => skills.includes(rs));
      const slots = parsePhases(worker.AvailableSlots);
      const available = preferredPhases.some(p => slots.includes(p));
      return hasSkills && available;
    });

    if (qualified.length < maxConcurrent) {
      errors.push({
        type: 'warning',
        entity: 'tasks',
        row: i + 1,
        column: 'MaxConcurrent',
        message: `Only ${qualified.length} workers available with required skills, but ${maxConcurrent} needed`,
      });
    }
  });

  return errors;
}
export function summarizeErrors(errors: ValidationError[]) {
  const summary: Record<string, { error: number; warning: number }> = {
    clients: { error: 0, warning: 0 },
    workers: { error: 0, warning: 0 },
    tasks: { error: 0, warning: 0 },
  };

  for (const err of errors) {
    summary[err.entity][err.type]++;
  }

  return summary;
}