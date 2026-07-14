import classActions from "./class";
import clipboardActions from "./clipboard";
import confirmActions from "./confirm";
import attributeActions, { dataAttributeActions } from "./dom_attributes";
import dialogActions from "./dialog";
import focusActions from "./focus";
import formActions from "./form";
import reloadActions from "./reload";
import scrollToActions from "./scroll_to";
import styleActions from "./style";

export const actions = {
  attribute: attributeActions,
  class: classActions,
  clipboard: clipboardActions,
  confirm: confirmActions,
  dataAttribute: dataAttributeActions,
  dialog: dialogActions,
  focus: focusActions,
  form: formActions,
  reload: reloadActions,
  scrollTo: scrollToActions,
  style: styleActions
};

export const availableActions = (groups = []) => {
  if (groups.length === 0) {
    return Object.values(actions).reduce(
      (all, group) => ({ ...all, ...group }),
      {}
    );
  }

  return groups.reduce((selectedActions, group) => {
    const groupActions = actions[group];

    if (!groupActions) {
      console.warn(`Action "${group}" not found`);

      return selectedActions;
    }

    return { ...selectedActions, ...groupActions };
  }, {});
};

export default availableActions([]);
