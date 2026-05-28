import pickle
import random
import re
import sqlite3
from pathlib import Path

import nltk
import pandas as pd
from flask import Flask, jsonify, render_template, request
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# --- NLTK Setup ---
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)


BASE_DIR = Path(__file__).resolve().parent
DB_NAME = BASE_DIR / "sentiment.db"
MODEL_PATH = BASE_DIR / "models" / "sentiment_model.pkl"
DATA_PATH = BASE_DIR / "data" / "social_media_comments.csv"
TARGET_DATASET_ROWS = 320


class TextPreprocessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words("english"))

    def clean_text(self, text):
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
        text = re.sub(r"[^\w\s]", "", text)
        tokens = text.split()
        cleaned = [self.lemmatizer.lemmatize(word) for word in tokens if word not in self.stop_words]
        return " ".join(cleaned)


class RemedyEngine:
    def __init__(self):
        self.remedy_db = {
            "internet": {
                "description": "Network Issue",
                "remedy": "Escalate to technical support and request a connection quality check.",
            },
            "app": {
                "description": "Application Issue",
                "remedy": "Capture logs, notify engineering, and provide temporary workaround steps.",
            },
            "delivery": {
                "description": "Logistics Issue",
                "remedy": "Coordinate with shipping partner and provide a delay compensation coupon.",
            },
            "service": {
                "description": "Service Experience Issue",
                "remedy": "Route to support lead and arrange a priority follow-up call.",
            },
            "product": {
                "description": "Product Quality Issue",
                "remedy": "Initiate return or replacement process and share a quality feedback form.",
            },
            "billing": {
                "description": "Billing Issue",
                "remedy": "Open a billing ticket and verify invoice corrections within one business day.",
            },
            "payment": {
                "description": "Payment Issue",
                "remedy": "Run payment gateway diagnostics and offer an alternate payment channel.",
            },
            "account": {
                "description": "Account Access Issue",
                "remedy": "Trigger secure account recovery and confirm identity verification status.",
            },
        }

    def get_remedy(self, text, sentiment):
        if sentiment != "negative":
            return "No action required. Sentiment is positive."

        lowered = text.lower()
        for keyword, data in self.remedy_db.items():
            if keyword in lowered:
                return f"[{data['description']}] Action: {data['remedy']}"

        return "General Feedback: Send this case to the support queue for manual triage."


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            remedy TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


def save_analysis(text, sentiment, remedy):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO analysis_history (user_text, sentiment, remedy) VALUES (?, ?, ?)",
        (text, sentiment, remedy),
    )
    conn.commit()
    conn.close()


def get_history(limit=8):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analysis_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return rows


def generate_synthetic_dataset(target_rows=TARGET_DATASET_ROWS, seed=42):
    random_generator = random.Random(seed)

    negative_openers = [
        "I am frustrated because",
        "Really disappointed that",
        "It is unacceptable that",
        "Honestly upset because",
        "I keep noticing that",
    ]
    positive_openers = [
        "I am happy that",
        "Really impressed that",
        "It is great that",
        "Honestly satisfied because",
        "I keep noticing that",
    ]

    negative_topics = {
        "internet": [
            "the internet speed drops during meetings",
            "the internet disconnects every evening",
            "the internet is too slow for basic browsing",
            "the internet connection keeps timing out",
        ],
        "app": [
            "the app crashes during login",
            "the app freezes on the payment screen",
            "the app keeps logging me out",
            "the app response is painfully slow",
        ],
        "delivery": [
            "the delivery arrived two days late",
            "the delivery status stayed incorrect",
            "the delivery package arrived damaged",
            "the delivery partner missed the address",
        ],
        "service": [
            "the service desk reply took too long",
            "the service quality dropped this week",
            "the service agent ended chat without helping",
            "the service process keeps getting delayed",
        ],
        "product": [
            "the product stopped working in one week",
            "the product quality does not match the ad",
            "the product arrived with missing parts",
            "the product performance is below expectations",
        ],
        "billing": [
            "the billing amount was charged twice",
            "the billing statement has wrong taxes",
            "the billing update is still not reflected",
            "the billing invoice details are incorrect",
        ],
        "payment": [
            "the payment page failed at checkout",
            "the payment confirmation was never sent",
            "the payment was debited but order failed",
            "the payment options are not loading",
        ],
        "account": [
            "the account login keeps failing",
            "the account reset link expired immediately",
            "the account verification email never arrived",
            "the account settings are not saving",
        ],
    }

    positive_topics = {
        "internet": [
            "the internet has been stable all week",
            "the internet speed is consistently fast",
            "the internet setup was quick and smooth",
            "the internet uptime has improved a lot",
        ],
        "app": [
            "the app is faster after the latest update",
            "the app interface is clear and easy to use",
            "the app notifications are now very accurate",
            "the app checkout flow works perfectly",
        ],
        "delivery": [
            "the delivery arrived ahead of schedule",
            "the delivery tracking updates were precise",
            "the delivery package was sealed and safe",
            "the delivery partner was polite and efficient",
        ],
        "service": [
            "the service team resolved my issue quickly",
            "the service support was professional and kind",
            "the service callback happened exactly on time",
            "the service process felt effortless",
        ],
        "product": [
            "the product quality is excellent",
            "the product works exactly as advertised",
            "the product setup took only a few minutes",
            "the product value is worth the price",
        ],
        "billing": [
            "the billing summary is accurate and clear",
            "the billing portal is easy to understand",
            "the billing updates appear instantly",
            "the billing support fixed my invoice quickly",
        ],
        "payment": [
            "the payment process was smooth and secure",
            "the payment confirmation arrived immediately",
            "the payment options covered all my needs",
            "the payment gateway worked without delay",
        ],
        "account": [
            "the account setup process was simple",
            "the account recovery worked in one attempt",
            "the account dashboard is very intuitive",
            "the account notifications are reliable",
        ],
    }

    records = []

    for topic, statements in negative_topics.items():
        for opener in negative_openers:
            for statement in statements:
                records.append((f"{opener} {statement}.", "negative"))

    for topic, statements in positive_topics.items():
        for opener in positive_openers:
            for statement in statements:
                records.append((f"{opener} {statement}.", "positive"))

    random_generator.shuffle(records)
    if len(records) < target_rows:
        raise ValueError("Synthetic template pool is smaller than requested dataset size.")

    dataset = pd.DataFrame(records[:target_rows], columns=["text", "sentiment"])
    return dataset


