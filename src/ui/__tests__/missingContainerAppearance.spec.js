import {
  MISSING_CONTAINER_COLOR_PREFERENCE,
  MISSING_CONTAINER_ICON_PREFERENCE,
  resolveMissingContainerAppearance,
} from '../missingContainerAppearance';

describe('resolveMissingContainerAppearance', () => {
  const preferences = {
    [MISSING_CONTAINER_COLOR_PREFERENCE]: 'red',
    [MISSING_CONTAINER_ICON_PREFERENCE]: 'briefcase',
  };

  it('uses CSV values when both appearance fields are present', () => {
    expect(resolveMissingContainerAppearance(preferences, ' blue ', ' circle ')).toEqual({
      color: 'blue',
      icon: 'circle',
    });
  });

  it('uses configured defaults for omitted appearance fields', () => {
    expect(resolveMissingContainerAppearance(preferences, '', ' ')).toEqual({
      color: 'red',
      icon: 'briefcase',
    });
  });

  it('preserves random fallback when preferences have not been saved', () => {
    expect(resolveMissingContainerAppearance({}, '', '')).toEqual({
      color: 'RANDOM',
      icon: 'RANDOM',
    });
  });
});
