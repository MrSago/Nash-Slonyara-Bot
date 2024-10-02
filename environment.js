require("dotenv").config();

module.exports = {
  telegram: {
    token: process.env.telegram_token,
    login: process.env.telegram_login
  }
};