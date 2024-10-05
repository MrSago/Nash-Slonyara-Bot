const start =
  "Приветствую! Ознакомьтесь с инструкцией /help.\n\n" +
  "Список доступных команд:\n" +
  "/start - запуск бота\n" +
  "/help - инструкция по установке и настройке OpenVPN\n" +
  "/android - рекомендуемые настройки для Android\n" +
  "/ovpn - получение OpenVPN-ключа\n" +
  "/list - список зарегистрированных OpenVPN-ключей";

const help =
  "*Инструкция по установке и настройке OpenVPN*\n\n" +
  "1. Получите OpenVPN-ключ (.ovpn) с помощью команды /ovpn в личном чате бота [nash_slonyara_vpn_bot](https://t.me/nash_slonyara_vpn_bot).\n" +
  "2.1. Установите и настройте OpenVPN согласно [инструкции](https://wiki.aeza.net/openvpn-sozdanie-lichnoi-virtualnoi-chastnoi-seti#id-3.-skachivanie-i-podklyuchenie-klienta-openvpn-na-pk) (п.3).\n" +
  "2.2. Настройка для Android и iOS выглядит аналогично.\n" +
  "3. Пользуемся!\n\n" +
  "OpenVPN для [Windows](https://openvpn.net/community-downloads/) и [Android](https://play.google.com/store/apps/details?id=net.openvpn.openvpn&hl=ru) версии.\n" +
  "Рекомендуемые настройки Android для более стабильной работы /android.\n" +
  "По всем вопросам обращайтесь в наш чатик.";

const android = "Рекомендуемые настройки для Android: (soon)";

const internalError = "Произошла внутренняя ошибка бота.";

module.exports = {
  start,
  help,
  android,
  internalError,
};
