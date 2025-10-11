let timeoutId;

const debounce = (callback, delay) => {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(callback, delay);
};

export default debounce;
