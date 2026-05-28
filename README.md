# NLP-Sentiment-Analysis-System
# SentimentIQ — AI-Powered Sentiment Analysis System

SentimentIQ is a smart, easy-to-use tool designed to help you understand the emotions behind customer feedback, reviews, and comments. Whether you have thousands of reviews in a spreadsheet or just want to test a single sentence, SentimentIQ will tell you if the sentiment is **Positive**, **Negative**, or **Neutral**.

### How does it work? (In Simple Terms)
We combine two powerful methods to understand text:
1. **The AI Brain (DistilBERT):** We use a highly trained Artificial Intelligence model that understands English context, sarcasm, and tone.
2. **The Emoji Reader:** Because modern text is full of emojis, we have a custom engine that translates emojis (like 😡 or ❤️) into feelings, giving them extra weight in our final score.

By mixing the AI's understanding of the words with the emotion of the emojis, we get highly accurate results!

---

## Features

- **Live Single-Text Analysis**: Type any sentence and see its sentiment instantly—perfect for quick testing.
- **Bulk File Upload**: Drag and drop large CSV or JSON files to analyze thousands of comments at once.
- **Smart Dashboard**: View your results in a beautiful, easy-to-read dashboard featuring pie charts, top insights, and a searchable table.
- **Emoji-Aware AI**: Our system doesn't ignore emojis; it actively uses them to better understand the true meaning.
- **Export Results**: Download the analyzed data back to your computer as a CSV file.

## Technical Architecture

Under the hood, SentimentIQ is built for speed and reliability.

| Layer    | Technology                                           |
|----------|-------------------------------------------------|
| ML Model | `distilbert-base-uncased-finetuned-sst-2-english` |
| Backend  | FastAPI, SQLAlchemy (async), SQLite, Pydantic   |
| Frontend | Next.js 15, Tailwind CSS v4, Recharts           |
| Emoji    | `emoji` lib + curated sentiment dictionary       |

## Project Structure

```text
Sentiment_Remedy_Project/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── database.py        # Async SQLAlchemy setup
│   │   ├── models/            # Database definitions
│   │   ├── schemas/           # Data validation rules
│   │   ├── routes/            # API Endpoints (upload, analysis, etc.)
│   │   ├── services/          # Core logic (AI model, emoji handling)
│   │   └── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Main page structure
│   │   ├── globals.css        # Styles & animations
│   │   ├── page.tsx           # Homepage & Upload
│   │   ├── live/page.tsx      # Live Sentiment Analysis page (if applicable/present)
│   │   └── dashboard/[id]/    # Dashboard for viewing results
│   ├── components/            # Reusable UI pieces (Charts, Tables)
│   ├── services/              # Connection to backend API
│   └── package.json
└── README.md
```

## Setup & Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- ~1 GB of free disk space (to download the AI model)

### 1. Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install required Python packages
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

*(Note: The AI model (~260 MB) will automatically download the very first time you start the server. This might take a minute!)*

### 2. Frontend Setup

```powershell
# Open a new terminal and navigate to frontend folder
cd frontend

# Install necessary Node packages
npm install

# Start the frontend website
cd frontend
npm run dev
```

### 3. Open the App

- **Website (Frontend)**: Go to http://localhost:3000 in your browser.
- **Backend API Documentation**: Go to http://localhost:8000/docs to see all technical endpoints.

## API Reference (For Developers)

- **Analyze single text**: `POST /analyze-single` with JSON `{"text": "your text"}`
- **Upload a file**: `POST /upload` with form data `file=@comments.csv`
- **Analyze a dataset**: `POST /analyze/{id}`
- **Get dataset results**: `GET /results/{id}`
- **Get dataset insights**: `GET /insights/{id}`
- **List all datasets**: `GET /datasets`
- **Export dataset results**: `GET /export/{id}`

## Input File Formats

When uploading files, the system looks for specific column names to find the text. It automatically detects columns named: `comment`, `text`, `review`, `message`, `content`, or `feedback`.

### CSV Example
```csv
comment
"Great product, love it! ❤️"
"Terrible experience, never again 😡"
"It was okay, nothing special"
```

### JSON Example
```json
[
  { "comment": "Great product, love it! ❤️" },
  { "comment": "Terrible experience, never again 😡" },
  { "comment": "It was okay, nothing special" }
]
```

## How Sentiment Scoring Works (The Math)

If you're curious about how we calculate the final positive/negative/neutral label:

1. **Emoji Check**: We extract all emojis from the text and score them using a curated dictionary.
2. **Text Preparation**: Emojis are converted into text descriptions (e.g., ❤️ becomes `:red_heart:`).
3. **AI Inference**: The DistilBERT model analyzes the text in batches and provides a base score.
4. **Combined Score**: We blend the scores together: `Final Score = (AI Score × 0.7) + (Emoji Score × 0.3)`.
5. **Final Label**:
   - Score > `0.15` → **Positive**
   - Score < `-0.15` → **Negative**
   - Anything in between → **Neutral**
