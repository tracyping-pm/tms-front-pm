export const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const getExts = (file: any) => {
  const name = (file.name || file.fileName).toLowerCase();
  const ext = name.substring(name.lastIndexOf('.'));
  return ext;
};

export const splitFileName = (fileName: string) => {
  const index = fileName.lastIndexOf('.');
  const ext = fileName.substring(index + 1);
  const name = fileName.substring(0, index);
  return {
    name,
    ext,
  };
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const downloadFile = (file: any) => {
  // 生成文件 URL
  const url = URL.createObjectURL(file);

  // 创建下载链接
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || file.fileName;

  // 点击触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 释放url
  URL.revokeObjectURL(url);
};

export const textToImage = () => {
  return new Promise((resolve, reject) => {
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 设置宽高
        canvas.width = 120;
        canvas.height = 120;

        const bgImage = new Image();
        bgImage.src = '/img/logo.png';
        bgImage.width = 100;
        bgImage.height = 100;

        bgImage.onload = () => {
          // 背景色
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(bgImage, 10, 10, 100, 100);

          // 字体样式
          ctx.fillStyle = '#000';
          ctx.font = '12px sans-serif';
          ctx.textBaseline = 'top';
          // ctx.textAlign = "center";

          // 获得文本宽高
          // const textWidth = ctx.measureText(text).width;
          // const textHeight = ctx.measureText(text).actualBoundingBoxAscent +
          //   ctx.measureText(text).actualBoundingBoxDescent;

          // 计算居中坐标
          // const x = (canvas.width - textWidth) / 2;
          // const y = (canvas.height - textHeight) / 2;

          // 绘制文本
          // ctx.textBaseline = "top";
          // ctx.fillText(text, 0, 0);

          // 转换为图片URL
          const url = canvas.toDataURL('image/png');

          resolve(url);
        };
      } else {
        reject('canvas is not supported');
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const fileToBlob = async (file: File) => {
  const fileData = await file.arrayBuffer();
  return new Blob([fileData], { type: file.type });
};
