import ContextualIdentities from '../ContextualIdentity';
import State from '../State';
import Storage from '../Storage/HostStorage';
import {cleanHostInput, qs} from '../utils';
import {hideLoader, showLoader} from './loader';
import {hideToast, showToast} from './toast';

const HOST_MAPS_SPLIT_KEY = ',';
const csvEditor = qs('.csv-editor');
const openButton = qs('.ce-open-button');
const closeButton = qs('.ce-close-button');
const saveButton = qs('.ce-save-button');
const hostTextarea = qs('.ce-hosts-textarea');

class CSVEditor {

  constructor(state) {
    this.state = state;
    State.addListener(this.update.bind(this));
    openButton.addEventListener('click', this.showEditor.bind(this));
    closeButton.addEventListener('click', this.hideEditor.bind(this));
    saveButton.addEventListener('click', this.saveUrlMaps.bind(this));
    this.render();
  }

  update(newState) {
    this.state = newState;
    this.render();
  }

  render() {
    showLoader();

    if (!this.state.urlMaps || !this.state.identities) {
      return false;
    }

    const hostLines = Object.values(this.state.urlMaps).map(urlMap => {
      return ContextualIdentities.get(urlMap.containerName)
        .then(containers => {
          const container = containers[0];
          let line = urlMap.host;
          line += ` ${HOST_MAPS_SPLIT_KEY} ${urlMap.containerName}`;
          line += ` ${HOST_MAPS_SPLIT_KEY} ${container.color}`;
          line += ` ${HOST_MAPS_SPLIT_KEY} ${container.icon}`;
          return line;
        });
    });
    Promise.all(hostLines).then(lines => {
      hostTextarea.value = lines.join('\n');
      hideLoader();
    });
  }

  addIdentity(identity, host, maps) {
    maps[host] = {
      host,
      cookieStoreId: identity.cookieStoreId,
      containerName: identity.name,
      enabled: true,
    };
  }

  async createMissingContainers(missingContainers, maps) {
    for (const { hosts, container } of missingContainers) {
      const identity = await ContextualIdentities.create(
        container.name, container.color, container.icon
      );
      for (const host of hosts) {
        this.addIdentity(identity, host, maps);
      }
    }
  }

  async saveUrlMaps() {
    showLoader();
    const items = hostTextarea.value.trim().split('\n').filter(s => s.charAt(0) !== '#');
    const maps = {};
    const missingContainers = {};

    await Promise.all(items.map((item) => {
      const hostMapParts = item.split(HOST_MAPS_SPLIT_KEY);
      const host = cleanHostInput(hostMapParts.slice(0, -3).join(HOST_MAPS_SPLIT_KEY));
      const containerName = hostMapParts[hostMapParts.length - 3];
      const containerColor = hostMapParts[hostMapParts.length - 2];
      const containerIcon = hostMapParts[hostMapParts.length - 1];
      let identity;

      if (host && containerName && containerColor && containerIcon) {
        identity = this.state.identities.find((identity) => cleanHostInput(identity.name) === cleanHostInput(containerName));
        if (!identity) {
          const trimmedContainer = containerName.trim();
          if (!(trimmedContainer in missingContainers)) {
            missingContainers[trimmedContainer] = {
              hosts: [host],
              container: {
                name: trimmedContainer,
                color: containerColor.trim(),
                icon: containerIcon.trim(),
              },
            };
          } else {
            missingContainers[trimmedContainer].hosts.push(host);
          }
        } else {
          this.addIdentity(identity, host, maps);
        }
      }
    }));

    await this.createMissingContainers(Object.values(missingContainers), maps);

    await Storage.clear();
    await Storage.setAll(maps);

    hideLoader();
    showToast('Saved!');
    setTimeout(() => hideToast(), 3000);
  }

  showEditor() {
    csvEditor.classList.remove('hide');
  }

  hideEditor() {
    csvEditor.classList.add('hide');
  }

}

export default new CSVEditor({
  urlMaps: State.get('urlMaps'),
  identities: State.get('identities'),
});
