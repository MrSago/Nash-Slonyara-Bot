const fs = require("fs");
const os = require("os");

const config = require("./environment.js");
const logger = require("./logger.js");
const messages = require("./messages.js");
const helpers = require("./helpers.js");

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(config.telegram.token, { polling: true });

logger.init("info");

bot.on("polling_error", (error) => {
  logger.error(error);
});

bot.onText(`^\/start(@${config.telegram.login})?$`, (msg) => {
  try {
    const chat_id = msg.chat.id;
    if (!helpers.UserInPrivateGroup(bot, msg, config.telegram.group_id)) {
      bot.sendMessage(
        chat_id,
        "Этот бот доступен только участникам приватной группы! Ухади..."
      );
      return;
    }

    bot.sendMessage(chat_id, messages.start, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/help(@${config.telegram.login})?$`, (msg) => {
  try {
    if (!helpers.UserInPrivateGroup(bot, msg, config.telegram.group_id)) {
      return;
    }

    bot.sendMessage(msg.chat.id, messages.help, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/android(@${config.telegram.login})?$`, (msg) => {
  try {
    if (!helpers.UserInPrivateGroup(bot, msg, config.telegram.group_id)) {
      return;
    }

    bot.sendMessage(msg.chat.id, messages.android, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/ovpn(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!helpers.UserInPrivateGroup(bot, msg, config.telegram.group_id)) {
      return;
    }

    if (!helpers.IsPrivateChat(bot, msg)) {
      return;
    }

    // const user_login = msg.from.username;
    // const ovpn_file_first = `/root/${user_login}_first.ovpn`;
    // const ovpn_file_second = `/root/${user_login}_second.ovpn`;

    await bot.sendMessage(
      msg.chat.id,
      "Ваши ключи подготавливается, ожидайте..."
    );

    helpers.makeOVPNFile(bot, msg, `${msg.from.username}_first`);
    // helpers.makeOVPNFile(`${msg.from.username}_second`);

    // const tmp_input_file = `${os.tmpdir()}/${user_login}`;
    // const input_first = `1\n${user_login}_first\n1\n`;
    // fs.writeFileSync(tmp_input_file, input_first, "utf8");

    // if (!helpers.OVPNFileExists(bot, msg, ovpn_file_first)) {
    //   helpers.createOVPNFile(bot, chat_id, tmp_input_file, ovpn_file_first);
    // }

    // const input_second = `1\n${user_login}_second\n1\n`;
    // fs.writeFileSync(tmp_input_file, input_second, "utf8");

    // if (!helpers.OVPNFileExists(bot, msg, ovpn_file_second)) {
    //   helpers.createOVPNFile(bot, chat_id, tmp_input_file, ovpn_file_second);
    // }
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/list(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!helpers.UserInPrivateGroup(bot, msg, config.telegram.group_id)) {
      return;
    }

    const chat_id = msg.chat.id;
    const root_dir = "/root/";
    if (!fs.existsSync(root_dir)) {
      logger.error(`Directory ${root_dir} not found!`);
      bot.sendMessage(chat_id, messages.internalError);
      return;
    }

    const files = fs.readdirSync(root_dir);
    const ovpn_files = files.filter((file) => file.endsWith(".ovpn"));

    const info_message =
      "Список зарегистрированных OpenVPN-ключей:\n\n" + ovpn_files.join("\n");

    bot.sendMessage(chat_id, info_message);
  } catch (err) {
    logger.error(err.stack);
  }
});

logger.info(`Bot ${config.telegram.login} started!`);
