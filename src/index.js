import './manifest.json';
import '../static/icons/icon.png';
import Tabs from './Tabs';
import {tabUpdatedListener, webRequestListener} from './containers';
import {messageExternalListener} from './messageExternalListener';
import {cleanUpTemporaryContainers, onTabCreated, onTabRemoved} from './temporaryContainers';

browser.webRequest.onBeforeRequest.addListener(
  webRequestListener,
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['blocking'],
);

browser.runtime.onMessageExternal.addListener(
  messageExternalListener
);

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = browser.runtime.getManifest().version;

    if (currentVersion[0] === '4' && Number(previousVersion[0]) < 4) {
      Tabs.create({ url: 'https://github.com/max-dw-i/container-redirect/releases/tag/v4.0.0' });
    }
  }
});

browser.tabs.onUpdated.addListener(
    tabUpdatedListener
);

browser.tabs.onCreated.addListener(onTabCreated);
browser.tabs.onRemoved.addListener(onTabRemoved);

// Clean up left over containers at startup
cleanUpTemporaryContainers();
