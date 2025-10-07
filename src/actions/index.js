import classActions from "./class";
import attributeActions from "./attribute";
import dataAttributeActions from "./data_attribute";
import dialogActions from "./dialog";

export const actions = {
  class: classActions,
  attribute: attributeActions,
  dataAttribute: dataAttributeActions,
  dialog: dialogActions
};

export const availableActions = (groups = []) => {
  if (groups.length === 0) {
    return Object.values(actions).reduce((all, group) => ({...all, ...group}), {});
  }

  return actions.reduce((selectedActions, group) => {
    if (!groups[group]) {
      console.warn(`Action “${group}” not found`);

      return selectedActions;
    }

    return {...selectedActions, ...groups[group]};
  }, {});
};

export default availableActions([]);
