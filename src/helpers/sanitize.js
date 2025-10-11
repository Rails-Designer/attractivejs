export const sanitize = (value) => {
  return value?.split(",").map(className => className.trim()).filter(Boolean) ?? [];
};
