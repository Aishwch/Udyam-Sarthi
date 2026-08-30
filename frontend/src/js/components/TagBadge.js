/* UDYAM SARTHI Data Provenance Tag Component */
import { getIcon } from './IconLibrary.js';

export const renderTagBadge = (type = 'Synthetic', customLabel = null) => {
  let cssClass = 'tag-synthetic';
  let label = customLabel || type;
  let iconName = 'cpu';

  switch (type.toLowerCase()) {
    case 'synthetic':
      cssClass = 'tag-synthetic';
      iconName = 'cpu';
      label = label || 'Synthetic';
      break;
    case 'user':
    case 'user-entered':
      cssClass = 'tag-user';
      iconName = 'user';
      label = label || 'User-entered';
      break;
    case 'estimated':
      cssClass = 'tag-estimated';
      iconName = 'sparkles';
      label = label || 'Estimated';
      break;
    case 'model':
    case 'model-based':
      cssClass = 'tag-model';
      iconName = 'bot';
      label = label || 'Model-based';
      break;
  }

  return `
    <span class="tag-badge ${cssClass}" title="Data Provenance: ${label}">
      ${getIcon(iconName, 12)}
      <span>${label}</span>
    </span>
  `;
};
