export const listenerSession = (
  {
    context = document.body,
    eventListener = "mousemove|keydown|mousedown|touchstart|scroll",
    duration = Duration(),
    onLocked = () => {},
    onCounter = (counter = Duration().maxMilesecond) => {},
    onReset = () => {},
  } = {
    context: document.body,
    eventListener: "mousemove|keydown|mousedown|touchstart|scroll",
    duration: Duration(),
    onLocked: () => {},
    onCounter: (counter = Duration().maxMilesecond) => {},
    onReset: () => {},
  }
) => {
  const timeLoked = duration.maxMilesecond;

  let isLoked = false;

  const processLoked = () => {
    isLoked = true;
    onLocked();
  };

  let counter = timeLoked / 1000;
  const processCounter = () => {
    if (counter > 0) {
      counter--;
      if (typeof onCounter === "function") onCounter(counter);
    }
  };

  let timer = setTimeout(processLoked, timeLoked);
  let timerInterval = setInterval(processCounter, 1000);

  const eventTypes = eventListener
    .split("|")
    .map((e) => e.trim())
    .filter(Boolean);

  const resetHandler = () => {
    onReset();
    if (timer) clearTimeout(timer);
    if (!isLoked) timer = setTimeout(processLoked, timeLoked);

    if (timerInterval) clearInterval(timerInterval);
    counter = timeLoked / 1000;
    if (!isLoked) timerInterval = setInterval(processCounter, 1000);
  };

  eventTypes.forEach((type) => {
    context.addEventListener(type, resetHandler);
  });
};

export const Duration = (
  { hour = 0, minute = 0, second = 0, milisecond = 0 } = {
    hour: 0,
    minute: 0,
    second: 0,
    milisecond: 0,
  }
) => {
  const maxMilesecond =
    hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000 + milisecond;
  return {
    hour,
    minute,
    second,
    milisecond,
    maxMilesecond,
  };
};
