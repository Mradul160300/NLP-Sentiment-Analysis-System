const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface Dataset {
  id: number;
  name: string;
  file_type: string;
  row_count: number;
  status: string;
  created_at: string;
}

export interface UploadResponse {
  dataset_id: number;
  name: string;
  row_count: number;
  message: string;
}

export interface CommentWithSentiment {
  id: number;
  text: string;
  original_text: string;
  label: string | null;
  confidence: number | null;
  emoji_score: number | null;
  final_score: number | null;
}

export interface SentimentSummary {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

export interface ResultsResponse {
  dataset_id: number;
  dataset_name: string;
  status: string;
  summary: SentimentSummary | null;
  comments: CommentWithSentiment[];
}

export interface InsightsResponse {
  dataset_id: number;
  dataset_name: string;
  summary: SentimentSummary;
  most_positive: CommentWithSentiment[];
  most_negative: CommentWithSentiment[];
}

export interface AnalyzeResponse {
  dataset_id: number;
  status: string;
  message: string;
  total_analyzed: number;
}

// --- API functions ---

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    let errorMsg = body.detail;
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg.map((e: any) => e.msg).join(", ");
    }
    throw new Error(errorMsg || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
  return handleResponse<UploadResponse>(res);
}

export async function analyzeDataset(datasetId: number): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze/${datasetId}`, { method: "POST" });
  return handleResponse<AnalyzeResponse>(res);
}

export async function getDatasets(): Promise<Dataset[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  return handleResponse<Dataset[]>(res);
}

export async function getResults(datasetId: number): Promise<ResultsResponse> {
  const res = await fetch(`${API_BASE}/results/${datasetId}`);
  return handleResponse<ResultsResponse>(res);
}

export async function getInsights(datasetId: number): Promise<InsightsResponse> {
  const res = await fetch(`${API_BASE}/insights/${datasetId}`);
  return handleResponse<InsightsResponse>(res);
}

export function getExportUrl(datasetId: number): string {
  return `${API_BASE}/export/${datasetId}`;
}

export interface SingleCommentResponse {
  comment: string;
  label: string;
  confidence: number;
  emoji_score: number;
  final_score: number;
  emojis_found: string[];
  model_label: string;
  model_raw_score: number;
}

export async function analyzeSingleComment(comment: string): Promise<SingleCommentResponse> {
  const res = await fetch(`${API_BASE}/analyze/single`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  return handleResponse<SingleCommentResponse>(res);
}
