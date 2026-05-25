import { useMount } from 'ahooks';
import { useEffect, useRef } from 'react';

const CONTENT_CLASSNAME = '.ant-layout-content';

interface IStyles {
  backgroundColor: string;
}

export const useLayoutStyles = () => {
  const layoutContentRef = useRef<HTMLElement>();

  const setStyles = (options: IStyles) => {
    const { backgroundColor } = options;
    if (layoutContentRef.current) {
      layoutContentRef.current.style.backgroundColor = backgroundColor;
    }
  };

  const addClassName = (className: string) => {
    if (layoutContentRef.current) {
      layoutContentRef.current.classList.add(className);
    }
  };

  const removeClassName = (className: string) => {
    if (layoutContentRef.current) {
      layoutContentRef.current.classList.remove(className);
    }
  };

  useMount(() => {
    const layoutContent =
      document.querySelector<HTMLElement>(CONTENT_CLASSNAME);

    if (layoutContent) {
      layoutContentRef.current = layoutContent;
    }
  });

  useEffect(() => {}, []);

  return {
    setStyles,
    addClassName,
    removeClassName,
  };
};
