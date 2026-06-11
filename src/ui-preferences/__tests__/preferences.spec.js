import preferencesJson from '../preferences.json';

describe('preferences', () => {

  it('labels the Firefox toolbar color as black without changing the API value', () => {
    const defaultContainer = preferencesJson.find(
        preference => preference.name === 'defaultContainer'
    );
    const containerColor = defaultContainer.preferences.find(
        preference => preference.name === 'containerColor'
    );
    const toolbarChoice = containerColor.choices.find(choice => choice.name === 'toolbar');

    expect(toolbarChoice).toEqual({
      name: 'toolbar',
      label: 'Black',
    });
  });

});
