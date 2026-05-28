"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadFile, analyzeDataset, type UploadResponse } from "@/services/api";

interface FileUploadProps {
  onAnalysisComplete: (datasetId: number) => void;
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setUploadResult(null);
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "json") {
      setError("Only CSV and JSON files are supported.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File exceeds 50 MB limit.");
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setError(null);

    // Step 1: Upload
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setUploadResult(result);
      setUploading(false);

      // Step 2: Analyze
      setAnalyzing(true);
      await analyzeDataset(result.dataset_id);
      setAnalyzing(false);

      onAnalysisComplete(result.dataset_id);
    } catch (err: unknown) {
      setUploading(false);
      setAnalyzing(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const reset = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    setAnalyzing(false);
    setUploading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      {/* Drop zone */}
      <div
        className={`drop-zone p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          dragActive ? "active" : ""
        } ${file ? "border-solid border-accent/40" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!file ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium text-lg">
                Drop your file here or click to browse
              </p>
              <p className="text-muted text-sm mt-1">
                Supports CSV and JSON • Max 50 MB
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-muted text-sm">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {uploadResult && (
              <div className="flex items-center gap-1.5 text-positive text-sm shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                {uploadResult.row_count} comments
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="text-muted hover:text-foreground text-sm underline shrink-0"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-negative bg-negative-bg rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Action button */}
      {file && !uploadResult && (
        <button
          onClick={handleUploadAndAnalyze}
          disabled={uploading || analyzing}
          className="mt-6 w-full py-3.5 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold
                     transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-accent/20 hover:shadow-accent/30"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Analyze
            </>
          )}
        </button>
      )}

      {/* Analyzing state */}
      {analyzing && (
        <div className="mt-6 glass p-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="font-medium">Analyzing with DistilBERT...</p>
          <p className="text-muted text-sm text-center">
            Running transformer inference on {uploadResult?.row_count} comments.
            This may take a moment.
          </p>
        </div>
      )}
    </div>
  );
}
