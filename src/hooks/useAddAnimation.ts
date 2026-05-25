import { MutableRefObject } from 'react';

type CalcTop = (
  start_top: number,
  start_left: number,
  end_top: number,
  end_left: number,
) => number;

class Anim {
  private count!: number;
  private start!: DOMRect;
  private end!: DOMRect;
  private steps!: number;
  private curvature!: number;
  private vertex_left!: number;
  private vertex_top!: number;
  private flyer!: HTMLElement;
  private maskNode!: HTMLElement;
  private srcEl!: HTMLElement;
  private targetEl!: HTMLElement;
  private defaultStyle!: any;
  private downIconDefaultStyle!: any;
  private maskDefaultStyle!: any;
  private playPromise!: Promise<any>;
  private resolve: any;

  // parameter property
  constructor(
    private srcRef: MutableRefObject<HTMLImageElement>,
    private targetRef: MutableRefObject<HTMLElement>,
    private adjustStyles: any,
  ) {
    this.srcRef = srcRef;
    this.targetRef = targetRef;
    this.adjustStyles = adjustStyles;
    this.playPromise = new Promise((resolve) => {
      this.resolve = resolve;
    });
    this.init();
  }

  private init() {
    this.start = null as any;
    this.end = null as any;
    this.steps = 0;
    this.curvature = 0;
    this.vertex_left = 0;
    this.srcEl = null as any;
    this.targetEl = null as any;
    this.flyer = null as any;
    this.maskNode = null as any;
    this.vertex_top = 0;
    this.count = -1;
    this.defaultStyle = {
      'margin-top': '0px',
      'margin-left': '0px',
      position: 'fixed',
      'z-index': 10000,
    };
    this.downIconDefaultStyle = {
      // position: 'fixed',
      // width: '20px',
      // height: '40px',
      // background: '#fff',
      'z-index': '10000',
      visibility: 'visible',
      // top: '10px',
      // right: '190px',
    };
    this.maskDefaultStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      background: 'rgba(0,0,0,0.5)',
      'z-index': 999,
    };
  }

  play(calcTop?: CalcTop, imgEle?: HTMLImageElement, type?: boolean) {
    this.prepare(calcTop, imgEle, type);
    this.move(type);
    return this.playPromise;
  }

  private createImgCanvas(imgEle?: HTMLImageElement) {
    const image = imgEle || (this.srcEl as any);
    const imgCanvas = document.createElement('canvas');
    const imgContext = imgCanvas.getContext('2d');
    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    imgContext?.drawImage(image, 0, 0, image.width, image.height);
    imgCanvas.style.borderRadius = '100%';
    return imgCanvas;
  }

  private prepare(
    calcTop?: CalcTop,
    imgEle?: HTMLImageElement,
    type?: boolean,
  ) {
    this.srcEl = this.srcRef.current!;
    this.targetEl = this.targetRef.current!;
    this.start = this.srcEl.getBoundingClientRect();
    this.end = this.targetEl.getBoundingClientRect();
    this.flyer = document.createElement('div');
    const el = this.createImgCanvas(imgEle);
    this.applyStyles(el, this.adjustStyles);
    this.flyer.appendChild(el);
    this.applyStyles(this.flyer, {
      ...this.defaultStyle,
      left: 0,
      top: 0,
    });

    if (!type) {
      this.maskNode = document.createElement('div');
      this.applyStyles(this.maskNode, this.maskDefaultStyle);
      document.body.appendChild(this.maskNode);
    }
    document.body.appendChild(this.flyer);

    this.vertex_top = calcTop
      ? calcTop(this.start.top, this.start.left, this.end.top, this.end.left)
      : Math.min(this.start.top, this.end.top) -
        Math.abs(this.start.left - this.end.left) / 3;

    const distance = Math.sqrt(
      Math.pow(this.start.top - this.end.top, 2) +
        Math.pow(this.start.left - this.end.left, 2),
    );

    // 元素移动次数
    this.steps = Math.ceil(
      Math.min(Math.max(Math.log(distance) / 0.05 - 75, 30), 100) / 1,
    );

    const ratio =
      this.start.top === this.vertex_top
        ? 0
        : -Math.sqrt(
            (this.end.top - this.vertex_top) /
              (this.start.top - this.vertex_top),
          );

    this.vertex_left = (ratio * this.start.left - this.end.left) / (ratio - 1);
    // 特殊情况，出现顶点left===终点left，将曲率设置为0，做直线运动。
    this.curvature =
      this.end.left === this.vertex_left
        ? 0
        : (this.end.top - this.vertex_top) /
          Math.pow(this.end.left - this.vertex_left, 2);
  }

  private move(type?: boolean) {
    const {
      start,
      end,
      count,
      steps,
      curvature,
      vertex_left,
      vertex_top,
      flyer,
      maskNode,
      targetEl,
    } = this;

    const left = start.left + ((end.left - start.left) * count) / steps;
    const top =
      curvature === 0
        ? start.top + ((end.top - start.top) * count) / steps
        : curvature * Math.pow(left - vertex_left, 2) + vertex_top;

    this.applyStyles(flyer, {
      transform: `translate(${left}px, ${top + 50}px)scale(${1})`,
      // opacity: `${1 - count / steps + 0.3}`,
    });

    this.count++;

    const time = window.requestAnimationFrame(() => this.move(type));
    if (count === steps) {
      window.cancelAnimationFrame(time);
      // logo消失
      setTimeout(() => {
        flyer.parentNode!.removeChild(flyer);
      }, 200);
      // tooltip出现
      setTimeout(() => {
        if (!type) {
          this.applyStyles(targetEl, this.downIconDefaultStyle);
          document.body.appendChild(targetEl);
        }
      }, 300);
      // 整体消失
      setTimeout(() => {
        if (!type) {
          this.applyStyles(targetEl, { 'z-index': '-10000' });
          maskNode.parentNode!.removeChild(maskNode);
        }
      }, 2000);

      // 动画结束
      this.resolve();
    }
  }

  private applyStyles(el: HTMLElement, styles: Record<string, string>) {
    for (const prop in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, prop)) {
        el.style.setProperty(prop, styles[prop]);
      }
    }
  }
}

export function useAddAnimation(
  srcRef: MutableRefObject<HTMLImageElement>,
  targetRef: MutableRefObject<HTMLElement>,

  adjustStyles = {},
) {
  return (calcTop?: CalcTop, type = true, imgEle?: HTMLImageElement) => {
    try {
      const logoEle = document.querySelector('.ant-pro-global-header-logo');
      const imgElements =
        imgEle || (logoEle?.querySelector('img') as HTMLImageElement);

      const calcTopHandle = calcTop;
      const instance = new Anim(srcRef, targetRef, adjustStyles);

      return instance.play(calcTopHandle, imgElements, type);
    } catch (error) {
      console.log(error);
    }
  };
}
