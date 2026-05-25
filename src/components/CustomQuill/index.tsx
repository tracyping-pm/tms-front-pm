import BlotFormatter from 'quill-blot-formatter';
import { FC, useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ReactQuill, { Quill } from 'react-quill';
// @ts-ignore
import quillEmoji from 'quill-emoji';
import 'quill-emoji/dist/quill-emoji.css';
// @ts-ignore
// import ImageResize from 'quill-image-resize-module';
// @ts-ignore
import VideoResize from 'quill-video-resize-module2';
import 'react-quill/dist/quill.snow.css';
// import { uploadFile } from '@/api/oss';

import { App, Button } from 'antd';
// import { ProFormUploadButton } from '@ant-design/pro-form';
import { BELONG_IMG_EXTS } from '@/constants';
import {
  AudioOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MehOutlined,
  RedoOutlined,
  UndoOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { ProFormUploadButton } from '@ant-design/pro-components';
import { useFullscreen } from 'ahooks';
import cls from 'classnames';
import linkifyStr from 'linkify-string';
import { Opts } from 'linkifyjs';
import { getBase64, getExts } from '../CustomUpload/fileSupport';
import styles from './index.less';

const QUILL_CONTAINER_CLASS_NAME = 'custom-quill';

const linkyOptions: Opts = {
  className: 'new-link-url',
  rel: 'noopener noreferrer',
  target: '_blank',
};

const COMMON_ICON_STYLE = { fontSize: '18px' };
const icons = Quill.import('ui/icons');

const emojiHtml = renderToString(<MehOutlined style={COMMON_ICON_STYLE} />);
const audioHtml = renderToString(<AudioOutlined style={COMMON_ICON_STYLE} />);
const undoHtml = renderToString(<UndoOutlined style={COMMON_ICON_STYLE} />);
const redoHtml = renderToString(<RedoOutlined style={COMMON_ICON_STYLE} />);
const fullscreenHtml = renderToString(
  <FullscreenOutlined style={COMMON_ICON_STYLE} />,
);
const fullscreenExitHtml = renderToString(
  <FullscreenExitOutlined style={COMMON_ICON_STYLE} />,
);

icons['emoji'] = emojiHtml;
icons['audio'] = audioHtml;
icons['undo'] = undoHtml;
icons['redo'] = redoHtml;
icons['fullscreen'] = fullscreenHtml;

const Image = Quill.import('formats/image'); // Had to get the class this way, instead of ES6 imports, so that quill could register it without errors

const ATTRIBUTES = [
  'alt',
  'height',
  'width',
  'class',
  'style', // Had to add this line because the style was inlined
];

class CustomImage extends Image {
  static formats(domNode: any) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      const copy = { ...formats };

      if (domNode.hasAttribute(attribute)) {
        // @ts-ignore
        copy[attribute] = domNode.getAttribute(attribute);
      }

      return copy;
    }, {});
  }

  format(name: any, value: any) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register('formats/image', CustomImage);
Quill.register('modules/blotFormatter', BlotFormatter);

Quill.register('modules/quillEmoji', quillEmoji);
// Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/videoResize', VideoResize);

const Video = Quill.import('formats/video');
const Link = Quill.import('formats/link');

class CustomLink extends Link {
  static create(value: any) {
    const node = super.create();
    const href = linkifyStr(value, {
      ...linkyOptions,
      render: ({ attributes }) => {
        return `${attributes.href}`;
      },
    });
    // Sanitize url value if desired
    node.setAttribute('href', href);
    // Okay to set other non-format related attributes
    // These are invisible to Parchment so must be static
    node.setAttribute('target', '_blank');
    return node;
  }

  // static sanitize(url: any) {
  //   return Link.sanitize(url);
  // }
}
Quill.register('formats/link', CustomLink);

class CustomVideo extends Video {
  static create(value: any) {
    const node = super.create(value);
    // const iframe = document.createElement('iframe');
    // iframe.setAttribute('src', this.sanitize(value));
    // iframe.setAttribute('frameborder', '0');
    // iframe.setAttribute('width', '70%');
    // iframe.setAttribute('height', '300');
    // iframe.setAttribute('allowfullscreen', 'true');

    const video = document.createElement('video');
    video.setAttribute('controls', 'true');
    video.setAttribute('src', this.sanitize(value));
    video.setAttribute('width', '100%');
    video.setAttribute('controlsList', 'nodownload');
    node.appendChild(video);
    return node;
  }

  static sanitize(url: any) {
    return Link.sanitize(url);
  }
}

CustomVideo.blotName = 'video';
CustomVideo.className = 'ql-video';
CustomVideo.tagName = 'DIV';

Quill.register('formats/video', CustomVideo);

