import { useState } from 'react';

interface Rule {
  type: string;
  [key: string]: any;
}

interface NLRuleGeneratorProps {
  onAddRule: (rule: Rule) => void;
  taskIds: string[]; // ✅ for validation
}

const NLRuleGenerator = ({ onAddRule, taskIds }: NLRuleGeneratorProps) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<Rule | null>(null);

  const parseRule = (text: string): Rule | null => {
    // Format 1: Make T1 run after T2
    let match = text.match(/make (\w+) run after (\w+)/i);
    if (match) {
      return { type: 'dependency', after: match[1], before: match[2] };
    }

    // Format 2: T1 depends on T2
    match = text.match(/(\w+) depends on (\w+)/i);
    if (match) {
      return { type: 'dependency', after: match[1], before: match[2] };
    }

    // Format 3: Run T1 after T2
    match = text.match(/run (\w+) after (\w+)/i);
    if (match) {
      return { type: 'dependency', after: match[1], before: match[2] };
    }

    return null;
  };

  const handlePreview = () => {
    const rule = parseRule(input);
    if (!rule) {
      alert('❌ Could not understand rule. Try formats like "Make T1 run after T2" or "T1 depends on T2"');
      setPreview(null);
      return;
    }

    // ✅ Task ID validation
    if (!taskIds.includes(rule.before) || !taskIds.includes(rule.after)) {
      alert(`❌ Task IDs not found. Ensure "${rule.after}" and "${rule.before}" are valid.`);
      setPreview(null);
      return;
    }

    setPreview(rule);
  };

  const handleSubmit = () => {
    if (!preview) return;
    onAddRule(preview);
    setInput('');
    setPreview(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4 mt-6">
      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">🧠 Natural Language Rule</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='e.g. Make T1 run after T2'
        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 dark:bg-gray-700 dark:text-white"
      />

      <div className="flex gap-2">
        <button
          onClick={handlePreview}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          🔍 Preview Rule
        </button>

        <button
          onClick={handleSubmit}
          disabled={!preview}
          className={`${
            preview ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          } text-white px-4 py-2 rounded`}
        >
          ➕ Add Rule
        </button>
      </div>

      {preview && (
        <div className="mt-4 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-2 rounded">
          ✅ Preview: <code>{JSON.stringify(preview)}</code>
        </div>
      )}
    </div>
  );
};

export default NLRuleGenerator;
