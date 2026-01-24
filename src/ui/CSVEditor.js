import ContextualIdentities, {RANDOM_VAL_CONST as RANDOM_CONTAINER_VAL} from '../ContextualIdentity';
import State from '../State';
import Storage from '../Storage/HostStorage';
import {cleanHostInput, MAX_EXTENSION_POPUP_WIDTH, qs, sortMaps} from '../utils';
import {hideLoader, showLoader} from './loader';
import {hideToast, showToast} from './toast';

const HOST_MAPS_SPLIT_KEY = ',';
const body = document.body;
const csvEditor = qs('.csv-editor');
const openButton = qs('.ce-open-button');
const closeButton = qs('.ce-close-button');
const saveButton = qs('.ce-save-button');
const hostTextarea = qs('.ce-hosts-textarea');

function csvEditorStylePos() {
  const csvEditorStyle = csvEditor.currentStyle || window.getComputedStyle(csvEditor);
  return {
    left: parseInt(csvEditorStyle.left),
    right: parseInt(csvEditorStyle.right),
  };
}

function calcHostTextareaWidth(bodyWidth) {
  const pos = csvEditorStylePos();
  return bodyWidth - pos.left - pos.right;
}

function calcBodyWidth(hostTextareaWidth) {
  const pos = csvEditorStylePos();
  return hostTextareaWidth + pos.left + pos.right;
}

class CSVEditor {

  constructor(state) {
    this.state = state;
    State.addListener(this.update.bind(this));
    openButton.addEventListener('click', this.showEditor.bind(this));
    closeButton.addEventListener('click', this.hideEditor.bind(this));
    saveButton.addEventListener('click', this.saveUrlMaps.bind(this));
    hostTextarea.addEventListener('mouseup', this.resizeTextarea.bind(this));
    this.render();

    const bodyStyle = window.getComputedStyle(csvEditor);
    this.bodyInitWidth = parseInt(bodyStyle.width);
  }

  resizeTextarea() {
    const hostTextareaWidth = hostTextarea.offsetWidth;

    const requiredWidth = calcBodyWidth(hostTextareaWidth);
    if (requiredWidth > MAX_EXTENSION_POPUP_WIDTH) {
      hostTextarea.style.width = `${calcHostTextareaWidth(MAX_EXTENSION_POPUP_WIDTH)}px`;
      body.style.width = `${MAX_EXTENSION_POPUP_WIDTH}px`;
    } else {
      body.style.width = `${requiredWidth}px`;
    }
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

    const hostLines = sortMaps(Object.values(this.state.urlMaps)).map(urlMap => {
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

  addIdentity(identity, host, priority, maps) {
    maps[host] = {
      host,
      priority,
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
      for (const {host, priority} of hosts) {
        this.addIdentity(identity, host, priority, maps);
      }
    }
  }

  async saveUrlMaps() {
    showLoader();
    const items = hostTextarea.value.trim().split('\n').filter(s => s.charAt(0) !== '#');
    const maps = {};
    const missingContainers = {};

    await Promise.all(items.map((item, priority) => {
      const hostMapParts = item.split(HOST_MAPS_SPLIT_KEY);
      for (let i = hostMapParts.length; i < 4; i++) hostMapParts.push('');
      const host = cleanHostInput(hostMapParts.slice(0, -3).join(HOST_MAPS_SPLIT_KEY));
      const containerName = hostMapParts[hostMapParts.length - 3];
      const containerColor = hostMapParts[hostMapParts.length - 2];
      const containerIcon = hostMapParts[hostMapParts.length - 1];
      let identity;

      if (!containerName) {
        console.warn(`Cannot extract 'container name' from line '${item}'`);
        return;
      }

      if (!host) {
        console.warn(`Cannot extract 'host' from line '${item}'`);
        return;
      }

      identity = this.state.identities.find((identity) => cleanHostInput(identity.name) === cleanHostInput(containerName));
      if (identity) {
        this.addIdentity(identity, host, priority, maps);
      } else {
        const hostObj = { host, priority };
        const trimmedContainer = containerName.trim();
        if (trimmedContainer in missingContainers) {
          missingContainers[trimmedContainer].hosts.push(hostObj);
        } else {
          missingContainers[trimmedContainer] = {
            hosts: [hostObj],
            container: {
              name: trimmedContainer,
              color: containerColor.trim() || RANDOM_CONTAINER_VAL,
              icon: containerIcon.trim() || RANDOM_CONTAINER_VAL,
            },
          };
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
    body.style.width = `${this.bodyInitWidth}px`;
    hostTextarea.style.width = `${calcHostTextareaWidth(this.bodyInitWidth)}px`;

    csvEditor.classList.add('hide');
  }

}

export default new CSVEditor({
  urlMaps: State.get('urlMaps'),
  identities: State.get('identities'),
});
