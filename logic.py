import sys
import json
from datetime import datetime

if len(sys.argv) < 2:
    print("Bạn chưa gửi gì cả.")
    sys.exit()

try:
    data = json.loads(sys.argv[1])
    msg = data.get("message", "").lower()
    sender = data.get("senderID", "unknown")
    time = datetime.now().strftime("%H:%M:%S")
except Exception as e:
    print("Lỗi khi đọc dữ liệu:", str(e))
    sys.exit()

# Trả lời theo nội dung
if msg in ["hi", "hello", "chào"]:
    print(f"Chào bạn ({sender})! Tôi là bot tự động.")
elif "mấy giờ" in msg:
    print(f"Bây giờ là {time}")
elif "bye" in msg:
    print("Tạm biệt nhé!")
elif msg.strip() == "":
    print("Bạn chưa nhập gì cả.")
else:
    print(f"Tôi nhận được từ bạn ({sender}): {msg}")
