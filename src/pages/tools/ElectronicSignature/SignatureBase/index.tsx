import {
  DeleteOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { useFullscreen, useSetState, useSize } from 'ahooks';
import { Avatar, Button, Col, ConfigProvider, Popover, Row } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { DraggableEvent } from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { DraggableData, Position, Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import FieldBase from './components/FieldBase';
import FieldOptionView from './components/FieldOptionView';
import ThumbFieldView from './components/ThumbFieldView';

import {
  ICC,
  IFE_NEED_SIGNER,
  IField,
  ISignField,
  ISigner,
} from '@/api/types/tool';
import {
  SignTypeEnum,
  SignatureModeEnum,
  defaultMainPageWidth,
  defaultScale,
  defaultThumbPageWidth,
  defaultWidthHeightRatio,
  maxScale,
  minScale,
  pageCommonProps,
  scaleStep,
} from '@/constants';
import { isUndefinedOrNull } from '@/utils/utils';
import { ProSkeleton } from '@ant-design/pro-components';
import html2canvas from 'html2canvas';
import SignerProcess from '../components/SignerProcess';
import { defaultToolFieldList, resizeHandleClasses } from './constants';
import styles from './index.less';
import {
  IFieldState,
  IScrollDirection,
  IToolField,
  IZoomType,
} from './interface';
import {
  calcFontSize,
  findContainerAndPosition,
  findParentByClassName,
  getAllMainPages,
  getDOMRect,
  getMainPageByPageNo,
} from './sign-utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

let mainPageObserver: IntersectionObserver;

interface IProps {
  mode: SignatureModeEnum;
  pdfName: string;
  pdfStr: string;
  signers: ISigner[];
  ccList?: ICC[];
  signFields?: ISignField[];
  offset?: number;
  ref: any;
  header?: React.ReactNode;
  signingName?: string;
}

const initialToolFieldState: IFieldState = {
  style: {
    opacity: 0,
    cursor: 'move',
  },
};

const SignatureBase: FC<IProps> = forwardRef((props, ref) => {
  const {
    mode = SignatureModeEnum.INIT,
    pdfName = '',
    pdfStr,
    signers = [],
    ccList = [],
    signFields = [],
    offset = 320,
    header,
    signingName,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, { exitFullscreen, toggleFullscreen }] =
    useFullscreen(containerRef);
  const [deltaY, setDeltaY] = useState<number>(0);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState<number>(defaultScale);

  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0);
  const [thumbLastPageRenderSuccess, setThumbLastPageRenderSuccess] =
    useState<boolean>(false);

  const [signerList, setSignerList] = useState<IFE_NEED_SIGNER[]>([]);
  const [signFieldList, setSignFieldList] = useState<ISignField[]>([]);
  const [activeSigner, setActiveSigner] = useState<ISigner | null>(null);

  const [activeMainField, setActiveMainField] = useState<IField | null>(null);
  const [mainFieldDragging, setMainFieldDragging] = useState<boolean>(false);
  const [mainLastPageRenderSuccess, setMainLastPageRenderSuccess] =
    useState<boolean>(false);
  const [mainContentRenderSuccess, setMainContentRenderSuccess] =
    useState<boolean>(false);
  const [incompleteList, setIncompleteList] = useState<ISignField[]>([]);

  const [toolFieldList, setToolFieldList] =
    useState<IToolField[]>(defaultToolFieldList);
  const [toolFieldState, setToolFieldState] = useSetState<IFieldState>(
    initialToolFieldState,
  );
  const [activeToolField, setActiveToolField] = useState<IToolField | null>(
    null,
  );

  const mainContentRef = useRef<HTMLDivElement>(null);
  const prevScaleRef = useRef<number>(defaultScale);
  const mainContentPrevScrollTopRef = useRef<number>(0);
  const mainContentScrollDirectionRef = useRef<IScrollDirection>();

  const mainContentSize = useSize(mainContentRef);

  const loadPdf = async (pdfStrVal: string) => {
    setPdfLoading(true);
    try {
      const loadingTask = pdfjs.getDocument(pdfStrVal);
      const pdf = await loadingTask.promise;
      setPdfLoading(false);
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF', error);
    }
  };

  const handleThumbnailClick = (pageIndex: number) => {
    setSelectedThumbIndex(pageIndex);
    const page = getMainPageByPageNo(pageIndex + 1);
    if (page) {
      // page.scrollIntoView({ behavior: 'smooth' });
      const pageTop = getDOMRect(page as HTMLElement).top;
      const scrollTop = document.documentElement.scrollTop;
      const top = pageTop + scrollTop - deltaY;
      mainContentRef.current?.scrollBy?.({ top: top });
    }
  };

  const selectedThumbAndScrollIntoView = (pageIndex: number) => {
    setSelectedThumbIndex(pageIndex);

    const thumbContainer = document.querySelector('.thumbnails');
    const thumb = document.querySelector(
      `.thumb-item[data-pageindex="${pageIndex}"]`,
    );

    if (thumbContainer && thumb) {
      // 使用 scrollIntoView 会导致页面滚动，所以使用 scrollBy
      const rect = thumb.getBoundingClientRect();
      const { top, bottom, height } = rect;
      const windowHeight = window.innerHeight;
      // 如果缩略图完整的出现在可视区域内，则不滚动。
      if (top >= 0 && bottom <= windowHeight) {
        return;
      }
      // 判断滚动方向
      if (mainContentScrollDirectionRef.current === 'up') {
        // 25px 是gap
        const scrollTop = pageIndex * (height + 25);
        console.log({ scrollTop });
        // const srollTop = top - 120;

        thumbContainer.scrollTo({ top: scrollTop });
        // thumb.scrollIntoView({ block: 'start' });
      } else if (mainContentScrollDirectionRef.current === 'down') {
        thumb.scrollIntoView({ block: 'end' });
      } else {
        // do nothing
      }
    }
  };

  const onMainContentScroll = (e: any) => {
    const scrollY = e.target.scrollTop;
    if (scrollY > mainContentPrevScrollTopRef.current) {
      // console.log('Scrolling down');
      mainContentScrollDirectionRef.current = 'down';
    } else if (scrollY < mainContentPrevScrollTopRef.current) {
      // console.log('Scrolling up');
      mainContentScrollDirectionRef.current = 'up';
    }
    mainContentPrevScrollTopRef.current = scrollY;
  };

  const onMainFieldDragStart = (mainField: IField, e: DraggableEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMainFieldDragging(true);

    const { uuid, pageNo } = mainField;
    const targetField = document.querySelector(
      `.js-main-field-handle[data-id="${uuid}"]`,
    );
    const page = getMainPageByPageNo(pageNo) as HTMLElement;
    if (targetField && page) {
      page.style.outline = '1px solid var(--primary-color)';
      targetField.classList.add('js-assist');
    }
  };

  const onMainFieldDrag = (mainField: IField, e: DraggableEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMainFieldDragging(true);

    const { uuid, pageNo } = mainField;
    const targetField = document.querySelector(
      `.js-main-field-handle[data-id="${uuid}"]`,
    );
    const page = getMainPageByPageNo(pageNo) as HTMLElement;
    if (targetField && page) {
      page.style.outline = '1px solid var(--primary-color)';
      targetField.classList.add('js-assist');
    }
  };

  const onMainFieldDragStop = (
    mainField: IField,
    e: DraggableEvent,
    data: DraggableData,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setMainFieldDragging(false);

    if (lodash.isEmpty(activeSigner)) {
      console.error('Signer not found');
      return;
    }

    const { x, y } = data;
    // 更新 signerList 中的 signFields 的位置
    const updatedSignerList = signerList.map((signer) => {
      const updatedSignFields = signer.signFields.map((field) => {
        if (mainField.uuid === field.uuid) {
          return {
            ...field,
            x: x,
            y: y,
          };
        }
        return field;
      });

      return {
        ...signer,
        signFields: updatedSignFields,
      };
    });
    setSignerList(updatedSignerList);

    const allPages = getAllMainPages();
    const { uuid } = mainField;

    const targetField = document.querySelector(
      `.js-main-field-handle[data-id="${uuid}"]`,
    );
    if (targetField) {
      targetField.classList.remove('js-assist');
    }
    allPages.forEach((page: any) => {
      page.style.outline = '1px solid #cccccc';
    });
  };

  const onMainFieldResize = (mainField: IField, rest: any) => {
    const minWidth = mainField.minWidth ?? 0;
    const minHeight = mainField.minHeight ?? 0;
    const element: HTMLElement = rest[2];
    const position: Position = rest[4];
    const rect = getDOMRect(element);
    const { width, height } = rect;
    const newWidth = width < minWidth ? minWidth : width;
    const newHeight = height < minHeight ? minHeight : height;
    const { x, y } = position;
    const newFontSize = calcFontSize(width, height);

    const updatedSignerList = signerList.map((signer) => {
      const updatedSignFields = signer.signFields.map((field) => {
        if (mainField.uuid === field.uuid) {
          return {
            ...field,
            width: newWidth,
            height: newHeight,
            x: x,
            y: y,
            fontSize: newFontSize,
          };
        }
        return field;
      });

      return {
        ...signer,
        signFields: updatedSignFields,
      };
    });
    setSignerList(updatedSignerList);
  };

  const onToolFieldDragStart = (toolField: IToolField) => {
    // 保存当前的位置，用于拖拽结束后的位置还原
    setActiveToolField(toolField);
    setToolFieldState({
      style: {
        ...toolFieldState.style,
        opacity: 1,
      },
    });
  };

  const onToolFieldDrag = (e: DraggableEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setToolFieldState({
      style: {
        ...toolFieldState.style,
        opacity: 1,
      },
    });

    const allPages = getAllMainPages();
    const element = e.target as HTMLElement;
    let targetField: HTMLElement | null = element.querySelector(
      '.js-tool-field-handle',
    );

    if (!targetField) {
      targetField = findParentByClassName(element, 'js-tool-field-handle');
    }

    if (targetField) {
      const targetPageContainerAndPosition = findContainerAndPosition(
        targetField,
        allPages as NodeListOf<HTMLElement>,
      );

      const { container } = targetPageContainerAndPosition ?? {};
      if (container) {
        container.style.outline = '1px solid var(--primary-color)';
        targetField.classList.add('js-assist');
        document.body.style.overflow = 'hidden';
      } else {
        allPages.forEach((page: any) => {
          page.style.outline = '1px solid #cccccc';
        });
        targetField.classList.remove('js-assist');
        document.body.style.overflow = '';
      }
    }
  };

  const onToolFieldDragStop = (toolField: IToolField, e: DraggableEvent) => {
    setActiveToolField(null);
    if (lodash.isEmpty(activeSigner)) {
      console.error('Signer not found');
      return;
    }
    const allPages = getAllMainPages();
    const element = e.target as HTMLElement;

    const targetField: HTMLElement =
      element.querySelector('.js-tool-field-handle') ?? element;

    const targetPageContainerAndPosition = findContainerAndPosition(
      targetField,
      allPages as NodeListOf<HTMLElement>,
    );
    const { container, position } = targetPageContainerAndPosition ?? {};
    if (container) {
      const pageNo = container.getAttribute('data-page-number');

      const { isInsideHalf, isInsideAll, closestDirection } = position ?? {};
      const targetFieldRect = getDOMRect(targetField);
      const pageRect = getDOMRect(container);

      let x = targetFieldRect.left - pageRect.left;
      let y = targetFieldRect.top - pageRect.top;

      if (isInsideHalf) {
        if (closestDirection === 'top') {
          y = 0;
        }
        if (closestDirection === 'bottom') {
          y = pageRect.height - targetFieldRect.height;
        }
        if (closestDirection === 'left') {
          x = 0;
        }
        if (closestDirection === 'right') {
          x = pageRect.width - targetFieldRect.width;
        }
        if (closestDirection === 'topLeft') {
          x = 0;
          y = 0;
        }
        if (closestDirection === 'topRight') {
          x = pageRect.width - targetFieldRect.width;
          y = 0;
        }
        if (closestDirection === 'bottomLeft') {
          x = 0;
          y = pageRect.height - targetFieldRect.height;
        }
        if (closestDirection === 'bottomRight') {
          x = pageRect.width - targetFieldRect.width;
          y = pageRect.height - targetFieldRect.height;
        }
      }

      if (isInsideAll) {
        x = targetFieldRect.left - pageRect.left;
        y = targetFieldRect.top - pageRect.top;
      }

      // 根据 pageNo 给 signerList 中的 signFields 添加一项
      const newField: IField = {
        ...toolField,
        uuid: uuidv4(),
        mainColor: activeSigner.mainColor,
        email: activeSigner.email,
        pageNo: Number(pageNo),
        x: x,
        y: y,
      };

      const updatedSignerList = signerList.map((signer) => {
        if (signer.email === activeSigner?.email) {
          signer.signFields.push(newField);
        }
        return signer;
      });
      setSignerList(updatedSignerList);
    }

    element.classList.remove('js-assist');
    document.body.style.overflow = '';
    setToolFieldState({
      style: {
        ...toolFieldState.style,
        opacity: 0,
      },
    });
  };

  const updateMainFieldsScaleByInit = (newScale: number) => {
    const prePageWidth = defaultMainPageWidth * prevScaleRef.current;
    const prePageHeight = prePageWidth * defaultWidthHeightRatio;
    const newPageWidth = defaultMainPageWidth * newScale;
    const newPageHeight = newPageWidth * defaultWidthHeightRatio;

    const updatedSignerList = signerList.map((signer) => {
      const updatedSignFields = signer.signFields.map((field) => {
        const ratioX = field.x / prePageWidth;
        const ratioY = field.y / prePageHeight;
        const newX = newPageWidth * ratioX;
        const newY = newPageHeight * ratioY;

        const preWidth = field.width;
        const preHeight = field.height;
        const maxWidth = field.maxWidth ?? Infinity;
        const maxHeight = field.maxHeight ?? Infinity;
        const ratioWidth = preWidth / prePageWidth;
        const ratioHeight = preHeight / prePageHeight;

        const newWidth = newPageWidth * ratioWidth;
        const newHeight = newPageHeight * ratioHeight;
        const newFontSize = calcFontSize(newWidth, newHeight);

        return {
          ...field,
          x: newX,
          y: newY,
          width: newWidth > maxWidth ? maxWidth : newWidth,
          height: newHeight > maxHeight ? maxHeight : newHeight,
          fontSize: newFontSize,
        };
      });
      return {
        ...signer,
        signFields: updatedSignFields,
      };
    });
    setSignerList(updatedSignerList);
  };

  const updateMainFieldsScaleByOther = (newScale: number) => {
    const prePageWidth = defaultMainPageWidth * prevScaleRef.current;
    const prePageHeight = prePageWidth * defaultWidthHeightRatio;
    const newPageWidth = defaultMainPageWidth * newScale;
    const newPageHeight = newPageWidth * defaultWidthHeightRatio;

    const updatedSignFieldList = signFieldList.map((field) => {
      const ratioX = field.x / prePageWidth;
      const ratioY = field.y / prePageHeight;
      const newX = newPageWidth * ratioX;
      const newY = newPageHeight * ratioY;

      const preWidth = field.width;
      const preHeight = field.height;
      // const maxWidth = field.maxWidth ?? Infinity;
      // const maxHeight = field.maxHeight ?? Infinity;
      const ratioWidth = preWidth / prePageWidth;
      const ratioHeight = preHeight / prePageHeight;

      const newWidth = newPageWidth * ratioWidth;
      const newHeight = newPageHeight * ratioHeight;
      const newFontSize = calcFontSize(newWidth, newHeight);

      return {
        ...field,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        fontSize: newFontSize,
      };
    });

    setSignFieldList(updatedSignFieldList);
  };

  const updateToolFieldsScaleByInit = (newScale: number) => {
    const prePageWidth = defaultMainPageWidth * prevScaleRef.current;
    const prePageHeight = prePageWidth * defaultWidthHeightRatio;
    const newPageWidth = defaultMainPageWidth * newScale;
    const newPageHeight = newPageWidth * defaultWidthHeightRatio;

    const list = toolFieldList.map((toolField) => {
      const preWidth = toolField.width;
      const preHeight = toolField.height;
      const maxWidth = toolField.maxWidth ?? Infinity;
      const maxHeight = toolField.maxHeight ?? Infinity;
      const ratioWidth = preWidth / prePageWidth;
      const ratioHeight = preHeight / prePageHeight;
      const newWidth = newPageWidth * ratioWidth;
      const newHeight = newPageHeight * ratioHeight;
      const newFontSize = calcFontSize(newWidth, newHeight);

      return {
        ...toolField,
        width: newWidth > maxWidth ? maxWidth : newWidth,
        height: newHeight > maxHeight ? maxHeight : newHeight,
        fontSize: newFontSize,
      };
    });
    setToolFieldList(list);
  };

  const scaleChange = (newScale: number) => {
    let zoomType: IZoomType | null = null;
    if (newScale > prevScaleRef.current) {
      zoomType = 'in';
    } else {
      zoomType = 'out';
    }
    console.log({ zoomType });
    if (mode === SignatureModeEnum.INIT) {
      updateMainFieldsScaleByInit(newScale);
      updateToolFieldsScaleByInit(newScale);
    } else {
      updateMainFieldsScaleByOther(newScale);
    }
  };

  const zoomIn = () => {
    if (scale >= maxScale) return;
    const newScale = scale + scaleStep;
    setScale(newScale);
    prevScaleRef.current = scale;
    scaleChange(newScale);
  };

  const zoomOut = () => {
    if (scale <= minScale) return;
    const newScale = scale - scaleStep;
    setScale(newScale);
    prevScaleRef.current = scale;
    scaleChange(newScale);
  };

  const resetZoom = () => {
    const newScale = 1;
    setScale(newScale);
    prevScaleRef.current = scale;
    scaleChange(newScale);
  };

  const renderThumbFieldsByInit = (pageNo: number) => {
    // 遍历 signerList，找到当前页的所有字段
    const fields = signerList
      .map((signer) => signer.signFields)
      .flat()
      .filter((field) => field.pageNo === pageNo);

    // 根据 defaultThumbScale 缩放缩略图上的字段

    const thumbPdfWidth = defaultThumbPageWidth;
    const thumbPdfHeight = thumbPdfWidth * defaultWidthHeightRatio;
    const mainPdfWidth = defaultMainPageWidth * scale;
    const mainPdfHeight = mainPdfWidth * defaultWidthHeightRatio;

    const ratioX = thumbPdfWidth / mainPdfWidth;
    const ratioY = thumbPdfHeight / mainPdfHeight;

    // 缩放不影响原始数据，只是在缩略图上显示的时候缩放

    const updatedFields = fields.map((field) => {
      const newX = field.x * ratioX;
      const newY = field.y * ratioY;
      const newWidth = field.width * ratioX;
      const newHeight = field.height * ratioY;

      return {
        ...field,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
    });

    return updatedFields.map((field) => (
      <ThumbFieldView
        key={field.uuid}
        style={{
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
          backgroundColor: field.mainColor,
        }}
      />
    ));
  };

  const renderThumbFieldsByOther = (pageNo: number) => {
    const fields = signFieldList.filter((field) => field.pageNo === pageNo);
    // 根据 defaultThumbScale 缩放缩略图上的字段

    const thumbPdfWidth = defaultThumbPageWidth;
    const thumbPdfHeight = thumbPdfWidth * defaultWidthHeightRatio;
    const mainPdfWidth = defaultMainPageWidth * scale;
    const mainPdfHeight = mainPdfWidth * defaultWidthHeightRatio;

    const ratioX = thumbPdfWidth / mainPdfWidth;
    const ratioY = thumbPdfHeight / mainPdfHeight;

    // 缩放不影响原始数据，只是在缩略图上显示的时候缩放

    const updatedFields = fields.map((field) => {
      const newX = field.x * ratioX;
      const newY = field.y * ratioY;
      const newWidth = field.width * ratioX;
      const newHeight = field.height * ratioY;

      return {
        ...field,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
    });

    return updatedFields.map((field) => (
      <ThumbFieldView
        key={field.id}
        style={{
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
          backgroundColor: field.mainColor,
        }}
      />
    ));
  };

  const renderThumbFields = (pageNo: number) => {
    if (mode === SignatureModeEnum.INIT) {
      return renderThumbFieldsByInit(pageNo);
    } else {
      return renderThumbFieldsByOther(pageNo);
    }
  };

  const onMainFieldFocus = (field: IField) => {
    setActiveMainField(field);
  };

  const onMainFieldDelete = (field: IField) => {
    const updatedSignerList = signerList.map((signer) => {
      const updatedSignFields = signer.signFields.filter(
        (f) => f.uuid !== field.uuid,
      );
      return {
        ...signer,
        signFields: updatedSignFields,
      };
    });
    setSignerList(updatedSignerList);
  };

  const getSignFields = () => {
    const flattenSignFields: IField[] = [];
    const prePageWidth = defaultMainPageWidth * scale;
    const prePageHeight = prePageWidth * defaultWidthHeightRatio;
    const newPageWidth = defaultMainPageWidth * 1;
    const newPageHeight = newPageWidth * defaultWidthHeightRatio;

    signerList.forEach((signer) => {
      signer.signFields.forEach((field) => {
        const ratioX = field.x / prePageWidth;
        const ratioY = field.y / prePageHeight;
        const newX = newPageWidth * ratioX;
        const newY = newPageHeight * ratioY;

        const preWidth = field.width;
        const preHeight = field.height;
        const maxWidth = field.maxWidth ?? Infinity;
        const maxHeight = field.maxHeight ?? Infinity;
        const ratioWidth = preWidth / prePageWidth;
        const ratioHeight = preHeight / prePageHeight;

        const newWidth = newPageWidth * ratioWidth;
        const newHeight = newPageHeight * ratioHeight;
        const newFontSize = calcFontSize(newWidth, newHeight);

        const newField = {
          ...field,
          x: newX,
          y: newY,
          width: newWidth > maxWidth ? maxWidth : newWidth,
          height: newHeight > maxHeight ? maxHeight : newHeight,
          fontSize: newFontSize,
        };

        flattenSignFields.push(newField);
      });
    });

    return flattenSignFields;
  };

  const checkRequired = () => {
    let validateInfo = {
      passed: true,
      reason: '',
    };

    for (let i = 0; i < signerList.length; i++) {
      const signer = signerList[i];
      const atLeastOneRequired = lodash.some(signer.signFields, {
        required: true,
      });
      if (!atLeastOneRequired) {
        validateInfo = {
          passed: false,
          reason: `Signature field is not configured for Signer (${signer.name})`,
        };
        break;
      }
    }

    return validateInfo;
  };

  const checkSigningRequired = () => {
    let validateInfo = {
      passed: true,
      reason: '',
    };

    if (incompleteList.length > 0) {
      validateInfo = {
        passed: false,
        reason: `Please check all fields.`,
      };
    }

    return validateInfo;
  };

  const getSigningElements = (): Promise<any> => {
    const allSettled: Array<Promise<any>> = [];

    const buildField = (
      field: ISignField,
      node: Element,
      withoutScheme: boolean,
    ) => {
      return new Promise((resolve, reject) => {
        if (field.signType === SignTypeEnum.SIGNATURE) {
          const base64Container = node.querySelector(
            '.js-signature-base64-container',
          );
          const imgData = base64Container?.getAttribute?.('data-url');
          const imageBase64Str = imgData?.replace?.(
            /^data:image\/[a-z]+;base64,/,
            '',
          );

          const obj = {
            signType: field.signType,
            width: field.width,
            height: field.height,
            x: field.x,
            y: field.y,
            pageNo: field.pageNo,
            imageBase64Str: imageBase64Str,
          };
          resolve(obj);
        } else {
          html2canvas(node as HTMLElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          })
            .then((canvas) => {
              // document.body.appendChild(canvas);
              // 将 Canvas 转换为 Base64 编码的图片数据
              const imgData = canvas.toDataURL('image/png', 1);
              let imageBase64Str = imgData;
              if (withoutScheme) {
                imageBase64Str = imgData.replace(
                  /^data:image\/[a-z]+;base64,/,
                  '',
                );
              }
              const obj = {
                signType: field.signType,
                width: field.width,
                height: field.height,
                x: field.x,
                y: field.y,
                pageNo: field.pageNo,
                imageBase64Str: imageBase64Str,
              };
              resolve(obj);
            })
            .catch((err) => {
              console.error(err);
              reject(err);
            });
        }
      });
    };

    for (let i = 0; i < signFields.length; i++) {
      const field = signFields[i];
      let node = document.querySelector(
        `.js-main-field-handle[data-id="${field.id}"] .commonField`,
      ) as HTMLElement;

      if (field.signType === SignTypeEnum.DATE) {
        node = document.querySelector(
          `.js-main-field-handle[data-id="${field.id}"] .commonField`,
        ) as HTMLElement;
      }

      if (node) {
        // const clonedNode = node.cloneNode(true);
        // // 将克隆节点转换为 HTMLElement 类型
        // const clonedElement = clonedNode as HTMLElement;
        // clonedElement.style.width = field.width + 'px';
        // clonedElement.style.height = field.height + 'px';
        // allSettled.push(buildField(field, clonedElement, true));

        // node.style.width = field.width + 'px';
        // node.style.height = field.height + 'px';
        allSettled.push(buildField(field, node, true));
      } else {
        console.error('node is undefined');
      }
    }

    return new Promise((resolve, reject) => {
      Promise.all(allSettled)
        .then((list) => {
          console.log({ list });
          resolve(list);
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        })
        .finally(() => {});
    });
  };

  const onSigningFieldChange = (signField: ISignField, v: any) => {
    const isExist = lodash.find(incompleteList, (field) => {
      return field.id === signField.id;
    });
    if (Boolean(v)) {
      if (isExist) {
        const newIncompleteList = incompleteList.filter((field) => {
          return field.id !== signField.id;
        });
        setIncompleteList(newIncompleteList);
      }
    } else {
      if (!isExist) {
        const newIncompleteList = [...incompleteList, signField];
        setIncompleteList(newIncompleteList);
      }
    }
  };

  const reset = () => {
    exitFullscreen();
    setDeltaY(0);
    setPdfLoading(false);
    setScale(defaultScale);
    setSelectedThumbIndex(0);

    setSignerList([]);
    setActiveSigner(null);

    setActiveMainField(null);
    setMainFieldDragging(false);

    setToolFieldList(defaultToolFieldList);
    setToolFieldState(initialToolFieldState);
    setActiveToolField(null);

    mainPageObserver?.disconnect?.();
  };

  const renderMainFieldsByInit = (index: number) => {
    const pageNo = index + 1;
    // 遍历 signerList，找到当前页的所有字段
    const fields = signerList
      .map((signer) => signer.signFields)
      .flat()
      .filter((field) => field.pageNo === pageNo);

    return fields.map((field) => (
      <ConfigProvider
        key={field.uuid}
        theme={{
          token: {
            motion: false,
          },
        }}
      >
        <Popover
          open={!mainFieldDragging && activeMainField?.uuid === field.uuid}
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
          placement="bottom"
          title={
            <div onClick={() => onMainFieldDelete(field)}>
              <DeleteOutlined />
            </div>
          }
          rootClassName={styles.mainFieldDeletePopover}
          style={{ width: '36px', height: '26px' }}
        >
          <Rnd
            disableDragging={false}
            enableResizing={true}
            bounds="parent"
            minWidth={field.minWidth}
            minHeight={field.minHeight}
            // maxWidth={field.maxWidth ?? Infinity}
            // maxHeight={field.maxHeight ?? Infinity}
            position={{ x: field.x, y: field.y }}
            onDragStart={(e) => onMainFieldDragStart(field, e)}
            onDrag={(e) => onMainFieldDrag(field, e)}
            onDragStop={(e, data) => onMainFieldDragStop(field, e, data)}
            onResize={(...rest) => onMainFieldResize(field, rest)}
            className={cls('main-field', {
              isFocus:
                !mainFieldDragging && activeMainField?.uuid === field.uuid,
            })}
            dragHandleClassName="js-main-field-handle"
            resizeHandleClasses={resizeHandleClasses}
            resizeHandleComponent={{
              topLeft: (
                <div
                  className="resize-handle top-left"
                  style={{ borderColor: field.mainColor }}
                />
              ),
              topRight: (
                <div
                  className="resize-handle top-right"
                  style={{ borderColor: field.mainColor }}
                />
              ),
              bottomLeft: (
                <div
                  className="resize-handle bottom-left"
                  style={{ borderColor: field.mainColor }}
                />
              ),
              bottomRight: (
                <div
                  className="resize-handle bottom-right"
                  style={{ borderColor: field.mainColor }}
                />
              ),
            }}
            size={{ width: field.width, height: field.height }}
          >
            <div
              className="js-main-field-handle"
              data-id={field.uuid}
              onClick={() => onMainFieldFocus(field)}
            >
              <FieldBase
                readonly={true}
                required={field.required}
                signType={field.signType}
                mainColor={field.mainColor}
                style={{
                  width: field.width,
                  height: field.height,
                  fontSize: field.fontSize,
                }}
              />
            </div>
          </Rnd>
        </Popover>
      </ConfigProvider>
    ));
  };

  const renderMainFieldBySigning = (index: number) => {
    const pageNo = index + 1;
    const fields = signFieldList.filter((field) => field.pageNo === pageNo);

    return fields.map((field) => (
      <Rnd
        key={field.id}
        disableDragging={true}
        enableResizing={false}
        bounds="parent"
        // minWidth={field.minWidth}
        // minHeight={field.minHeight}
        // maxWidth={field.maxWidth ?? Infinity}
        // maxHeight={field.maxHeight ?? Infinity}
        position={{ x: field.x, y: field.y }}
        className="main-field"
        dragHandleClassName="js-main-field-handle"
        resizeHandleClasses={resizeHandleClasses}
        resizeHandleComponent={{
          topLeft: (
            <div
              className="resize-handle top-left"
              style={{ borderColor: field.mainColor }}
            />
          ),
          topRight: (
            <div
              className="resize-handle top-right"
              style={{ borderColor: field.mainColor }}
            />
          ),
          bottomLeft: (
            <div
              className="resize-handle bottom-left"
              style={{ borderColor: field.mainColor }}
            />
          ),
          bottomRight: (
            <div
              className="resize-handle bottom-right"
              style={{ borderColor: field.mainColor }}
            />
          ),
        }}
        // size={{ width: field.width, height: field.height }}
      >
        <div className="js-main-field-handle" data-id={field.id}>
          <FieldBase
            readonly={false}
            signType={field.signType}
            required={field.required}
            mainColor={field.mainColor}
            signingName={signingName!}
            onChange={(v) => onSigningFieldChange(field, v)}
            style={{
              width: field.width,
              height: field.height,
              fontSize: field.fontSize,
            }}
          />
        </div>
      </Rnd>
    ));
  };

  const renderMainField = (index: number) => {
    if (mode === SignatureModeEnum.INIT) {
      return renderMainFieldsByInit(index);
    } else if (mode === SignatureModeEnum.SIGNING) {
      // pdf + signer fields
      return renderMainFieldBySigning(index);
    } else if (mode === SignatureModeEnum.READONLY) {
      // only pdf
      return null;
    } else {
      console.error('Unknown mode type, please check!');
      return null;
    }
  };

  const renderRightByInit = () => {
    return (
      <>
        <div className="recipients">
          <div className="title">Signer</div>
          <div className="recipient-list">
            {signerList.map((signer) => (
              <div
                key={signer.email}
                className={cls(
                  'recipient-item',
                  activeSigner?.email === signer.email && 'active',
                )}
                onClick={() => setActiveSigner(signer)}
              >
                <div className="recipient-avatar">
                  <Avatar style={{ backgroundColor: signer.mainColor }}>
                    {signer.name.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                <div className="recipient-info">
                  <div className="recipient-name ellipsis">{signer.name}</div>
                  <div className="recipient-email ellipsis">{signer.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="toolbar">
          <div className="title">Fields</div>
          <div className="field-list">
            {toolFieldList.map((toolField) => (
              <div key={toolField.signType} className="field-option">
                <Rnd
                  enableResizing={false}
                  position={{ x: 0, y: 0 }}
                  onDragStart={() => onToolFieldDragStart(toolField)}
                  onDrag={(e) => onToolFieldDrag(e)}
                  onDragStop={(e) => onToolFieldDragStop(toolField, e)}
                  className="toolbar-field"
                >
                  <div
                    style={
                      activeToolField?.signType === toolField.signType
                        ? toolFieldState.style
                        : initialToolFieldState.style
                    }
                  >
                    <div
                      className="js-tool-field-handle"
                      style={{ display: 'inline-block' }}
                    >
                      <FieldBase
                        readonly={true}
                        signType={toolField.signType}
                        required={toolField.required}
                        mainColor={
                          activeSigner?.mainColor ?? signers[0]?.mainColor
                        }
                        style={{
                          width: toolField.width,
                          height: toolField.height,
                          fontSize: toolField.fontSize,
                        }}
                      />
                    </div>
                  </div>
                </Rnd>
                <FieldOptionView
                  signType={toolField.signType}
                  signTypeName={toolField.signTypeName}
                  required={toolField.required}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderRightByOther = () => {
    return (
      <>
        <div className="recipients">
          <div className="title">Signer</div>
          <div className="signing-process">
            <SignerProcess
              signerList={signerList}
              maxHeight={500}
              showStatus
              showLine
            />
          </div>
        </div>

        <div className="recipients">
          <div className="title">CC</div>
          <div className="signing-process-cc">
            <SignerProcess
              signerList={ccList}
              showStatus={false}
              showLine={false}
              showBadge={false}
              maxHeight={300}
            />
          </div>
        </div>
      </>
    );
  };

  const renderRight = () => {
    if (mode === SignatureModeEnum.INIT) {
      return renderRightByInit();
    } else {
      return renderRightByOther();
    }
  };

  useEffect(() => {
    if (pdfStr) {
      loadPdf(pdfStr);
    }
  }, [pdfStr]);

  useEffect(() => {
    if (signers.length > 0) {
      setActiveSigner(signers[0]);
      const FE_NEED_SIGNERS = signers.map((item) => {
        return { ...item, signFields: [] };
      });
      setSignerList(FE_NEED_SIGNERS);
    }
  }, [signers]);

  useEffect(() => {
    if (signFields.length > 0) {
      setSignFieldList(signFields);
      setIncompleteList(signFields);
    }
  }, [signFields]);

  useEffect(() => {
    const wheelListener = (event: any) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.deltaY > 0 || event.key === '-') {
          zoomOut();
          event.preventDefault();
        } else if (event.deltaY < 0 || event.key === '=') {
          zoomIn();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('mousewheel', wheelListener, { passive: false });
    document.addEventListener('keydown', wheelListener);
    return () => {
      document.removeEventListener('mousewheel', wheelListener);
      document.removeEventListener('keydown', wheelListener);
    };
  }, [signerList]);

  // useKeyPress(
  //   // 阻止浏览器默认事件
  //   // (event) => {
  //   //   return event.ctrlKey || event.metaKey;
  //   // },
  //   'ctrl.=',
  //   () => {
  //     zoomIn();
  //     // event.preventDefault();
  //   },
  //   { exactMatch: true, useCapture: true, target: mainContentRef },
  // );

  useEffect(() => {
    if (isFullscreen) {
      setDeltaY(100);
    } else {
      setDeltaY(offset);
    }
  }, [offset, isFullscreen]);

  useEffect(() => {
    if (
      thumbLastPageRenderSuccess &&
      mainLastPageRenderSuccess &&
      mainContentRenderSuccess
    ) {
      mainPageObserver?.disconnect?.();
      const container = document.querySelector('.js-main-content');
      const pages = document.querySelectorAll('.js-page-render');

      if (container && pages.length > 0) {
        const containerRect = getDOMRect(container as HTMLElement);
        const scrollingElementTop = document.scrollingElement?.scrollTop ?? 0;
        const containerMidLine =
          scrollingElementTop + containerRect.top + containerRect.height / 2;
        const options: IntersectionObserverInit = {
          root: container,
          rootMargin: '0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          // threshold: 0.1,
        };

        mainPageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
              const { boundingClientRect } = entry;

              console.log(
                'entry.intersectionRatio =>',
                entry.intersectionRatio,
              );
              console.log('containerMidLine:', containerMidLine);
              if (
                boundingClientRect.top < containerMidLine &&
                boundingClientRect.top + boundingClientRect.height >
                  containerMidLine
              ) {
                console.log('entry.target', entry.target);
                const pageIndex = entry.target.getAttribute('data-pageindex');
                if (!isUndefinedOrNull(pageIndex)) {
                  selectedThumbAndScrollIntoView(Number(pageIndex));
                }
              }
            }
          });
        }, options);

        pages.forEach((page) => {
          mainPageObserver.observe(page);
        });
      }
    }

    return () => {
      mainPageObserver?.disconnect?.();
    };
  }, [
    thumbLastPageRenderSuccess,
    mainLastPageRenderSuccess,
    mainContentRenderSuccess,
    scale,
    deltaY,
  ]);

  useEffect(() => {
    const width = mainContentSize?.width ?? 0;
    const height = mainContentSize?.height ?? 0;

    if (width > 0 && height > 0) {
      setMainContentRenderSuccess(true);
    } else {
      setMainContentRenderSuccess(false);
    }
  }, [mainContentSize]);

  useImperativeHandle(ref, () => ({
    getSignFields: () => getSignFields(),
    checkRequired: () => checkRequired(),
    checkSigningRequired: () => checkSigningRequired(),
    getSigningElements: () => getSigningElements(),
    reset: () => reset(),
  }));

  return (
    <div
      className={cls('pdfViwerContainer', styles.pdfViwerContainer)}
      ref={containerRef}
    >
      {pdfLoading ? (
        <ProSkeleton type="descriptions" />
      ) : (
        <Row justify="space-between">
          <Col>
            <div className="left">
              <div className="thumb-profile">
                <div className="file-name ellipsis" title={pdfName}>
                  {pdfName}
                </div>
                <div className="total-page">
                  <span className="num-page">{numPages}</span>Page
                </div>
              </div>
              <div
                className="thumbnails"
                style={{
                  height: isFullscreen
                    ? 'calc(100vh - 80px)'
                    : 'calc(100vh - 120px)',
                }}
              >
                <Document
                  file={pdfStr}
                  loading={pdfLoading}
                  onSourceError={(error) => {
                    console.error(error);
                  }}
                  onLoadError={(error) => {
                    console.error(error);
                  }}
                >
                  <div className="thumb-list">
                    {Array.from({ length: numPages }).map((_, index) => (
                      <div
                        key={index}
                        className={cls(
                          'thumb-item',
                          selectedThumbIndex === index && 'active',
                        )}
                        data-text={index + 1}
                        data-pageindex={index}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <Page
                          className="page-item"
                          pageNumber={index + 1}
                          // scale={defaultThumbScale}
                          width={defaultThumbPageWidth}
                          onRenderSuccess={() => {
                            if (index === numPages - 1) {
                              setThumbLastPageRenderSuccess(true);
                            }
                          }}
                          {...pageCommonProps}
                        >
                          {renderThumbFields(index + 1)}
                        </Page>
                      </div>
                    ))}
                  </div>
                </Document>
              </div>
            </div>
          </Col>

          <Col style={{ flex: '1 1 0%', overflow: 'hidden' }}>
            <div className="middle">
              <div className="header">{header}</div>
              <div className="util-bar">
                <Row gutter={24}>
                  <Col span={8}>
                    {mode === SignatureModeEnum.SIGNING && (
                      <div className="fields-required">
                        {signFieldList.length}Fields required (
                        <span className="incomplete">
                          {incompleteList.length}
                        </span>
                        incomplete)
                      </div>
                    )}
                  </Col>
                  <Col span={8}>
                    <div className="zoom-btns" style={{ height: '40px' }}>
                      <Button
                        type="text"
                        icon={<ZoomInOutlined />}
                        onClick={zoomIn}
                      />
                      <Button
                        type="text"
                        icon={<ZoomOutOutlined />}
                        onClick={zoomOut}
                      />
                      <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={resetZoom}
                      />
                      <Button
                        type="text"
                        icon={
                          isFullscreen ? (
                            <FullscreenExitOutlined />
                          ) : (
                            <FullscreenOutlined />
                          )
                        }
                        onClick={() => {
                          toggleFullscreen();
                        }}
                      />
                    </div>
                  </Col>
                  <Col span={8} />
                </Row>
              </div>
              <div
                className="main-content js-main-content"
                ref={mainContentRef}
                onScroll={onMainContentScroll}
                style={{
                  height: isFullscreen
                    ? 'calc(100vh - 70px)'
                    : 'calc(100vh - 140px)',
                }}
              >
                <Document
                  file={pdfStr}
                  loading={pdfLoading}
                  onSourceError={(error) => {
                    console.error(error);
                  }}
                  onLoadError={(error) => {
                    console.error(error);
                  }}
                >
                  <div className="main-pages js-main-pages">
                    {Array.from({ length: numPages }).map((_, index) => (
                      <div
                        key={index}
                        className="page-render js-page-render"
                        data-pageindex={index}
                      >
                        <Page
                          className="react-pdf-page js-react-pdf-page"
                          pageNumber={index + 1}
                          scale={scale}
                          width={defaultMainPageWidth}
                          onRenderSuccess={() => {
                            if (index === numPages - 1) {
                              setMainLastPageRenderSuccess(true);
                            }
                          }}
                          {...pageCommonProps}
                        >
                          {renderMainField(index)}
                        </Page>
                        <div className="page-item-footer">
                          <span style={{ opacity: 0 }}>{pdfName}</span>
                          <span>
                            {index + 1} of {numPages}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Document>
              </div>
            </div>
          </Col>

          <Col>
            <div
              className="right"
              style={{
                width: mode === SignatureModeEnum.INIT ? '248px' : '338px',
              }}
            >
              {renderRight()}
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
});

export default SignatureBase;
