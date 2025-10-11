import attributeActions from "./attribute";
import classActions from "./class";
import clipboardActions from "./clipboard";
import dataAttributeActions from "./data_attribute";
import dialogActions from "./dialog";
import formActions from "./form";

export const actions = {
  attribute: attributeActions,
  class: classActions,
  clipboard: clipboardActions,
  dataAttribute: dataAttributeActions,
  dialog: dialogActions,
  form: formActions
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
