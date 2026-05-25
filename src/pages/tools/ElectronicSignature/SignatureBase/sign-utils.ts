export const getDOMRect = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
};

export const checkIntersection = (
  element1: HTMLElement,
  element2: HTMLElement,
) => {
  const rect1 = getDOMRect(element1);
  const rect2 = getDOMRect(element2);

  // 判断两个矩形是否相交
  const isIntersecting = !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );

  // 判断元素1是否包含元素2
  const isElement1ContainsElement2 =
    rect1.left <= rect2.left &&
    rect1.right >= rect2.right &&
    rect1.top <= rect2.top &&
    rect1.bottom >= rect2.bottom;

  // 判断元素2是否包含元素1
  const isElement2ContainsElement1 =
    rect2.left <= rect1.left &&
    rect2.right >= rect1.right &&
    rect2.top <= rect1.top &&
    rect2.bottom >= rect1.bottom;

  return {
    isIntersecting,
    isElement1ContainsElement2,
    isElement2ContainsElement1,
  };
};

export const calcFontSize = (width: number, height: number) => {
  // 根据需要调整比例
  const baseRatio = 3;
  const delta = Math.min(width / baseRatio, height / baseRatio);
  return delta + 12;
};

export const getMainPageByPageNo = (pageNo: number) => {
  const page = document.querySelector(
    `.js-main-pages .js-page-render .js-react-pdf-page[data-page-number="${pageNo}"]`,
  );

  return page;
};

export const getAllMainPages = () => {
  const pages = document.querySelectorAll(
    '.js-main-pages .js-page-render .js-react-pdf-page',
  );
  return pages;
};

export const findParentByClassName = (
  target: HTMLElement,
  className: string,
): HTMLElement | null => {
  if (target?.classList?.contains(className)) {
    return target;
  }

  if (target.parentElement) {
    return findParentByClassName(target.parentElement, className);
  }

  return null;
};

export const isPointInsideElement = (
  pointX: number,
  pointY: number,
  elementLeft: number,
  elementRight: number,
  elementTop: number,
  elementBottom: number,
) => {
  return (
    pointX >= elementLeft &&
    pointX <= elementRight &&
    pointY >= elementTop &&
    pointY <= elementBottom
  );
};

export const determineElementPosition = (
  element: HTMLElement,
  target: HTMLElement,
) => {
  const {
    left: elementLeft,
    right: elementRight,
    top: elementTop,
    bottom: elementBottom,
    width: elementWidth,
    height: elementHeight,
  } = getDOMRect(element);
  const {
    left: targetLeft,
    right: targetRight,
    top: targetTop,
    bottom: targetBottom,
  } = getDOMRect(target);

  const elementArea = elementWidth * elementHeight;
  const intersectionArea =
    Math.max(
      0,
      Math.min(elementRight, targetRight) - Math.max(elementLeft, targetLeft),
    ) *
    Math.max(
      0,
      Math.min(elementBottom, targetBottom) - Math.max(elementTop, targetTop),
    );

  const threshold = 0.3; // 阈值，表示一半以上的区域
  const isInsideHalf = intersectionArea >= threshold * elementArea;
  const isInsideAll = intersectionArea >= elementArea;

  let closestDirection = '';
  // 判断是否在四个角落
  if (isInsideHalf && !isInsideAll) {
    const yInside = elementTop > targetTop && elementBottom < targetBottom;
    const xInside = elementLeft > targetLeft && elementRight < targetRight;

    if (yInside) {
      if (elementLeft > targetLeft && elementRight > targetRight) {
        closestDirection = 'right';
      } else if (elementLeft < targetLeft && elementRight < targetRight) {
        closestDirection = 'left';
      }
    }

    if (xInside) {
      if (elementTop > targetTop && elementBottom > targetBottom) {
        closestDirection = 'bottom';
      } else if (elementTop < targetTop && elementBottom < targetBottom) {
        closestDirection = 'top';
      }
    }

    if (
      isPointInsideElement(
        targetLeft,
        targetTop,
        elementLeft,
        elementRight,
        elementTop,
        elementBottom,
      )
    ) {
      closestDirection = 'topLeft';
    } else if (
      isPointInsideElement(
        targetRight,
        targetTop,
        elementLeft,
        elementRight,
        elementTop,
        elementBottom,
      )
    ) {
      closestDirection = 'topRight';
    } else if (
      isPointInsideElement(
        targetLeft,
        targetBottom,
        elementLeft,
        elementRight,
        elementTop,
        elementBottom,
      )
    ) {
      closestDirection = 'bottomLeft';
    } else if (
      isPointInsideElement(
        targetRight,
        targetBottom,
        elementLeft,
        elementRight,
        elementTop,
        elementBottom,
      )
    ) {
      closestDirection = 'bottomRight';
    }
  }

  return {
    isInsideHalf,
    isInsideAll,
    closestDirection,
  };
};

export const findContainerAndPosition = (
  element: HTMLElement,
  containerList: NodeListOf<HTMLElement>,
) => {
  for (const container of containerList) {
    const position = determineElementPosition(element, container);
    if (position.isInsideHalf || position.isInsideAll) {
      return { container, position };
    }
  }

  return null;
};

export const selectAllText = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  selection?.removeAllRanges?.();
  selection?.addRange?.(range);
};
