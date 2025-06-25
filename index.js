const login = require("fca-unofficial");
const { exec } = require("child_process");

const email = process.env.FB_EMAIL;
const password = process.env.FB_PASS;

login({ email, password }, (err, api) => {
  if (err) return console.error(err);

  console.log("✅ Bot đã đăng nhập thành công!");

  api.listenMqtt((err, message) => {
    if (err) return console.error(err);

    const msg = message.body;

    // Gọi file logic.py để xử lý nội dung
    exec(`python logic.py "${msg}"`, (error, stdout) => {
      if (error) {
        api.sendMessage("❌ Lỗi xử lý tin nhắn", message.threadID);
        return;
      }

      const reply = stdout.trim();
      api.sendMessage(reply, message.threadID);
    });
  });
});

// 👇 Trick để Render Free Web Service không tắt bot
require("http")
  .createServer((req, res) => {
    res.end("Bot is running!");
  })
  .listen(process.env.PORT || 3000);