interface IProps {
  onChange?(content: string): void;
  value?: string;
  modules?: any;
  placeholder?: string;
  readonly?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

type UploadTye = 'image' | 'video' | 'voice' | 'link';

// MB
const FILE_SIZE_MAP: { [key: string]: number } = {
  image: 10,
  video: 500,
  voice: 20,
};

const CustomQuill: FC<IProps> = ({
  value,
  onChange,
  modules = [],
  placeholder = '',
  readonly,
  minHeight = 300,
  maxHeight = 500,
}) => {
  const { message } = App.useApp();
  const outerRef = useRef(null);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(outerRef);
  const quillRef = useRef<ReactQuill>(null);
  const [uploadType, setUploadType] = useState<UploadTye>('image');

  const handleChange: ReactQuill['props']['onChange'] = async (
    content,
    delta,
    source,
    editor,
  ) => {
    console.log({ delta, source, editor });
    // const editorValue = quillRef?.current?.getEditor?.()?.getText?.() ?? '';
    // 删除图片
    const d = document.createElement('div');
    const newContent = content.replace(/<img[^>]*>/gi, '');
    d.innerHTML = newContent;
    console.log({ newContent });
    onChange?.(newContent.replace('<p><br></p>', ''));
  };

  const uploadHandle = async (url: string, e: any) => {
    if (
      uploadType === 'image' ||
      uploadType === 'video' ||
      uploadType === 'link'
    ) {
      const editor = quillRef?.current?.editor;
      if (!editor) {
        return;
      }
      // @ts-ignore
      const { index } = editor.getSelection(); // 光标位置
      if (url !== null && url.length > 0) {
        // 将文件上传后的URL地址插入到编辑器文本中
        let _value = url;
        const selection = editor.getSelection();
        // 目前仍用本地编码方式展示图片
        _value = _value.indexOf('http') !== -1 ? _value : `${_value}`;
        editor.insertEmbed(
          selection !== null ? selection.index : 0,
          uploadType,
          _value,
        ); // 调用编辑器的 insertEmbed 方法，插入URL
      } else {
        message.error(`${uploadType}插入失败`);
      }
      editor.setSelection(index ?? 0 + 1); // 光标向后移动一位
    } else {
      const editor = quillRef?.current?.editor;
      if (!editor) {
        return;
      }
      // @ts-ignore
      const { index } = editor.getSelection(); // 光标位置
      const BlockEmbed = Quill.import('blots/block/embed');
      class AudioBlot extends BlockEmbed {
        static create() {
          const node = super.create();
          node.setAttribute('src', url);
          node.setAttribute('controls', true);
          node.setAttribute('controlsList', 'nodownload');
          node.setAttribute('id', 'voice');
          return node;
        }
      }

      AudioBlot.blotName = 'audio';
      AudioBlot.tagName = 'audio';
      Quill.register(AudioBlot);
      editor.insertEmbed(index, 'audio', e, 'api');
      editor.setSelection(index + 1); // 光标向后移动一位
    }
  };

  // const uploadToOssOne = (info: any, fileData: any, e: any) => {
  //   const formData = new FormData();
  //   const formArray = Object.entries(fileData.formFields);
  //   formArray.forEach((item) => {
  //     // @ts-ignore
  //     formData.append(item[0], item[1]);
  //   });
  //   formData.append('file', info.file);
  //   imgpost(`https://${fileData.endpoint}`, formData)
  //     .then((res) => {
  //       const { url } = res.data;

  //       uploadHandle(url, e);
  //     })
  //     .catch(() => {
  //       message.error('上传失败');
  //     })
  //     .finally(() => {
  //       message.destroy();
  //     });
  // };

  const handleUploadSuccess = (e: any) => {
    // const o = {
    //   file: e.file,
    // };
    message.loading('文件上传中', 9999);
    const file = e.file;
    const ext = getExts(file);
    if (BELONG_IMG_EXTS.includes(ext)) {
      // 显示预览图
      // TODO: 调用 Drive 服务拉取图片地址
      getBase64(file).then((res) => {
        message.destroy();
        uploadHandle(res, e);
      });
    }
    // getFileSts()
    //   .then((res) => {
    //     uploadToOssOne(o, res.content, e);
    //   })
    //   .catch(() => {
    //     message.error('上传失败');
    //     message.destroy();
    //   });
  };

  const handleBeforeUpload = (file: File) => {
    if (FILE_SIZE_MAP[uploadType]) {
      const isLt = file.size / 1024 / 1024 < FILE_SIZE_MAP[uploadType];
      if (!isLt) {
        message.error(
          `File size cannot exceed ${FILE_SIZE_MAP[uploadType]} MB!`,
        );
        return false;
      }
      const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1);
      let tempWhiteList: string[] = [];
      if (uploadType === 'image') {
        tempWhiteList = ['jpg', 'jpeg', 'png'];
      } else if (uploadType === 'video') {
        tempWhiteList = ['avi', 'wmv', 'mpeg', 'mp4', 'mov'];
      } else if (uploadType === 'voice') {
        tempWhiteList = ['mp3', 'wav'];
      }
      if (!tempWhiteList.includes(fileSuffix)) {
        message.error(
          `File format is not supported. please upload ${tempWhiteList.join(
            ',',
          )}`,
        );
        return false;
      }
    }
    return true;
  };

  const triggerFileClick = (type: UploadTye) => {
    const fileInput = document.getElementById('js-quill-uploadInput');
    if (fileInput) {
      fileInput.click();
      setUploadType(type);
    }
  };

