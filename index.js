const fs = require("fs");
const { spawn } = require('child_process');

const config = require("./environment.js");
const logger = require("./logger.js");

logger.init("info");

const TelegramBot = require("node-telegram-bot-api");

const login = config.telegram.login;
const bot = new TelegramBot(config.telegram.token, { polling: true });

bot.onText(`^\/start@${login}$`, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Hello!`);
});

bot.onText(`^\/test$`, (msg) => {
  const user_login = msg.from.username;
  fs.writeFileSync("./input.txt", `1\n${user_login}\n1\n`, "utf8");

  const input = fs.createReadStream("./input.txt");
  const child = spawn("cmd.exe", ["/c", "test.bat"]);
  input.pipe(child.stdin);
});

bot.on("polling_error", (error) => {
  console.error(error);
});

logger.info("Nash-Slonyara-Bot started!");
