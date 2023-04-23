const sidsCont = document.getElementById('sids');
const saveSidButton = document.getElementById('save-sid');
const delButton = document.getElementById('delete-sid');
const newSidButton = document.getElementById('new-sid');
const settingsCont = document.getElementById('settings');

let userId = null;
let settings = {
  'old-cover-page': false,
  'nix-modules-tool': false,
  'extensions-beta': false,
  'ssh-tool': false,
  'auto-debug': false,
  'force-ssr': false,
};

let brow = chrome || browser;

// URL consts
const BACKEND = 'https://xl-replit-backend.luisafk.repl.co';

function parseSid(sid) {
  if (sid[1] != ':') {
    return decodeURIComponent(sid);
  }
  return sid;
}

saveSidButton.addEventListener('click', (e) => {
  const sids = [...sidsCont.children].map((i) => parseSid(i.value));

  // check if the SIDs are correct
  fetch(`${BACKEND}/checkSid`, {
    method: 'POST',
    body: sids.join('\n'),
    headers: {
      'Content-Type': 'text/plain',
    },
  }).then((resp) => {
    resp.text().then((results) => {
      const usernames = resp.headers.get('x-usernames').split(',');
      console.log('[XL] Got usernames:', usernames);
      console.log('[XL] SIDs valid:', results);

      for (let i = 0; i < results.length; i++) {
        sidsCont.children[i].dataset.valid = results[i];
        sidsCont.children[i].title = usernames[i];
      }

      brow.storage.local
        .set({
          sid: sids,
          usernames,
        })
        .then(() => {
          console.log('[XL] Saved SIDs and usernames to local CRX storage');
        });
    });
  });
});

// delButton.addEventListener('click', (e) => {
//   brow.storage.local
//     .set({
//       sid: '',
//     })
//     .then(() => {
//       console.log('[XL] Deleted SID from CRX storage');
//       window.location.reload();
//     });
// });

newSidButton.addEventListener('click', (e) => {
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'Enter your SID here...';
  sidsCont.appendChild(inp);
});

// get stored user ID, SID and settings
brow.storage.local
  .get(['userId', 'sid', 'settings'])
  .then(({ userId: storedUserId, sid: sids, settings: storedSettings }) => {
    if (storedUserId) {
      // sidInput.disabled = false;
      saveSidButton.disabled = false;
      userId = storedUserId;
      console.debug('[XL] Got user ID from storage:', userId);
    }

    if (sids) {
      if (typeof sids == 'string') {
        sids = [sids];
      }

      console.debug('[XL] Got SIDs from storage');

      for (let i = 0; i < sids.length; i++) {
        let inp = sidsCont.children[i];

        if (!inp) {
          inp = document.createElement('input');
          inp.type = 'text';
          inp.placeholder = 'Enter your SID here...';
          sidsCont.appendChild(inp);
        }

        inp.value = sids[i];
      }
    }

    if (storedSettings) {
      settings = storedSettings;
      console.debug('[XL] Got settings from storage:', settings);
    } else {
      console.log('[XL] Found no stored settings, storing defaults');
      brow.storage.local
        .set({
          settings,
        })
        .then(() => {
          console.log('[XL] Saved settings');
        });
    }

    for (const [key, val] of Object.entries(settings)) {
      const elm = document.querySelector(`#settings input[name="${key}"]`);

      if (!elm) {
        continue;
      }

      if (elm.type == 'checkbox') {
        elm.checked = val;
      } else {
        elm.value = val;
      }

      if (key == 'show-advanced-settings') {
        settingsCont.dataset.advanced = +val;
      }
    }
  });

settingsCont.addEventListener('input', (e) => {
  console.debug('[XL] Settings changed');

  const key = e.target.name;
  const val = e.target.type == 'checkbox' ? e.target.checked : e.target.value;

  settings[key] = val;

  brow.storage.local
    .set({
      settings,
    })
    .then(() => {
      console.log('[XL] Saved settings');
    });

  if (key == 'show-advanced-settings') {
    settingsCont.dataset.advanced = +val;
  }
});
