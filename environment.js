require("dotenv").config();

module.exports = {
  telegram: {
    token: process.env.telegram_token,
    login: process.env.telegram_login,
    group_id: process.env.telegram_group_id,
    creator_id: process.env.telegram_creator_id,
  },
};
