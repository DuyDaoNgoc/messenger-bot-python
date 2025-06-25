#!/bin/bash
pip install -r requirements.txt

while true; do
  node index.js
  echo "⚠️ Bot bị lỗi, khởi động lại sau 5 giây..."
  sleep 5
done
