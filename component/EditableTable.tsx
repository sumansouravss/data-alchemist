import React from 'react';

interface EditableTableProps {
  data: Record<string, string>[];
  setData: (newData: Record<string, string>[]) => void;
  title: string;
}

const EditableTable = ({ data, setData, title }: EditableTableProps) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  const isCellInvalid = (key: string, value: string): string | null => {
    if (key === 'PriorityLevel') {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 5) return 'Must be 1–5';
    }
    if (key === 'AttributesJSON') {
      try {
        JSON.parse(value);
      } catch {
        return 'Invalid JSON';
      }
    }
    return null;
  };

  const handleChange = (rowIndex: number, key: string, value: string) => {
    const updated = [...data];
    updated[rowIndex] = { ...updated[rowIndex], [key]: value };
    setData(updated);
  };

  return (
    <div className="mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full border-collapse text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <thead className="bg-gradient-to-r from-indigo-600 to-blue-900 text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left font-medium tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="odd:bg-white even:bg-indigo-50 dark:odd:bg-gray-700 dark:even:bg-gray-600 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900"
              >
                {headers.map((header) => {
                  const value = row[header] ?? '';
                  const error = isCellInvalid(header, value);
                  return (
                    <td key={header} className="px-4 py-2 align-top">
                      <input
                        value={value}
                        onChange={(e) =>
                          handleChange(rowIndex, header, e.target.value)
                        }
                        className={`w-full rounded-md px-2 py-1 border focus:outline-none focus:ring-2 transition-all text-sm ${
                          error
                            ? 'border-red-500 bg-red-100 dark:bg-red-200 dark:text-black'
                            : 'border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 dark:text-white'
                        }`}
                      />
                      {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableTable;
