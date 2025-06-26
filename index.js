require("dotenv").config();
const fs = require("fs");
const login = require("fca-unofficial-fixed");
const { exec, execSync } = require("child_process");
const http = require("http");

const currentPort = parseInt(process.env.PORT) || 3000;

console.log("📂 Đang kiểm tra appstate.json...");

function checkAppStateAlive(callback) {
  const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
  login({ appState }, (err, api) => {
    if (err) {
      console.error("❌ appstate.json lỗi:", err.error || err);
      return callback(false);
    }
    console.log("✅ appstate còn hoạt động!");
    callback(true);
  });
}

function startLogin() {
  if (fs.existsSync("appstate.json")) {
    console.log("📂 Đang sử dụng cookie từ appstate.json");
    checkAppStateAlive((alive) => {
      if (!alive) {
        console.error("⚠️ Bot bị đăng xuất hoặc appstate sai.");
        process.exit(1);
      }
      const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
      loginWithAutoUpdate({ appState });
    });
  } else {
    const email = process.env.FB_EMAIL;
    const password = process.env.FB_PASS;

    if (!email || !password) {
      console.error("❌ Thiếu FB_EMAIL hoặc FB_PASS trong file .env");
      return;
    }

    console.log("📩 Đang đăng nhập bằng tài khoản...");
    loginWithAutoUpdate({ email, password, forceLogin: true });
  }
}

function loginWithAutoUpdate(loginData) {
  console.log("🚀 Đang thực hiện đăng nhập...");

  login(loginData, async (err, api) => {
    if (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      return;
    }

    const pkgPath = "./node_modules/@dongdev/fca-unofficial/package.json";
    if (fs.existsSync(pkgPath)) {
      exec(
        "npm view @dongdev/fca-unofficial version",
        async (error, stdout) => {
          if (error) {
            console.warn("⚠️ Không kiểm tra được phiên bản:", error);
            return startBot(api);
          }

          const latest = stdout.trim();
          try {
            const current = JSON.parse(fs.readFileSync(pkgPath)).version;
            if (current !== latest) {
              console.warn(`⚠️ Có bản mới: ${current} → ${latest}`);
              console.warn("🔁 Đang cập nhật...");
              try {
                execSync("npm install @dongdev/fca-unofficial@latest", {
                  stdio: "inherit",
                });
                console.log("✅ Cập nhật xong. Đang khởi động lại...");
                await new Promise((r) => setTimeout(r, 5000));
                process.exit(1);
              } catch (e) {
                console.error("❌ Lỗi cập nhật:", e);
                startBot(api);
              }
            } else {
              console.log(`📦 Đang dùng phiên bản mới nhất: ${current}`);
              startBot(api);
            }
          } catch (e) {
            console.warn("⚠️ Không đọc được package.json:", e.message);
            startBot(api);
          }
        }
      );
    } else {
      console.warn("⚠️ Không tìm thấy package.json.");
      startBot(api);
    }
  });
}

function startBot(api) {
  api.setOptions({
    listenEvents: true,
    selfListen: false,
    logLevel: "silent",
    forceLogin: false,
    updatePresence: false,
  });

  api.getCurrentUserID((err, id) => {
    if (err) return console.error("❌ Không lấy được ID:", err);

    api.getUserInfo(id, (err2, info) => {
      if (err2 || !info || !info[id]) {
        console.error("❌ Không lấy được thông tin người dùng.");
        return;
      }

      const name = info[id].name || "Không rõ";
      console.log(`🤖 Bot đã đăng nhập với tên: ${name} (ID: ${id})`);
      api.sendMessage(`✅ Bot "${name}" đã sẵn sàng và hoạt động.`, id);
    });
  });

  api.listenMqtt((err, message) => {
    if (err) {
      console.error("❌ Lỗi khi lắng nghe:", err);
      return;
    }

    if (!message?.body) return;
    const msg = message.body.trim();
    const senderID = message.threadID;

    console.log(`📩 Tin nhắn từ ${senderID}: ${msg}`);
    api.sendTypingIndicator(senderID, true);

    const payload = {
      message: msg,
      senderID: senderID,
      timestamp: message.timestamp,
    };

    exec(`python logic.py '${JSON.stringify(payload)}'`, (error, stdout) => {
      api.sendTypingIndicator(senderID, false);

      if (error) {
        console.error("❌ Lỗi xử lý logic.py:", error);
        api.sendMessage("⚠️ Lỗi xử lý yêu cầu.", senderID);
        return;
      }

      const reply = stdout.trim();
      if (reply) {
        api.sendMessage(reply, senderID);
        console.log("📤 Bot trả lời:", reply);
      } else {
        console.log("⚠️ logic.py không trả về nội dung.");
      }
    });
  });

  console.log("✅ Bot đang chạy và lắng nghe tin nhắn...");
}

function startServer(port) {
  const server = http.createServer((_, res) => res.end("✅ Bot đang chạy..."));

  server.listen(port, () => {
    console.log(`🌐 Server tại http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Cổng ${port} bị chiếm. Thử cổng ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Lỗi server:", err);
    }
  });
}

startLogin();
startServer(currentPort);
