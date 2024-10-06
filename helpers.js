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

async function MakeOVPNFile(bot, msg, file_name) {
  const ovpn_file = `/root/${file_name}.ovpn`;
  const chat_id = msg.chat.id;

  if (!fs.existsSync(ovpn_file)) {
    const tmp_input_file = `${os.tmpdir()}/${file_name}`;
    const input = `1\n${file_name}\n1\n`;
    fs.writeFileSync(tmp_input_file, input, "utf8");

    await RegisterOVPNFile(bot, chat_id, tmp_input_file, ovpn_file);
  } else {
    const stream = fs.createReadStream(ovpn_file);
    await bot.sendDocument(
      chat_id,
      stream,
      {},
      {
        contentType: "application/octet-stream",
      }
    );
  }
}

async function RegisterOVPNFile(bot, chat_id, input_file, ovpn_file) {
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

  await new Promise((resolve, reject) => {
    child.on("close", async (code) => {
      logger.info(`Child process exited with code ${code}`);
      if (code !== 0) {
        reject();
        return;
      }

      fs.unlinkSync(input_file);

      const stream = fs.createReadStream(ovpn_file);
      await bot
        .sendDocument(
          chat_id,
          stream,
          {},
          {
            contentType: "application/octet-stream",
          }
        )
        .catch((err) => {
          logger.error(err.stack);
        });

      resolve();
    });
  });
}

module.exports = {
  IsPrivateChat,
  UserInPrivateGroup,
  MakeOVPNFile,
};
