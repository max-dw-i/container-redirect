import Preference from './Preference';

export default class DropdownPreference extends Preference {

  constructor({name, label, description, choices, defaultValue}) {
    super({name, label, description, defaultValue});
    this.choices = choices;
    // Make sure we have default choice
    if(this._defaultValue === undefined && this.choices.length > 0){
      this._defaultValue = this.choices[0].name;
    }
    this._addChoices();
  }

  _buildEl() {
    return document.createElement('select');
  }

  _addChoices() {
    for (let choice of this.choices) {
      const option = document.createElement('option');
      option.value = choice.name;
      option.text = choice.label;
      if (this._defaultValue === choice.name) option.selected = true;
      this.el.appendChild(option);
    }

  }

  get() {
    const selectedItemIndex = this.el.selectedIndex;
    const selectedItem = this.el.options.item(selectedItemIndex);
    return selectedItem.value;
  }

  set({value}) {
    for (const item of this.el.options) {
      if (item.value === value) {
        this.el.selectedIndex = item.index;
        break;
      }
    }
    super.set({value});
  }
}

DropdownPreference.TYPE = 'dropdown';
