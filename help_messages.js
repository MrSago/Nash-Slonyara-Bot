const startMessage =
  "Приветствую! Ознакомьтесь с инструкцией /help.\n\n" +
  "Список доступных команд:\n" +
  "/start - запуск бота\n" +
  "/help - инструкция по установке и настройке OpenVPN\n" +
  "/android - рекомендуемые настройки для Android\n" +
  "/ovpn - получение OpenVPN-ключа";

const helpMessage =
  "**Инструкция по установке и настройке OpenVPN**\n\n" +
  "1. Получите OpenVPN-ключ (*.ovpn) с помощью команды /ovpn в личном чате боте.\n" +
  "2. Установите и настройте OpenVPN согласно [инструкции](https://wiki.aeza.net/openvpn-sozdanie-lichnoi-virtualnoi-chastnoi-seti#id-3.-skachivanie-i-podklyuchenie-klienta-openvpn-na-pk) (пункт 3).\n" +
  "3. Пользуемся!\n\n" +
  "OpenVPN для [Windows](https://openvpn.net/community-downloads/) и [Android](https://play.google.com/store/apps/details?id=net.openvpn.openvpn&hl=ru) версии.";
// "Инструкция по установке и настройке OpenVPN: " +
// "[здесь](https://wiki.aeza.net/openvpn-sozdanie-lichnoi-virtualnoi-chastnoi-seti#id-3.-skachivanie-i-podklyuchenie-klienta-openvpn-na-pk)\n" +
// "Аналогично делается для мобильных устройств.\n" +
// "OpenVPN для [Windows](https://openvpn.net/community-downloads/) " +
// "и [Android](https://play.google.com/store/apps/details?id=net.openvpn.openvpn&hl=ru) версии.";

const androidMessage = "Рекомендуемые настройки для Android: (soon)";

module.exports = {
  startMessage,
  helpMessage,
  androidMessage,
};