  const imgHandler = (state: boolean) => {
    if (state) {
      triggerFileClick('image');
    }
  };

  const videoHandler = (state: boolean) => {
    if (state) {
      triggerFileClick('video');
    }
  };

  const audioHandler = (state: boolean) => {
    if (state) {
      triggerFileClick('voice');
    }
  };

  const undoHandler = () => {
    const myEditor = quillRef.current?.editor;
    // @ts-ignore
    myEditor?.history?.undo?.();
  };

  const redoHandler = () => {
    const myEditor = quillRef.current?.editor;
    // @ts-ignore
    myEditor?.history?.redo?.();
  };

  const initHandler = () => {
    if (!quillRef?.current?.editor) {
      return;
    }
    quillRef.current.editor
      .getModule('toolbar')
      .addHandler('video', videoHandler);
    quillRef.current.editor
      .getModule('toolbar')
      .addHandler('image', imgHandler);
    quillRef.current.editor
      .getModule('toolbar')
      .addHandler('voice', audioHandler);
  };

  const initAudioButton = () => {
    const audioButton = document.querySelector('.ql-audio'); // "ql-" 是插件自动加的前缀
    if (audioButton) {
      audioButton.addEventListener('click', () => {
        audioHandler(true);
      });
    }
  };

  const initUndoButton = () => {
    const undoButton = document.querySelector('.ql-undo'); // "ql-" 是插件自动加的前缀
    if (undoButton) {
      undoButton.addEventListener('click', () => {
        undoHandler();
      });
    }
  };

  const initRedoButton = () => {
    const redoButton = document.querySelector('.ql-redo'); // "ql-" 是插件自动加的前缀
    if (redoButton) {
      redoButton.addEventListener('click', () => {
        redoHandler();
      });
    }
  };

  const initFullscreenButton = () => {
    const fullscreenButton = document.querySelector('.ql-fullscreen');

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        toggleFullscreen();
      });
    }
  };

  useEffect(() => {
    initAudioButton();
    initUndoButton();
    initRedoButton();
    initFullscreenButton();
    initHandler();
  }, []);

  useEffect(() => {
    const fullscreenButton = document.querySelector('.ql-fullscreen');

    if (!fullscreenButton) {
      return;
    }

    if (isFullscreen) {
      fullscreenButton.innerHTML = fullscreenExitHtml;
    } else {
      fullscreenButton.innerHTML = fullscreenHtml;
    }
  }, [isFullscreen]);

  return readonly ? (
    <div className={cls('ql-snow', styles.readOnly)}>
      <div className={cls('ql-editor')}>
        <pre dangerouslySetInnerHTML={{ __html: value || '' }} />
      </div>
    </div>
  ) : (
    <>
      <div ref={outerRef} className={cls(styles.outer, 'outer')}>
        <ReactQuill
          className={QUILL_CONTAINER_CLASS_NAME}
          placeholder={placeholder}
          ref={quillRef}
          theme="snow"
          onChange={handleChange}
          preserveWhitespace={true}
          // https://github.com/slab/quill/issues/360
          bounds={`.${QUILL_CONTAINER_CLASS_NAME}`}
          modules={{
            // imageResize: {
            //   displaySize: true,
            // },
            // videoResize: {
            //   displaySize: true,
            // },
            // 'emoji-toolbar': true,
            // 'emoji-shortname': true,
            history: {
              delay: 1000,
              maxStack: 100,
              userOnly: false,
            },
            toolbar: modules,
            blotFormatter: {},
          }}
          readOnly={readonly}
          value={value}
        />
        <div style={{ display: 'none' }}>
          <ProFormUploadButton
            className="ghost-upload"
            label="ghost-upload"
            fieldProps={{
              beforeUpload: handleBeforeUpload,
              customRequest: handleUploadSuccess,
              id: 'js-quill-uploadInput',
            }}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </ProFormUploadButton>
        </div>
      </div>
      <style>{`
        .custom-quill .ql-editor {
          min-height: ${minHeight}px;
          max-height: ${maxHeight}px;
        }
      `}</style>
    </>
  );
};

export default CustomQuill;

export const formatRichTextContent = (content: string) => {
  const d = document.createElement('div');
  d.innerHTML = content;
  const images = d.getElementsByTagName('img');
  const promiseList = Array.prototype.map.call(
    images,
    (img: HTMLImageElement) => {
      return new Promise((resolve, reject) => {
        const { src } = img;
        if (/^data:image\/[a-zA-Z]+;base64,/g.test(src)) {
          fetch(src)
            .then((res) => {
              return res.blob();
            })
            .then(async (blob) => {
              // const file = new File([blob], blob.type, {
              //   type: blob.type,
              // });
              // const data = await uploadFile(file);
              return { data: { url: '' }, type: blob.type };
            })
            .then(({ data: { url } }) => {
              img.src = url;
              resolve(url);
            })
            .catch(reject);
        } else {
          resolve(src);
        }
      });
    },
  );

  return Promise.all(promiseList).then(() => {
    return d.innerHTML;
  });
};
