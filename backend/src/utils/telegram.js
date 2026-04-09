const axios = require('axios');

const sendTelegram = async (text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown' // Agar format BOLD (*) berfungsi
    });
    console.log("✅ Telegram Sent!");
  } catch (error) {
    console.error("❌ Telegram Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = sendTelegram;