const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const config = require("./environment.js");
const logger = require("./logger.js");

const TelegramBot = require("node-telegram-bot-api");
const { error } = require("console");

logger.init("info");

const bot = new TelegramBot(config.telegram.token, { polling: true });

bot.on("polling_error", (error) => {
  logger.error(error);
});

bot.onText(`^\/start$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(
    chat_id,
    "Здарова! Чтобы получить файл ovpn введите команду /vpn"
  );
});

bot.onText(`^\/vpn$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, "Ваш файлик подготавливается, ожидайте...");

  const user_login = msg.from.username;
  const tmp_input_file = `${os.tmpdir()}/${user_login}`;

  fs.writeFileSync(tmp_input_file, `1\n${user_login}\n\n`, "utf8");

  const input = fs.createReadStream(tmp_input_file);
  const child = spawn("/root/openvpn-config.sh");
  input.pipe(child.stdin);

  fs.rmSync(tmp_input_file);

  const ovpn_file = `/root/${user_login}.ovpn`;
  bot
    .sendDocument(chat_id, ovpn_file)
    .then(() => {
      fs.rmSync(ovpn_file);
    })
    .catch((err) => {
      logger.error(err);
    });
});

logger.info("Nash-Slonyara-Bot started!");
