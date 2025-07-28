import React, { useState } from 'react';

interface NLRuleInputProps {
  onAddRule: (rule: any) => void;
}

const NLRuleInput: React.FC<NLRuleInputProps> = ({ onAddRule }) => {
  const [input, setInput] = useState('');

  const parseNaturalRule = (text: string) => {
    const parts = text.toLowerCase().split(' ');

    // Example: "make T1 run after T2"
    if (parts.includes('after')) {
      const after = parts[parts.indexOf('after') + 1];
      const before = parts[parts.indexOf('make') + 1];
      return {
        type: 'precedence',
        before: after,
        after: before,
      };
    }

    // Example: "co-run T1 and T2"
    if (text.includes('co-run') || text.includes('run together')) {
      const matches = text.match(/t\d+/gi);
      return {
        type: 'coRun',
        tasks: matches || [],
      };
    }

    // Example: "limit T1 to phase 3"
    if (text.includes('limit') && text.includes('phase')) {
      const taskId = text.match(/t\d+/i)?.[0];
      const phase = text.match(/\d+/)?.[0];
      return {
        type: 'phaseWindow',
        task: taskId,
        phases: [parseInt(phase || '0')],
      };
    }

    return null;
  };

  const handleSubmit = () => {
    const rule = parseNaturalRule(input);
    if (rule) {
      onAddRule(rule);
      setInput('');
    } else {
      alert('🛑 Could not parse that rule. Try something like "make T1 run after T2"');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">🧠 Natural Language Rule Generator</h3>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "Make T1 run after T2"'
          className="flex-1 border rounded px-3 py-1"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          ➕ Add Rule
        </button>
      </div>
    </div>
  );
};

export default NLRuleInput;
