# logic.py
import sys
import json

def handle_logic(message):
    text = message.lower()
    if "hello" in text:
        return "Chào bạn! Mình là bot xử lý bằng Python."
    elif "ai là bạn" in text:
        return "Tôi là logic Python phía sau bot Messenger."
    elif "bye" in text:
        return "Tạm biệt nhé!"
    else:
        return f"Tôi chưa hiểu: '{text}'"

if __name__ == "__main__":
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
        reply = handle_logic(data.get("message", ""))
        print(json.dumps({"reply": reply}))
    except Exception as e:
        print(json.dumps({"reply": "Lỗi xử lý từ Python!"}))
