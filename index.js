const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const config = require("./environment.js");
const logger = require("./logger.js");

const TelegramBot = require("node-telegram-bot-api");

logger.init("info");

const bot = new TelegramBot(config.telegram.token, { polling: true });

bot.on("polling_error", (error) => {
  logger.error(error);
});

bot.onText(`^\/start(@${config.telegram.login})?$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(
    chat_id,
    "Здарова! Чтобы получить файл ovpn введите команду /vpn. Для справки введите /help."
  );
});

bot.onText(`^\/help(@${config.telegram.login})?$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(
    chat_id,
    "Инструкция по установке VPN: " +
      "[Здесь](https://wiki.aeza.net/openvpn-sozdanie-lichnoi-virtualnoi-chastnoi-seti#id-3.-skachivanie-i-podklyuchenie-klienta-openvpn-na-pk)\n" +
      "Аналогично делается для мобильных устройств.\n" +
      "[Dekstop](https://openvpn.net/community-downloads/) " +
      "и [Android](https://play.google.com/store/apps/details?id=net.openvpn.openvpn&hl=ru) версии.",
    { parse_mode: "Markdown" }
  );
});

bot.onText(`^\/vpn(@${config.telegram.login})?$`, async (msg) => {
  try {
    const chat_id = msg.chat.id;
    if (msg.chat.type !== "private") {
      bot.sendMessage(
        chat_id,
        "Эта команда доступна только в личных сообщениях бота!"
      );
      return;
    }

    const user_id = msg.from.id;
    const member = await bot.getChatMember(config.telegram.group_id, user_id);
    if (member.status !== "administrator" && member.status !== "creator") {
      bot.sendMessage(
        chat_id,
        "Эта команда доступна только участникам приватной группы!"
      );
      return;
    }

    await bot.sendMessage(chat_id, "Ваш файлик подготавливается, ожидайте...");

    const user_login = msg.from.username;
    const tmp_input_file = `${os.tmpdir()}/${user_login}`;

    fs.writeFileSync(tmp_input_file, `1\n${user_login}\n1\n`, "utf8");

    const input = fs.createReadStream(tmp_input_file);
    const child = spawn("/root/openvpn-config.sh");
    input.pipe(child.stdin);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("close", (code) => {
      logger.info(`child process exited with code ${code}`);

      fs.unlinkSync(tmp_input_file);

      const ovpn_file = `/root/${user_login}.ovpn`;
      const stream = fs.createReadStream(ovpn_file);

      bot
        .sendDocument(
          chat_id,
          stream,
          {},
          {
            contentType: "application/octet-stream",
          }
        )
        .then(() => {
          fs.unlinkSync(ovpn_file);
        })
        .catch((err) => {
          logger.error(err);
        });
    });
  } catch (err) {
    logger.error(err);
  }
});

logger.info("Nash-Slonyara-Bot started!");
