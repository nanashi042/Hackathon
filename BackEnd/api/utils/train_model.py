"""
Train a simple text classifier for depression detection from a CSV dataset.

Usage (from repo root):
  python train_model.py --csv student_depression_dataset.csv

Outputs (for inference.py):
  - api/models/depression_model.pkl
  - api/models/emotion_encoder.pkl
"""

import argparse
from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


def infer_text_and_label_columns(df: pd.DataFrame) -> tuple:
    """
    Infer the text and label columns from a dataframe.
    If columns are numeric (no headers), pick last column as label and second-to-last as text.
    """
    # If dataframe has string headers
    str_cols = [c for c in df.columns if isinstance(c, str)]
    if str_cols and 'text' in str_cols and 'label' in str_cols:
        return 'text', 'label'
    # If dataframe has numeric columns (no headers)
    return df.columns[-2], df.columns[-1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, type=str,
                        help="Path to the CSV dataset")
    parser.add_argument("--text-col", default=None,
                        help="Column name or index for text input")
    parser.add_argument("--label-col", default=None,
                        help="Column name or index for labels")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    # Read CSV
    try:
        df = pd.read_csv(csv_path)
    except pd.errors.ParserError:
        # Try reading without headers
        df = pd.read_csv(csv_path, header=None)

    # Determine columns
    text_col = args.text_col
    label_col = args.label_col
    if not text_col or not label_col:
        text_col, label_col = infer_text_and_label_columns(df)
    else:
        # Convert indices to int if provided as string digits
        if str(text_col).isdigit():
            text_col = int(text_col)
        if str(label_col).isdigit():
            label_col = int(label_col)

    # Keep only relevant columns
    if text_col not in df.columns or label_col not in df.columns:
        raise ValueError(f"Columns not found in CSV. Available columns: {list(df.columns)}")

    df = df[[text_col, label_col]].dropna()
    X = df[text_col].astype(str)
    y = df[label_col].astype(str)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if len(set(y)) > 1 else None
    )

    # Build pipeline
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    clf = LogisticRegression(max_iter=200)
    pipeline = Pipeline([("tfidf", vectorizer), ("clf", clf)])
    pipeline.fit(X_train, y_train)

    # Evaluate
    if len(set(y_test)) > 1:
        y_pred = pipeline.predict(X_test)
        print(classification_report(y_test, y_pred))

    # Save models separately
    models_dir = Path(__file__).resolve().parents[1] / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(pipeline.named_steps["clf"], models_dir / "depression_model.pkl")
    joblib.dump(pipeline.named_steps["tfidf"], models_dir / "emotion_encoder.pkl")

    print("Saved models:")
    print(f" - {models_dir / 'depression_model.pkl'}")
    print(f" - {models_dir / 'emotion_encoder.pkl'}")


if __name__ == "__main__":
    main()
