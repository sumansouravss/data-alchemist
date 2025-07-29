import { useState } from 'react';


type Rule =
  | { type: 'coRun'; tasks: [string, string] }
  | { type: 'dependency'; before: string; after: string };

interface NLRuleGeneratorProps {
  onAddRule: (rule: Rule) => void;
  taskIds: string[];
}

const NLRuleGenerator = ({ onAddRule, taskIds }: NLRuleGeneratorProps) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<Rule | null>(null);

  const parseRule = (text: string): Rule | null => {
    text = text.trim().toLowerCase();

    const patterns = [
      /make (\w+)\s+run after (\w+)/i,
      /(\w+)\s+depends on (\w+)/i,
      /run (\w+)\s+after (\w+)/i,
      /(\w+)\s+should be executed after (\w+)/i,
      /(\w+)\s+must run after (\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'dependency',
          before: match[2].toUpperCase(),
          after: match[1].toUpperCase(),
        };
      }
    }

    return null;
  };

  const handlePreview = () => {
    const rule = parseRule(input);
    if (!rule) {
      alert('❌ Could not understand rule. Try: "Make T1 run after T2".');
      setPreview(null);
      return;
    }

    if (
      rule.type === 'dependency' &&
      (!taskIds.includes(rule.before) || !taskIds.includes(rule.after))
    ) {
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

  const readableRule = (rule: Rule) => {
    if (rule.type === 'dependency') {
      return `📐 Task ${rule.after} must run after ${rule.before}`;
    } else if (rule.type === 'coRun') {
      return `🔗 Tasks ${rule.tasks[0]} and ${rule.tasks[1]} must run together`;
    }
    return JSON.stringify(rule);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-xl transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-pink-300">
        🧠 Natural Language Rule Generator
      </h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. Make T1 run after T2"
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 dark:bg-gray-700 dark:text-white mb-3 transition-all duration-200"
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePreview}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl transition-transform duration-200 hover:scale-105 shadow-md"
        >
          🔍 Preview Rule
        </button>

        <button
          onClick={handleSubmit}
          disabled={!preview}
          className={`px-5 py-2 rounded-xl text-white shadow-md transition-transform duration-200 ${
            preview
              ? 'bg-green-600 hover:bg-green-700 hover:scale-105'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          ➕ Add Rule
        </button>
      </div>

      {preview && (
        <div className="mt-5 text-sm text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900 px-4 py-3 rounded-xl">
          <span className="font-medium">Preview:</span>{' '}
          <span className="font-mono">{readableRule(preview)}</span>
        </div>
      )}
    </div>
  );
};

export default NLRuleGenerator;
