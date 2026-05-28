"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getResults, getInsights, getExportUrl } from "@/services/api";
import type { ResultsResponse, InsightsResponse } from "@/services/api";
import SentimentChart from "@/components/SentimentChart";
import CommentsTable from "@/components/CommentsTable";
import InsightsPanel from "@/components/InsightsPanel";

type TabKey = "overview" | "comments" | "insights";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = Number(params.id);

  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [r, i] = await Promise.all([
          getResults(datasetId),
          getInsights(datasetId),
        ]);
        setResults(r);
        setInsights(i);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [datasetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-negative mx-auto mb-3" />
          <p className="font-semibold mb-1">Error loading dashboard</p>
          <p className="text-muted text-sm">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "comments", label: "Comments" },
    { key: "insights", label: "Insights" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-accent" />
            <span className="font-bold">SentimentIQ</span>
          </div>
          <div className="flex-1" />
          <a
            href={getExportUrl(datasetId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border
                       text-sm text-muted hover:text-foreground hover:border-border-light transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>
      </header>

      {/* Dataset info bar */}
      <div className="border-b border-border bg-surface-2/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted mb-0.5">Dataset</p>
            <p className="font-semibold">{results.dataset_name}</p>
          </div>
          {results.summary && (
            <>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted mb-0.5">Total</p>
                  <p className="font-bold text-lg">{results.summary.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-0.5">Positive</p>
                  <p className="font-bold text-lg text-positive">
                    {results.summary.positive_pct}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-0.5">Negative</p>
                  <p className="font-bold text-lg text-negative">
                    {results.summary.negative_pct}%
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === t.key
                  ? "text-accent border-accent"
                  : "text-muted border-transparent hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {tab === "overview" && results.summary && (
          <div className="flex flex-col gap-8">
            <SentimentChart summary={results.summary} />
            {insights && (
              <InsightsPanel
                mostPositive={insights.most_positive}
                mostNegative={insights.most_negative}
              />
            )}
          </div>
        )}

        {tab === "comments" && <CommentsTable comments={results.comments} />}

        {tab === "insights" && insights && (
          <div className="flex flex-col gap-8">
            <SentimentChart summary={insights.summary} />
            <InsightsPanel
              mostPositive={insights.most_positive}
              mostNegative={insights.most_negative}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-7xl mx-auto text-xs text-muted text-center">
          SentimentIQ — Dataset #{datasetId}
        </div>
      </footer>
    </div>
  );
}
