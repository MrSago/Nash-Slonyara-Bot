const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const config = require("./environment.js");
const logger = require("./logger.js");
const helpMessages = require("./help_messages.js");

const TelegramBot = require("node-telegram-bot-api");

logger.init("info");

const bot = new TelegramBot(config.telegram.token, { polling: true });

bot.on("polling_error", (error) => {
  logger.error(error);
});

bot.onText(`^\/start(@${config.telegram.login})?$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, helpMessages.startMessage, {
    parse_mode: "Markdown",
  });
});

bot.onText(`^\/help(@${config.telegram.login})?$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, helpMessages.helpMessage, {
    parse_mode: "Markdown",
  });
});

bot.onText(`^\/android(@${config.telegram.login})?$`, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, helpMessages.androidMessage, {
    parse_mode: "Markdown",
  });
});

bot.onText(`^\/ovpn(@${config.telegram.login})?$`, async (msg) => {
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
    if (
      member.status !== "member" &&
      member.status !== "administrator" &&
      member.status !== "creator"
    ) {
      bot.sendMessage(
        chat_id,
        "Эта команда доступна только участникам приватной группы!"
      );
      return;
    }

    const user_login = msg.from.username;
    const ovpn_file = `/root/${user_login}.ovpn`;
    if (fs.existsSync(ovpn_file)) {
      bot
        .sendMessage(
          chat_id,
          "Ключ с вашим логином уже зарегистрирован в OpenVPN."
        )
        .then(() => {
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
              bot.sendMessage(chat_id, "Инструкция по установке /help.");
            })
            .catch((err) => {
              logger.error(err);
            });
        });
      return;
    }

    await bot.sendMessage(chat_id, "Ваш файлик подготавливается, ожидайте...");

    const tmp_input_file = `${os.tmpdir()}/${user_login}`;
    fs.writeFileSync(tmp_input_file, `1\n${user_login}\n1\n`, "utf8");

    const input = fs.createReadStream(tmp_input_file);
    const openvpn_config_file = "/root/openvpn-config.sh";
    const child = spawn(openvpn_config_file);
    input.pipe(child.stdin);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("close", (code) => {
      logger.info(`Child process exited with code ${code}`);

      fs.unlinkSync(tmp_input_file);

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
          bot.sendMessage(chat_id, "Инструкция по установке /help.");
        })
        .catch((err) => {
          logger.error(err);
        });
    });
  } catch (err) {
    logger.error(err);
  }
});

bot.onText(`^\/info(@${config.telegram.login})?$`, async (msg) => {
  try {
    const group_id = config.telegram.group_id;
    const group_members = await bot.getChatMembers(group_id);

    const files = fs.readdirSync("/root/");
    const ovpn_files = files.filter((file) => file.endsWith(".ovpn"));

    const user_status = {};
    for (const member of group_members) {
      const user_login = member.user.username;
      const has_file = ovpn_files.some((file) => file === `${user_login}.ovpn`);
      user_status[user_login] = has_file ? "created" : "not created";
    }

    let info_message =
      "Статус создания файла для каждого участника группы:\n\n";
    for (const user_login in user_status) {
      info_message += `${user_login}: ${user_status[user_login]}\n`;
    }

    const chat_id = msg.chat.id;
    bot.sendMessage(chat_id, info_message, { parse_mode: "Markdown" });
  } catch (err) {
    logger.error(err);
  }
});

logger.info(`Bot ${config.telegram.login} started!`);
