const fs = require("fs");
const path = require("path");

const rawCookie = fs.readFileSync("cookies.txt", "utf-8");

const appState = rawCookie
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const tokens = line.trim().split(/\t/);
    return {
      key: tokens[5],
      value: tokens[6],
      domain: tokens[0],
      path: tokens[2],
      secure: tokens[3] === "TRUE",
      httpOnly: false,
      hostOnly: false,
      expires: tokens[4] === "0" ? null : Number(tokens[4]),
    };
  });

fs.writeFileSync("appstate.json", JSON.stringify(appState, null, 2), "utf-8");
console.log("✅ Đã chuyển cookies.txt → appstate.json");
