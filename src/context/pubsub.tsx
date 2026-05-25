import { ReactNode, createContext, useEffect, useRef } from 'react';

type Events = {
  [key: string]: Array<(data?: any) => void>;
};

type noop = (...args: any) => void;

interface IPubSubContext {
  publish: (event: string, data?: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
}

const PubSubContext = createContext<IPubSubContext>({
  publish: () => {},
  subscribe: () => {},
});

const PubSubProvider = ({ children }: { children: ReactNode | undefined }) => {
  const listenersRef = useRef<Events>({});

  const unsubscribe = (event: string, callback: noop) => {
    const callbacks = listenersRef.current?.[event] ?? [];
    const newCallbacks = callbacks?.filter((fn) => fn !== callback);

    listenersRef.current?.[event]?.filter((fn) => fn !== callback);
    listenersRef.current = { ...listenersRef.current, [event]: newCallbacks };
  };

  const subscribe = (event: string, callback: noop) => {
    const callbacks = listenersRef.current?.[event] ?? [];
    const newCallbacks = [...callbacks, callback];

    listenersRef.current = { ...listenersRef.current, [event]: newCallbacks };
    return () => unsubscribe(event, callback);
  };

  const publish = (event: string, data?: any) => {
    const callbacks = listenersRef.current?.[event] ?? [];
    callbacks.forEach((callback) => callback(data ?? {}));
  };

  useEffect(() => {
    return () => {
      listenersRef.current = {};
    };
  }, []);

  return (
    <PubSubContext.Provider value={{ subscribe, publish }}>
      {children}
    </PubSubContext.Provider>
  );
};

export { IPubSubContext, PubSubProvider };
export default PubSubContext;