def ensure_dataset(data_path=DATA_PATH, target_rows=TARGET_DATASET_ROWS):
    if data_path.exists():
        try:
            existing_df = pd.read_csv(data_path)
            if {"text", "sentiment"}.issubset(existing_df.columns):
                cleaned_df = existing_df[["text", "sentiment"]].copy()
                cleaned_df["text"] = cleaned_df["text"].astype(str).str.strip()
                cleaned_df["sentiment"] = cleaned_df["sentiment"].astype(str).str.lower().str.strip()
                cleaned_df = cleaned_df[cleaned_df["sentiment"].isin(["positive", "negative"])]
                cleaned_df = cleaned_df.drop_duplicates(subset=["text", "sentiment"])

                if len(cleaned_df) >= target_rows and cleaned_df["sentiment"].nunique() >= 2:
                    return cleaned_df.head(target_rows).reset_index(drop=True)
        except Exception:
            pass

    dataframe = generate_synthetic_dataset(target_rows=target_rows, seed=42)
    data_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(data_path, index=False)
    return dataframe


def train_model(training_df, model_path=MODEL_PATH):
    if training_df["sentiment"].nunique() < 2:
        raise ValueError("Training data must include at least two sentiment classes.")

    local_preprocessor = TextPreprocessor()
    prepared_df = training_df.copy()
    prepared_df["clean_text"] = prepared_df["text"].apply(local_preprocessor.clean_text)

    vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), min_df=1)
    feature_matrix = vectorizer.fit_transform(prepared_df["clean_text"])
    labels = prepared_df["sentiment"]

    classifier = LogisticRegression(max_iter=1200, class_weight="balanced")
    classifier.fit(feature_matrix, labels)

    model_path.parent.mkdir(parents=True, exist_ok=True)
    with model_path.open("wb") as model_file:
        pickle.dump((vectorizer, classifier), model_file)


def load_or_train_assets():
    dataset_df = ensure_dataset()
    should_train = not MODEL_PATH.exists()

    if MODEL_PATH.exists() and DATA_PATH.exists():
        should_train = MODEL_PATH.stat().st_mtime < DATA_PATH.stat().st_mtime

    if should_train:
        train_model(dataset_df)
        print(f"Model trained using {len(dataset_df)} rows.")

    with MODEL_PATH.open("rb") as model_file:
        loaded_vectorizer, loaded_model = pickle.load(model_file)

    return loaded_vectorizer, loaded_model


app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
)

init_db()
vectorizer, model = load_or_train_assets()
preprocessor = TextPreprocessor()
engine = RemedyEngine()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()

    if not text:
        return jsonify({"error": "Text is required."}), 400

    clean_text = preprocessor.clean_text(text)
    vector = vectorizer.transform([clean_text])
    sentiment = model.predict(vector)[0]
    remedy = engine.get_remedy(text, sentiment)

    save_analysis(text, sentiment, remedy)
    return jsonify({"sentiment": sentiment, "remedy": remedy})


@app.route("/history")
def history():
    return jsonify([dict(row) for row in get_history()])


if __name__ == "__main__":
    app.run(debug=True, port=5000)