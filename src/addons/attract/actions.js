import { Template } from "./template.js";

function positionAction(position) {
  return (element, { value, target, targets, dataset }) => {
    const templateId = value || dataset?.template || dataset?.attractTemplate;
    if (!templateId) return;

    new Template(templateId).render({
      target: target || dataset?.attractTarget,
      targets,
      position
    });
  };
}

const append = positionAction("append");
const prepend = positionAction("prepend");
const replace = positionAction("replace");
const before = positionAction("before");
const after = positionAction("after");

function remove(element, { target, targets }) {
  if (target || targets) {
    new Template(null).render({
      target,
      targets,
      position: "remove",
      with: {}
    });

    return;
  }

  element?.remove();
}

const actions = { append, prepend, replace, before, after, remove };

export { append, prepend, replace, before, after, remove };
export default actions;
export const attractActions = { name: "attract", actions };
