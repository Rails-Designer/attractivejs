export default function activeEditableElement() {
  return editableElement(document.activeElement);
}

export function editableElement(element) {
  if (!element || !element.tagName) return false;

  const tag = element.tagName.toLowerCase();

  if (tag === "textarea" || tag === "select") return true;

  if (tag === "input") {
    const type = element.type?.toLowerCase();

    return !(
      type === "button" ||
      type === "checkbox" ||
      type === "file" ||
      type === "hidden" ||
      type === "image" ||
      type === "radio" ||
      type === "reset" ||
      type === "submit"
    );
  }

  return element.isContentEditable;
}
