import os
from pathlib import Path
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
import pandas as pd

# ----------------------
# Dataset for DeepFace -> Text
# ----------------------
class EmotionTextDataset(Dataset):
    def __init__(self, csv_path, tokenizer, max_len=128):
        self.df = pd.read_csv(csv_path)
        self.tokenizer = tokenizer
        self.max_len = max_len
        # Determine feature columns and target column with fallbacks
        candidate_feature_cols = ["happy", "sad", "neutral"]
        self.feature_cols = [c for c in candidate_feature_cols if c in self.df.columns]

        # Prefer 'target_text', else 'text', else first string-like column
        if "target_text" in self.df.columns:
            self.target_col = "target_text"
        elif "text" in self.df.columns:
            self.target_col = "text"
        else:
            # pick the first non-numeric column as text
            non_numeric_cols = [c for c in self.df.columns if self.df[c].dtype == 'object']
            self.target_col = non_numeric_cols[0] if non_numeric_cols else self.df.columns[0]

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        # Convert available features into string prompt (if present)
        if all(col in row for col in self.feature_cols) and len(self.feature_cols) > 0:
            parts = [f"{col}:{row[col]}" for col in self.feature_cols]
            features_str = ", ".join(parts) + " -> "
        else:
            features_str = ""
        prompt = features_str + str(row[self.target_col])
        enc = self.tokenizer(
            prompt,
            truncation=True,
            padding='max_length',
            max_length=self.max_len,
            return_tensors='pt'
        )
        return {
            'input_ids': enc['input_ids'].squeeze(),
            'attention_mask': enc['attention_mask'].squeeze(),
            'labels': enc['input_ids'].squeeze()
        }

# ----------------------
# Load Model & Tokenizer
# ----------------------
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "google/gemma-2-2b"   # gated HF model

# Pass token only if provided to avoid errors in environments without it
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_ID,
    use_auth_token=HF_TOKEN if HF_TOKEN else None,
)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    use_auth_token=HF_TOKEN if HF_TOKEN else None,
    attn_implementation='eager',
)

# ----------------------
# Prepare Dataset
# ----------------------
# Resolve CSV path relative to this file to avoid FileNotFoundError
BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "student_depression_dataset.csv"
if not CSV_PATH.exists():
    raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

dataset = EmotionTextDataset(str(CSV_PATH), tokenizer)
dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

# ----------------------
# Training
# ----------------------
training_args = TrainingArguments(
    output_dir="./gemma2b_deepface",
    per_device_train_batch_size=2,
    num_train_epochs=3,
    logging_steps=10,
    save_steps=50,
    fp16=torch.cuda.is_available(),
    save_total_limit=2,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

trainer.train()

# ----------------------
# Export to ONNX
# ----------------------
# Save ONNX under api/models regardless of CWD
models_dir = Path(__file__).resolve().parents[1] / "models"
models_dir.mkdir(parents=True, exist_ok=True)
onnx_path = models_dir / "gemma2b_deepface.onnx"
model.eval()
dummy_input = torch.randint(0, tokenizer.vocab_size, (1, 128)).to(model.device)

torch.onnx.export(
    model,
    (dummy_input,),
    onnx_path,
    input_names=["input_ids"],
    output_names=["logits"],
    dynamic_axes={"input_ids": {0: "batch_size", 1: "seq_len"},
                  "logits": {0: "batch_size", 1: "seq_len"}},
    opset_version=13,
)

print("Gemma2B ONNX model exported to:", onnx_path)
