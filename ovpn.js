const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const logger = require("./logger.js");
const messages = require("./messages.js");

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

function GetClientConnections() {
  const status_file = "/var/log/openvpn/status.log";

  if (!fs.existsSync(status_file)) {
    logger.error(`File ${status_file} not found!`);
    return null;
  }

  const data = fs.readFileSync(status_file, "utf8");
  const result = ParseClientConnections(data);

  return result;
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
      await bot.sendDocument(
        chat_id,
        stream,
        {},
        {
          contentType: "application/octet-stream",
        }
      );

      resolve();
    });
  });
}

function ParseClientConnections(data) {
  const users = {};

  const lines = data.trim().split("\n");
  const client_list_index = lines.findIndex((line) =>
    line.startsWith("Common Name")
  );
  const routing_table_index = lines.findIndex((line) =>
    line.startsWith("ROUTING TABLE")
  );

  for (let i = client_list_index + 1; i < routing_table_index; ++i) {
    const [commonName, realAddress, bytesReceived, bytesSent, connectedSince] =
      lines[i].split(",");
    users[commonName] = {
      realAddress,
      bytesReceived,
      bytesSent,
      connectedSince,
    };
  }

  return users;
}

function ParseRoutingTable(data) {
  const routes = {};

  const lines = data.trim().split("\n");
  const routing_table_index = lines.findIndex((line) =>
    line.startsWith("Virtual Address")
  );
  const global_stats_index = lines.findIndex((line) =>
    line.startsWith("GLOBAL STATS")
  );

  for (let i = routing_table_index + 1; i < global_stats_index; ++i) {
    const [virtualAddress, commonName, realAddress, lastRef] =
      lines[i].split(",");
    users[virtualAddress] = {
      commonName,
      realAddress,
      lastRef,
    };
  }

  return routes;
}

module.exports = {
  MakeOVPNFile,
  GetClientConnections,
};
