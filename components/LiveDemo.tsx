"use client";

import { useState, useRef } from "react";
import {
  MessageSquareText,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Smile,
  Gauge,
  Zap,
} from "lucide-react";
import { analyzeSingleComment, type SingleCommentResponse } from "@/services/api";

const PLACEHOLDER_EXAMPLES = [
  "This product is absolutely amazing! 😍 Best purchase ever!",
  "Terrible experience, waste of money 😡",
  "It's okay, nothing special really.",
  "Love the new update! 🔥🔥🔥 Great work team!",
  "The service was disappointing and slow 😞",
];

export default function LiveDemo() {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SingleCommentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    const text = comment.trim();
    if (!text) return;

    setError(null);
    setResult(null);
    setShowResult(false);
    setLoading(true);

    try {
      const res = await analyzeSingleComment(text);
      setResult(res);
      // Small delay for entrance animation
      setTimeout(() => setShowResult(true), 50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const tryExample = (example: string) => {
    setComment(example);
    setResult(null);
    setShowResult(false);
    setError(null);
    textareaRef.current?.focus();
  };

  const getLabelConfig = (label: string) => {
    switch (label) {
      case "positive":
        return {
          icon: TrendingUp,
          color: "text-positive",
          bg: "bg-positive-bg",
          border: "border-positive/25",
          barColor: "bg-positive",
          glowColor: "shadow-positive/20",
        };
      case "negative":
        return {
          icon: TrendingDown,
          color: "text-negative",
          bg: "bg-negative-bg",
          border: "border-negative/25",
          barColor: "bg-negative",
          glowColor: "shadow-negative/20",
        };
      default:
        return {
          icon: Minus,
          color: "text-neutral",
          bg: "bg-neutral-bg",
          border: "border-neutral/25",
          barColor: "bg-neutral",
          glowColor: "shadow-neutral/20",
        };
    }
  };

  const formatScore = (score: number) => {
    return score >= 0 ? `+${score.toFixed(4)}` : score.toFixed(4);
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Live Demo</h2>
          <p className="text-muted text-xs">Type any comment and see instant AI analysis</p>
        </div>
      </div>

      {/* Input area */}
      <div className="glass p-5">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a comment to analyze sentiment..."
            rows={3}
            maxLength={5000}
            className="w-full bg-surface-2/80 border border-border rounded-xl px-4 py-3 pr-14
                       text-foreground placeholder:text-muted/60 resize-none outline-none
                       focus:border-accent/50 focus:ring-2 focus:ring-accent/10
                       transition-all text-[0.925rem] leading-relaxed"
          />
          <button
            onClick={handleAnalyze}
            disabled={!comment.trim() || loading}
            className="absolute right-3 bottom-3 w-10 h-10 rounded-lg
                       bg-accent hover:bg-accent-light disabled:bg-surface-3 disabled:text-muted
                       text-white flex items-center justify-center
                       transition-all disabled:cursor-not-allowed
                       shadow-lg shadow-accent/20 hover:shadow-accent/30 disabled:shadow-none"
            title="Analyze (Enter)"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <ArrowRight className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Character count */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-muted/50 text-xs">Press Enter to analyze • Shift+Enter for new line</p>
          <span className="text-muted/40 text-xs">{comment.length}/5000</span>
        </div>

        {/* Try examples */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-muted text-xs font-medium uppercase tracking-wider mb-2.5">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDER_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => tryExample(ex)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-border
                           text-muted hover:text-foreground hover:border-accent/30
                           transition-all truncate max-w-[220px]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-negative bg-negative-bg rounded-xl px-4 py-3 text-sm">
          <MessageSquareText className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result card */}
      {result && (
        <div
          className={`mt-5 glass overflow-hidden transition-all duration-500 ease-out ${
            showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Top colored strip */}
          <div className={`h-1 ${getLabelConfig(result.label).barColor}`} />

          <div className="p-5">
            {/* Sentiment label + badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = getLabelConfig(result.label);
                  const Icon = cfg.icon;
                  return (
                    <>
                      <div
                        className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.border} border
                                    flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className={`text-xl font-bold capitalize ${cfg.color}`}>
                          {result.label}
                        </p>
                        <p className="text-muted text-xs">Sentiment Classification</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold tabular-nums
                            badge-${result.label}`}
              >
                {formatScore(result.final_score)}
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* Confidence */}
              <div className="bg-surface-2/60 border border-border/50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Gauge className="w-3.5 h-3.5 text-accent" />
                  <span className="text-muted text-xs font-medium">Confidence</span>
                </div>
                <p className="text-lg font-bold tabular-nums">{confidencePct}%</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      getLabelConfig(result.label).barColor
                    }`}
                    style={{
                      width: showResult ? `${confidencePct}%` : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Emoji score */}
              <div className="bg-surface-2/60 border border-border/50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Smile className="w-3.5 h-3.5 text-accent" />
                  <span className="text-muted text-xs font-medium">Emoji Score</span>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {result.emoji_score === 0 ? "N/A" : formatScore(result.emoji_score)}
                </p>
                {result.emojis_found.length > 0 && (
                  <p className="mt-1 text-sm leading-snug">
                    {result.emojis_found.join(" ")}
                  </p>
                )}
              </div>

              {/* Model score */}
              <div className="bg-surface-2/60 border border-border/50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-muted text-xs font-medium">Model Score</span>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {formatScore(result.model_raw_score)}
                </p>
                <p className="text-muted text-xs mt-1 capitalize">
                  {result.model_label}
                </p>
              </div>
            </div>

            {/* Analyzed comment */}
            <div className="bg-surface-2/40 border border-border/30 rounded-xl px-4 py-3">
              <p className="text-muted text-xs font-medium mb-1.5">Analyzed Comment</p>
              <p className="text-sm text-foreground/90 leading-relaxed break-words">
                &ldquo;{result.comment}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
