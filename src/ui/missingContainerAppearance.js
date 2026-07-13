export const MISSING_CONTAINER_COLOR_PREFERENCE = 'csvEditor.missingContainerColor';
export const MISSING_CONTAINER_ICON_PREFERENCE = 'csvEditor.missingContainerIcon';

const RANDOM_CONTAINER_VALUE = 'RANDOM';

export function resolveMissingContainerAppearance(preferences, color, icon) {
  return {
    color: color.trim()
      || preferences[MISSING_CONTAINER_COLOR_PREFERENCE]
      || RANDOM_CONTAINER_VALUE,
    icon: icon.trim()
      || preferences[MISSING_CONTAINER_ICON_PREFERENCE]
      || RANDOM_CONTAINER_VALUE,
  };
}
