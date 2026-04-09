const axios = require('axios');

const sendTelegramMessage = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log("✅ Notifikasi Telegram terkirim!");
  } catch (error) {
    console.error("❌ Gagal kirim Telegram:", error.response?.data || error.message);
  }
};

module.exports = sendTelegramMessage;