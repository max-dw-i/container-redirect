const preferences = require('../preferences.json');

describe('preferences config', () => {
  it('defines random defaults for containers created from incomplete CSV rules', () => {
    const csvEditor = preferences.find(({name}) => name === 'csvEditor');
    const color = csvEditor.preferences.find(({name}) => name === 'missingContainerColor');
    const icon = csvEditor.preferences.find(({name}) => name === 'missingContainerIcon');

    expect(color.defaultValue).toBe('RANDOM');
    expect(icon.defaultValue).toBe('RANDOM');
    expect(color.choices).toContainEqual({name: 'red', label: 'Red'});
    expect(icon.choices).toContainEqual({name: 'briefcase', label: 'Briefcase'});
  });
});
