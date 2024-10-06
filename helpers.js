const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const logger = require("./logger.js");
const messages = require("./messages.js");

function IsPrivateChat(bot, msg) {
  const is_private = msg.chat.type === "private";
  if (!is_private) {
    bot.sendMessage(
      msg.chat.id,
      "Эта команда доступна только в личных сообщениях бота!"
    );
  }
  return is_private;
}

async function UserInPrivateGroup(bot, msg, group_id) {
  const member = await bot.getChatMember(group_id, msg.from.id);
  const is_in_group =
    member &&
    (member.status === "member" ||
      member.status === "administrator" ||
      member.status === "creator");
  if (!is_in_group) {
    bot.sendMessage(
      msg.chat.id,
      "Эта команда доступна только участникам приватной группы!"
    );
  }
  return is_in_group;
}

function OVPNFileExists(bot, msg, ovpn_file) {
  const is_file_exists = fs.existsSync(ovpn_file);
  if (is_file_exists) {
    const chat_id = msg.chat.id;
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
          });
      })
      .catch(logger.error);
  }
  return is_file_exists;
}

function createOVPNFile(bot, chat_id, input_file, ovpn_file) {
  const openvpn_config_file = "/root/openvpn-config.sh";
  if (!fs.existsSync(openvpn_config_file)) {
    logger.error(`File ${openvpn_config_file} not found!`);
    bot.sendMessage(chat_id, messages.internalError);
    return;
  }

  const child = spawn(openvpn_config_file);
  const input = fs.createReadStream(input_file);
  input.pipe(child.stdin);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    logger.info(`Child process exited with code ${code}`);

    fs.unlinkSync(input_file);

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
      .catch((err) => {
        logger.error(err);
      });
  });
}

function makeOVPNFile(file_name) {
  // const user_login = msg.from.username;
  // const ovpn_file_first = `/root/${user_login}_first.ovpn`;
  // const ovpn_file_second = `/root/${user_login}_second.ovpn`;

  const ovpn_file = `/root/${file_name}.ovpn`;

  const tmp_input_file = `${os.tmpdir()}/${file_name}`;
  const input = `1\n${file_name}\n1\n`;
  fs.writeFileSync(tmp_input_file, input, "utf8");

  if (!helpers.OVPNFileExists(bot, msg, ovpn_file)) {
    helpers.createOVPNFile(bot, chat_id, tmp_input_file, file_name);
  }
}

module.exports = {
  IsPrivateChat,
  UserInPrivateGroup,
  OVPNFileExists,
  createOVPNFile,
  makeOVPNFile,
};
