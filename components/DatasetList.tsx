"use client";

import { useEffect, useState } from "react";
import { Database, ArrowRight, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { getDatasets, type Dataset } from "@/services/api";
import { useRouter } from "next/navigation";

export default function DatasetList() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDatasets();
        setDatasets(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load datasets.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-positive" />;
      case "analyzing":
        return <Loader2 className="w-4 h-4 text-accent animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-negative" />;
      default:
        return <Clock className="w-4 h-4 text-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="glass p-8 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <span className="text-muted">Loading datasets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 text-center">
        <AlertCircle className="w-8 h-8 text-negative mx-auto mb-2" />
        <p className="text-negative text-sm">{error}</p>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="glass p-10 text-center">
        <Database className="w-10 h-10 text-muted mx-auto mb-3" />
        <p className="text-muted">No datasets uploaded yet.</p>
        <p className="text-muted text-sm mt-1">Upload a CSV or JSON file to get started.</p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          Recent Datasets
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {datasets.map((ds) => (
          <button
            key={ds.id}
            onClick={() => ds.status === "completed" && router.push(`/dashboard/${ds.id}`)}
            disabled={ds.status !== "completed"}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-2/50
                       transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {statusIcon(ds.status)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{ds.name}</p>
              <p className="text-muted text-xs mt-0.5">
                {ds.row_count} comments • {ds.file_type.toUpperCase()} •{" "}
                {new Date(ds.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-lg capitalize font-medium ${
                ds.status === "completed"
                  ? "badge-positive"
                  : ds.status === "failed"
                    ? "badge-negative"
                    : ds.status === "analyzing"
                      ? "bg-accent/10 text-accent border border-accent/25"
                      : "bg-surface-3 text-muted"
              }`}
            >
              {ds.status}
            </span>
            {ds.status === "completed" && (
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
