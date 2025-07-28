import React from 'react';
import { ValidationError } from '../utils/validateData';
import { summarizeErrors } from '../utils/validateData';

interface Props {
  errors: ValidationError[];
}

const ValidationSummary: React.FC<Props> = ({ errors }) => {
  const summary = summarizeErrors(errors);

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 p-4 rounded mb-6 shadow-md">
      <h2 className="text-lg font-semibold mb-2">📊 Validation Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {Object.entries(summary).map(([entity, counts]) => (
          <div
            key={entity}
            className="bg-white/30 dark:bg-black/30 p-3 rounded-lg shadow-inner backdrop-blur-md border border-white/20"
          >
            <h3 className="font-semibold capitalize mb-1">{entity}</h3>
            <p>
              ❌ <strong>{counts.error}</strong> Errors
            </p>
            <p>
              ⚠️ <strong>{counts.warning}</strong> Warnings
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationSummary;
