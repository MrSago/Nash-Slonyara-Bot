function IsPrivateChat(bot, msg) {
  const is_private = msg.chat.type == "private";
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
    (member.status == "member" ||
      member.status == "administrator" ||
      member.status == "creator");
  if (!is_in_group) {
    bot.sendMessage(
      msg.chat.id,
      "Эта команда доступна только участникам приватной группы!"
    );
  }
  return is_in_group;
}

module.exports = {
  IsPrivateChat,
  UserInPrivateGroup,
};
