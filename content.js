let brow = chrome || browser;

document.addEventListener('DOMContentLoaded', (e) => {
  console.debug('[XL] Reading SID from CRX storage');
  brow.storage.local
    .get(['sid', 'activeSid', 'usernames', 'settings'])
    .then(({ sid: sids, usernames, activeSid, settings }) => {
      if (!activeSid) {
        activeSid = 0;
      }

      const s = document.createElement('script');
      s.src = brow.runtime.getURL('inject.js');
      s.dataset.sid = sids.length ? `1${sids[activeSid]}` : '0,null';
      s.dataset.activeSid = activeSid.toString();
      s.dataset.usernames = usernames?.join(',') || '';
      s.dataset.settings = settings ? JSON.stringify(settings) : null;
      document.head.appendChild(s);
      console.debug('[XL] Injected script');
    });
});

window.addEventListener('load', (e) => {
  let userId = null;

  console.debug('[XL] Trying to get user ID from cookies');
  const cookieUserIdMatch = document.cookie.match(/ajs_user_id=(\d+)/);
  if (cookieUserIdMatch) {
    userId = cookieUserIdMatch[1];
    console.debug('[XL] Got Replit user ID by cookie:', userId);
  } else {
    console.warn('[XL] Could not get Replit user ID');
  }

  if (userId) {
    brow.storage.local
      .set({
        userId,
      })
      .then(() => {
        console.debug('[XL] Saved user ID to local CRX storage');
      });
  }
});

window.addEventListener('xl-replit-change-active-sid', (e) => {
  console.debug('[XL] Changing active SID to', e.detail);
  brow.storage.local.get(['sid']).then(({ sid: sids }) => {
    brow.storage.local
      .set({
        activeSid: e.detail,
      })
      .then(() => {
        brow.runtime.sendMessage(
          {
            type: 'change-active-sid',
            value: sids[e.detail],
          },
          {},
          () => {
            window.location.reload();
          }
        );
      });
  });
});
