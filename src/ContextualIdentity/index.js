import HostStorage from '../Storage/HostStorage';
import PreferenceStorage from '../Storage/PreferenceStorage';

export const NO_CONTAINER = {
  name: 'No Container',
  icon: 'circle',
  iconUrl: 'resource://usercontext-content/circle.svg',
  color: 'grey',
  colorCode: '#999',
  cookieStoreId: 'firefox-default',
};
export const COLORS = [
  'blue',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'turquoise',
  'yellow',
  'toolbar',
];
export const ICONS = [
  'fingerprint',
  'briefcase',
  'dollar',
  'cart',
  'circle',
  'gift',
  'vacation',
  'food',
  'fruit',
  'pet',
  'tree',
  'chill',
  'fence',
];
const RANDOM_VAL_CONST = 'RANDOM';

class ContextualIdentities {

  constructor() {
    this.contextualIdentities = browser.contextualIdentities;
    this.addOnRemoveListener((changeInfo) => {
      const cookieStoreId = changeInfo.contextualIdentity.cookieStoreId;
      this.cleanPreferences(cookieStoreId);
      this.cleanMaps(cookieStoreId);
    });
  }

  async create(name, color, icon) {
    if (color === RANDOM_VAL_CONST) color = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (icon === RANDOM_VAL_CONST) icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    return this.contextualIdentities.create({
      name: name,
      color: color,
      icon: icon,
    });
  }

  /**
   * Gets rid of a container and all corresponding rules
   */
  async remove(cookieStoreId) {
    if (cookieStoreId === NO_CONTAINER.cookieStoreId) {
      return;
    }
    return this.contextualIdentities.remove(cookieStoreId);
  }

  async cleanMaps(cookieStoreId) {
    const hostMaps = await HostStorage.getAll();
    return HostStorage.remove(Object.keys(hostMaps)
        .filter(host => hostMaps[host].cookieStoreId === cookieStoreId)
    );
  }
  async cleanPreferences(cookieStoreId) {
    const preferences = await PreferenceStorage.getAll();
    return PreferenceStorage.remove(Object.keys(preferences)
        .filter(prefName => prefName.startsWith(`containers.${cookieStoreId}`))
    );
  }

  getAll(details = {}) {
    return this.contextualIdentities.query(details).then((identities) => [...identities, NO_CONTAINER]);
  }

  get(name) {
    if (name === NO_CONTAINER.name) {
      return Promise.resolve([NO_CONTAINER]);
    }
    return this.contextualIdentities.query({name});
  }

  addOnCreateListener(fn) {
    browser.contextualIdentities.onCreated.addListener(fn);
  }

  addOnRemoveListener(fn) {
    browser.contextualIdentities.onRemoved.addListener(fn);
  }

  addOnUpdateListener(fn) {
    browser.contextualIdentities.onUpdated.addListener(fn);
  }

  addOnChangedListener(fn) {
    this.addOnCreateListener(fn);
    this.addOnRemoveListener(fn);
    this.addOnUpdateListener(fn);
  }
}

export default new ContextualIdentities();
