let brow = chrome || browser;

brow.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, value } = message;

  if (type === 'change-active-sid') {
    brow.cookies
      .set({
        url: 'https://replit.com',
        httpOnly: true,
        name: 'connect.sid',
        value,
      })
      .then(() => {
        sendResponse(true);
      });
  }
});
