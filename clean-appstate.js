const fs = require("fs");
const appState = require("./appstate.json");

const cleaned = appState.map((cookie) => {
  return { key: cookie.key, value: cookie.value };
});

fs.writeFileSync("appstate.json", JSON.stringify(cleaned, null, 2));
console.log("✅ Đã làm sạch appstate.json (bỏ domain, path, expires...)");
