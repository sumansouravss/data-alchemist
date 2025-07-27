import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type EntityType = 'clients' | 'workers' | 'tasks';

interface ParsedData {
  entity: EntityType;
  data: Record<string, string>[];
}

interface FileUploaderProps {
  onDataParsed: (parsed: ParsedData) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    let entity: EntityType | null = null;

    if (fileName.includes('client')) entity = 'clients';
    else if (fileName.includes('worker')) entity = 'workers';
    else if (fileName.includes('task')) entity = 'tasks';

    if (!entity) {
      setError('❌ Invalid file name. Please include "client", "worker", or "task" in the filename.');
      return;
    }

    const reader = new FileReader();

    // Handle XLSX files
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileName.endsWith('.xlsx')
    ) {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          console.log('📘 XLSX Parsed Result:', data);
          onDataParsed({ entity, data });
        } catch (err) {
          setError('❌ Error reading XLSX file.');
          console.error(err);
        }
      };
      reader.readAsBinaryString(file);
    }

    // Handle CSV files
    else if (file.type === 'text/csv' || fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('📄 CSV Parsed Result:', results.data);
          onDataParsed({ entity, data: results.data });
        },
        error: (err) => {
          setError('❌ CSV parsing failed: ' + err.message);
          console.error(err);
        },
      });
    }

    // Invalid file
    else {
      setError('❌ Unsupported file format. Please upload a CSV or XLSX file.');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white max-w-md">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload Clients, Workers, or Tasks File (.csv or .xlsx)
      </label>
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-800 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FileUploader;
