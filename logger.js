const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const defaultLevelLog = "info";

var currentLevel = defaultLevelLog;

function init(level) {
  setLevel(level);
}

function log(message, level = defaultLevelLog) {
  if (LEVELS[level] > LEVELS[currentLevel]) {
    return;
  }

  const timestamp = new Date().toLocaleString();
  const log_message = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "error":
      console.error(log_message);
      break;
    case "warn":
    case "info":
    case "debug":
      console.log(log_message);
      break;
    default:
      console.log(`[${timestamp}] [UNKNOWN] ${message}`);
  }
}

function error(message) {
  log(message, "error");
}

function warn(message) {
  log(message, "warn");
}

function info(message) {
  log(message, "info");
}

function debug(message) {
  log(message, "debug");
}

function setLevel(newLevel) {
  if (newLevel in LEVELS) {
    currentLevel = newLevel;
  }
}

module.exports = {
  init,
  error,
  warn,
  info,
  debug,
  setLevel,
};