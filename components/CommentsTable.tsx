"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import type { CommentWithSentiment } from "@/services/api";

interface CommentsTableProps {
  comments: CommentWithSentiment[];
}

type SentimentFilter = "all" | "positive" | "negative" | "neutral";

function SentimentBadge({ label }: { label: string | null }) {
  if (!label) return <span className="text-muted text-xs">Pending</span>;
  const cls =
    label === "positive"
      ? "badge-positive"
      : label === "negative"
        ? "badge-negative"
        : "badge-neutral";
  return (
    <span className={`${cls} px-2.5 py-1 rounded-lg text-xs font-semibold capitalize`}>
      {label}
    </span>
  );
}

export default function CommentsTable({ comments }: CommentsTableProps) {
  const [filter, setFilter] = useState<SentimentFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"confidence" | "final_score">("final_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = [...comments];
    if (filter !== "all") list = list.filter((c) => c.label === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.original_text.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sortBy] ?? 0;
      const bv = b[sortBy] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [comments, filter, search, sortBy, sortDir]);

  const toggleSort = (col: "confidence" | "final_score") => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const filters: { key: SentimentFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "positive", label: "Positive" },
    { key: "negative", label: "Negative" },
    { key: "neutral", label: "Neutral" },
  ];

  return (
    <div className="glass overflow-hidden animate-fade-in-up" style={{ animationDelay: "120ms" }}>
      {/* Toolbar */}
      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-accent text-white shadow-md"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm
                       text-foreground placeholder:text-muted focus:outline-none focus:border-accent
                       w-64 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted text-left">
              <th className="px-4 py-3 font-medium w-[50%]">Comment</th>
              <th className="px-4 py-3 font-medium">Sentiment</th>
              <th
                className="px-4 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("confidence")}
              >
                <span className="inline-flex items-center gap-1">
                  Confidence <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="px-4 py-3 font-medium">Emoji</th>
              <th
                className="px-4 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("final_score")}
              >
                <span className="inline-flex items-center gap-1">
                  Score <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No comments match your filters.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 100).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate" title={c.original_text}>
                      {c.original_text}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <SentimentBadge label={c.label} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.confidence != null ? `${(c.confidence * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.emoji_score != null ? c.emoji_score.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {c.final_score != null ? c.final_score.toFixed(3) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 100 && (
        <div className="px-4 py-3 text-sm text-muted text-center border-t border-border">
          Showing 100 of {filtered.length} results
        </div>
      )}
    </div>
  );
}
