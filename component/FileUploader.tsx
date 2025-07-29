import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadCloud, FileWarning } from "lucide-react";

type EntityType = "clients" | "workers" | "tasks";

interface ParsedData {
  entity: EntityType;
  data: Record<string, string>[]; // Key point: explicitly typed
}

interface FileUploaderProps {
  onDataParsed: (parsed: ParsedData) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const fileName = file.name.toLowerCase();
    let entity: EntityType | null = null;

    if (fileName.includes("client")) entity = "clients";
    else if (fileName.includes("worker")) entity = "workers";
    else if (fileName.includes("task")) entity = "tasks";

    if (!entity) {
      setError('❌ Invalid file name. Include "client", "worker", or "task".');
      return;
    }

    const reader = new FileReader();

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx")
    ) {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as Record<string, string>[]; // ✅ Fix here
          onDataParsed({ entity, data });
        } catch (err) {
          setError("❌ Error reading XLSX file.");
          console.error(err);
        }
      };
      reader.readAsBinaryString(file);
    } else if (file.type === "text/csv" || fileName.endsWith(".csv")) {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onDataParsed({ entity, data: results.data });
        },
        error: (err) => {
          setError("❌ CSV parsing failed: " + err.message);
          console.error(err);
        },
      });
    } else {
      setError("❌ Unsupported format. Upload CSV or XLSX.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-xl shadow-xl p-8 border w-full max-w-xl mx-auto transition-all duration-300">
      <h2 className="text-xl font-bold text-indigo-700 mb-5 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-indigo-600" />
        Upload Data File
      </h2>

      <label
        htmlFor="file-upload"
        className="flex items-center justify-center p-8 border-2 border-dashed border-indigo-400 rounded-lg cursor-pointer bg-white hover:bg-indigo-100 hover:border-indigo-600 transition"
      >
        <div className="text-center">
          <p className="text-base text-indigo-700 font-medium">
            Click or Drag to upload <strong>.csv</strong> / <strong>.xlsx</strong>
          </p>
          <p className="text-sm text-indigo-500 mt-1">
            File name must include: <em>client</em>, <em>worker</em>, or <em>task</em>
          </p>
        </div>
      </label>

      <input
        id="file-upload"
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
          <FileWarning className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
