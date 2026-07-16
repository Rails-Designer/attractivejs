const debounce = () => {
  let timeoutId;

  return (callback, delay) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(callback, delay);
  };
};

export default debounce;
