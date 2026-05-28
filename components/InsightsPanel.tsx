"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { CommentWithSentiment } from "@/services/api";

interface InsightsPanelProps {
  mostPositive: CommentWithSentiment[];
  mostNegative: CommentWithSentiment[];
}

function CommentCard({
  comment,
  variant,
}: {
  comment: CommentWithSentiment;
  variant: "positive" | "negative";
}) {
  const isPositive = variant === "positive";
  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
        isPositive
          ? "border-positive/20 bg-positive-bg/50 hover:border-positive/40"
          : "border-negative/20 bg-negative-bg/50 hover:border-negative/40"
      }`}
    >
      <p className="text-sm leading-relaxed mb-2">{comment.original_text}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>
          Confidence:{" "}
          <span className="text-foreground font-medium">
            {comment.confidence != null ? `${(comment.confidence * 100).toFixed(1)}%` : "—"}
          </span>
        </span>
        <span>
          Score:{" "}
          <span className="text-foreground font-mono">
            {comment.final_score?.toFixed(3)}
          </span>
        </span>
        {comment.emoji_score != null && comment.emoji_score !== 0 && (
          <span>
            Emoji:{" "}
            <span className="text-foreground font-mono">
              {comment.emoji_score.toFixed(2)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function InsightsPanel({ mostPositive, mostNegative }: InsightsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
      {/* Positive */}
      <div className="glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-positive/10 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4 text-positive" />
          </div>
          <div>
            <h3 className="font-semibold">Most Positive</h3>
            <p className="text-xs text-muted">Highest scoring comments</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {mostPositive.length === 0 ? (
            <p className="text-muted text-sm py-4 text-center">No positive comments found.</p>
          ) : (
            mostPositive.map((c) => (
              <CommentCard key={c.id} comment={c} variant="positive" />
            ))
          )}
        </div>
      </div>

      {/* Negative */}
      <div className="glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-negative/10 flex items-center justify-center">
            <ThumbsDown className="w-4 h-4 text-negative" />
          </div>
          <div>
            <h3 className="font-semibold">Most Negative</h3>
            <p className="text-xs text-muted">Lowest scoring comments</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {mostNegative.length === 0 ? (
            <p className="text-muted text-sm py-4 text-center">No negative comments found.</p>
          ) : (
            mostNegative.map((c) => (
              <CommentCard key={c.id} comment={c} variant="negative" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
