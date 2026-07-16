const delay = () => {
  let timeoutId;

  return (callback, delay) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(callback, delay);
  };
};

export default delay;
