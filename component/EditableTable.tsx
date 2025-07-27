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
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border px-2 py-1 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-white even:bg-gray-50">
                {headers.map((header) => {
                  const value = row[header] ?? '';
                  const error = isCellInvalid(header, value);
                  return (
                    <td key={header} className="border px-2 py-1">
                      <input
                        value={value}
                        onChange={(e) => handleChange(rowIndex, header, e.target.value)}
                        className={`w-full text-sm px-1 py-0.5 rounded border ${
                          error ? 'border-red-500 bg-red-100' : 'border-gray-200'
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
