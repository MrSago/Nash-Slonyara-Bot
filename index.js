const fs = require("fs");

const config = require("./environment.js");
const logger = require("./logger.js");
const messages = require("./messages.js");
const ovpn = require("./ovpn.js");
const { IsPrivateChat, UserInPrivateGroup } = require("./helpers.js");

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(config.telegram.token, { polling: true });

const MONTH_COST = 600;

logger.init("info");

bot.on("polling_error", (error) => {
  logger.error(error);
});

bot.onText(`^\/start(@${config.telegram.login})?$`, async (msg) => {
  try {
    const chat_id = msg.chat.id;
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
      return;
    }

    bot.sendMessage(chat_id, messages.start, {
      parse_mode: "html",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/help(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
      return;
    }

    bot.sendMessage(msg.chat.id, messages.help, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/android(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
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
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
      return;
    }

    if (!IsPrivateChat(bot, msg)) {
      return;
    }

    const chat_id = msg.chat.id;
    await bot.sendMessage(chat_id, "Ваши ключи подготавливается, ожидайте...");

    await ovpn.MakeOVPNFile(bot, msg, `${msg.from.username}_first`);
    await ovpn.MakeOVPNFile(bot, msg, `${msg.from.username}_second`);

    bot.sendMessage(chat_id, "Инструкция по установке /help.");
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/list(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
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
      "*Список зарегистрированных OpenVPN-ключей*\n\n" +
      "```\n" +
      ovpn_files.join("\n") +
      "\n```";

    bot.sendMessage(chat_id, info_message, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/cost(@${config.telegram.login})?$`, async (msg) => {
  try {
    if (!(await UserInPrivateGroup(bot, msg, config.telegram.group_id))) {
      return;
    }

    const cost = MONTH_COST;
    const count = bot.getChatMemberCount(config.telegram.group_id);
    const message = messages.cost(cost, count);

    bot.sendMessage(msg.chat.id, message);
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/connections(@${config.telegram.login})?$`, (msg) => {
  try {
    const chat_id = msg.chat.id;

    if (msg.from.id != config.telegram.creator_id) {
      bot.sendMessage(chat_id, "Эта команда доступна только создателю бота!");
      return;
    }

    const connections = ovpn.GetClientConnections();
    if (connections === null) {
      bot.sendMessage(chat_id, messages.internalError);
      return;
    }

    const info_message =
      "*Список активных подключений*\n\n" +
      "```\n" +
      JSON.stringify(connections, null, 2) +
      "\n```";

    bot.sendMessage(chat_id, info_message, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

bot.onText(`^\/routes(@${config.telegram.login})?$`, (msg) => {
  try {
    const chat_id = msg.chat.id;

    if (msg.from.id != config.telegram.creator_id) {
      bot.sendMessage(chat_id, "Эта команда доступна только создателю бота!");
      return;
    }

    const routes = ovpn.GetRoutingTable();
    if (routes === null) {
      bot.sendMessage(chat_id, messages.internalError);
      return;
    }

    const info_message =
      "*Список активных маршрутов*\n\n" +
      "```\n" +
      JSON.stringify(routes, null, 2) +
      "\n```";

    bot.sendMessage(chat_id, info_message, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error(err.stack);
  }
});

logger.info(`Bot ${config.telegram.login} started!`);
