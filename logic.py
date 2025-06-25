import sys

msg = sys.argv[1].strip().lower()

if "hi" in msg:
    print("Xin chào! Tôi là bot Python.")
elif "name" in msg:
    print("Tôi tên là PythonBot.")
else:
    print("Tôi chưa hiểu. Hỏi cái khác nhé!")
