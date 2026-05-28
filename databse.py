import sqlite3
import os

DB_NAME = "sentiment.db"

def get_db_connection():
    """Establishes connection to the SQLite database"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Allows accessing columns by name
    return conn

def init_db():
    """Creates the table if it doesn't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            remedy TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized.")

def save_analysis(text, sentiment, remedy):
    """Saves the analysis result to the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO analysis_history (user_text, sentiment, remedy) VALUES (?, ?, ?)",
        (text, sentiment, remedy)
    )
    conn.commit()
    conn.close()

def get_history(limit=5):
    """Retrieves the last 'limit' number of records"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM analysis_history ORDER BY id DESC LIMIT ?", 
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()
    return rows