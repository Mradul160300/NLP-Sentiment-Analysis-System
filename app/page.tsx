"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Sparkles, BarChart3, Shield } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import DatasetList from "@/components/DatasetList";
import LiveDemo from "@/components/LiveDemo";

export default function HomePage() {
  const router = useRouter();
  const [key, setKey] = useState(0);

  const handleAnalysisComplete = (datasetId: number) => {
    router.push(`/dashboard/${datasetId}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <BrainCircuit className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SentimentIQ</span>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground transition-colors px-3 py-1.5"
            >
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by DistilBERT Transformer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4">
            Understand sentiment at scale
            <span className="text-accent">.</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Upload your comments, and our AI analyzes sentiment with emoji-aware scoring.
            Get actionable insights in seconds.
          </p>
        </div>
      </section>

      {/* Feature pills */}
      <section className="px-6 pb-10">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3 stagger">
          {[
            { icon: BrainCircuit, text: "Transformer ML" },
            { icon: Sparkles, text: "Emoji-Aware" },
            { icon: BarChart3, text: "Visual Insights" },
            { icon: Shield, text: "Neutral Detection" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border
                         text-sm text-muted animate-fade-in-up"
            >
              <Icon className="w-4 h-4 text-accent" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Live Demo — single comment analysis */}
      <section className="px-6 pb-12">
        <LiveDemo />
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto w-full px-6">
        <div className="border-t border-border/50" />
      </div>

      {/* Upload section */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto mb-5">
          <h2 className="text-lg font-semibold tracking-tight">Bulk Analysis</h2>
          <p className="text-muted text-xs">Upload a CSV or JSON file with multiple comments</p>
        </div>
        <FileUpload key={key} onAnalysisComplete={handleAnalysisComplete} />
      </section>

      {/* Previous datasets */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <DatasetList key={key} />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted">
          <span>SentimentIQ — AI-Powered Sentiment Analysis</span>
          <span>FastAPI + DistilBERT + Next.js</span>
        </div>
      </footer>
    </div>
  );
}
