import { useState, useRef, useEffect, MutableRefObject } from "react";

interface TriggerOptions {
  disableHysteresis?: boolean;
  threshold?: number;
  target?: Window;
}

const defaultTrigger = (
  store: MutableRefObject<any>,
  options: TriggerOptions
): boolean => {
  const { disableHysteresis = false, threshold = 100, target } = options;
  const previous = store.current;

  if (target) {
    store.current =
      target.pageYOffset !== undefined ? target.pageYOffset : target.scrollY;
  }

  if (!disableHysteresis && previous !== undefined) {
    if (store.current < previous) {
      return false;
    }
  }

  return store.current > threshold;
};

const defaultTarget = typeof window !== "undefined" ? window : null;

export interface UseScrollTriggerOptions extends TriggerOptions {
  getTrigger?: typeof defaultTrigger;
}

const useScrollTrigger = (options: UseScrollTriggerOptions = {}): boolean => {
  const {
    getTrigger = defaultTrigger,
    target = defaultTarget,
    ...other
  } = options;
  const store = useRef();
  const [trigger, setTrigger] = useState(() => getTrigger(store, other));

  useEffect(() => {
    const handleScroll = () => {
      setTrigger(getTrigger(store, { target, ...other }));
    };

    handleScroll();
    target.addEventListener("scroll", handleScroll);
    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [target, getTrigger, JSON.stringify(other)]);

  return trigger;
};

export default useScrollTrigger;
