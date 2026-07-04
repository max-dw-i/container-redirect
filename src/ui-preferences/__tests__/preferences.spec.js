const preferences = require('../preferences.json');

describe('preferences config', () => {
  it('labels Firefox toolbar color as black while preserving the API value', () => {
    const defaultContainer = preferences.find(({name}) => name === 'defaultContainer');
    const colorPreference = defaultContainer.preferences.find(({name}) => name === 'containerColor');
    const toolbarChoice = colorPreference.choices.find(({name}) => name === 'toolbar');

    expect(toolbarChoice).toEqual({
      name: 'toolbar',
      label: 'Black',
    });
  });
});
