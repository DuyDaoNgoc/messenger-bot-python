const login = require("fca-unofficial-fixed");
const { spawn } = require("child_process");

function callPythonLogic(message, callback) {
  const py = spawn("python", ["logic.py"]);
  let result = "";

  py.stdin.write(JSON.stringify({ message }));
  py.stdin.end();

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stdout.on("end", () => {
    try {
      const output = JSON.parse(result);
      callback(output.reply || "Không phản hồi");
    } catch (e) {
      callback("Lỗi khi đọc kết quả từ Python");
    }
  });

  py.stderr.on("data", (data) => {
    console.error("Lỗi Python:", data.toString());
  });
}

login({ email: "EMAIL_FACEBOOK", password: "PASS_FACEBOOK" }, (err, api) => {
  if (err) return console.error(err);

  console.log("✅ Bot Messenger Python đang hoạt động...");

  api.listenMqtt((err, message) => {
    if (err || !message.body) return;
    const text = message.body;

    callPythonLogic(text, (reply) => {
      api.sendMessage(reply, message.threadID);
    });
  });
});
