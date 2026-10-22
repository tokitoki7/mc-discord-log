const WebSocket = require('ws');
const fetch = require('node-fetch');

// DiscordのWebHook URL（取得したURLに書き換えてください）
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1562866674703667280/67lY1MCiNKvFukX4yJyDgJTjB-thuojtNjdo7gcR7m5G6QXixmEqxfg6BNSMi4ONBODG';

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket サーバー起動中... Port: ${PORT}`);

wss.on('connection', (ws) => {
  console.log('マイクラが接続されました！');

  const subscribeMsg = {
    header: {
      version: 1,
      requestId: '00000000-0000-0000-0000-000000000000',
      messagePurpose: 'subscribe',
      messageType: 'commandRequest'
    },
    body: {
      eventName: 'PlayerMessage'
    }
  };
  ws.send(JSON.stringify(subscribeMsg));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.body && data.body.properties) {
        const messageText = data.body.properties.Message;
        if (messageText && (messageText.includes('入室') || messageText.includes('退出'))) {
          sendToDiscord(messageText);
        }
      }
    } catch (e) {
      console.error('エラー:', e);
    }
  });
});

function sendToDiscord(text) {
  fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text })
  }).catch(err => console.error('Discord送信エラー:', err));
}
