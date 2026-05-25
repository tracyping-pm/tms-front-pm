import { formatBytes } from '@/components/CustomUpload/fileSupport';
import {
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import fontkit from '@pdf-lib/fontkit';
import { useSize } from 'ahooks';
import {
  Alert,
  Button,
  Card,
  Col,
  ColorPicker,
  Input,
  Progress,
  Row,
  Slider,
  Space,
  Tooltip,
  Typography,
  Upload,
  Watermark,
} from 'antd';
import { RcFile, UploadFile } from 'antd/es/upload';
import Color from 'color';
import downloadjs from 'downloadjs';
import { franc } from 'franc';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import React, { useRef, useState } from 'react';

const { Dragger } = Upload;
const { Text } = Typography;
const { TextArea } = Input;

export const LIMIT_SIZE = 1024 * 1024 * 50;
const gap = 100;

// 通过 Google Font 下载
const thaiFontUrl = '/fonts/NotoSansThai-Regular.ttf'; // Thai
const scFontUrl = '/fonts/NotoSansSC-Regular.ttf'; // Sample Chinese
const thaiFontBytes = await fetch(thaiFontUrl).then((res) => res.arrayBuffer());
const scFontBytes = await fetch(scFontUrl).then((res) => res.arrayBuffer());

// 类型定义
interface WatermarkConfig {
  text: string;
  fontSize: number;
  rotation: number;
  opacity: number;
  color: string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const defaultWatermarkConfig: WatermarkConfig = {
  text: `Inteluck`,
  fontSize: 16,
  rotation: -42,
  opacity: 15,
  color: '#000',
};

const PdfWatermarkGenerator: React.FC = () => {
  // 水印配置状态
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(
    defaultWatermarkConfig,
  );
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    message: '',
    type: 'info',
  });
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);
  const fakerSize = useSize(ref);
  console.log({ fakerSize });
  // 显示状态消息
  const showStatus = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
  ) => {
    setStatus({ message, type });
  };

  const validateSingleFileSize = (file: RcFile) => {
    if (file.size > LIMIT_SIZE) {
      const formatStr = formatBytes(LIMIT_SIZE);

      showStatus(`File size cannot exceed ${formatStr}`, 'error');
      return false;
    }
    return true;
  };

  const handleBeforeUpload = (file: RcFile) => {
    setFileList([]);
    const singleFileSizePassed = validateSingleFileSize(file);

    if (singleFileSizePassed) {
      setFileList([file]);
      return true;
    }

    return false;
  };

  const onFileRemove = () => {
    setFileList([]);
    return true;
  };

  // 处理输入变化
  const handleInputChange = (
    field: keyof WatermarkConfig,
    value: string | number,
  ) => {
    setWatermarkConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 十六进制转RGB
  const hexToRgb = (hex: string): RGBColor => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // 模拟进度
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  // 生成水印PDF
  const modifyPdf = async () => {
    try {
      if (fileList.length === 0) {
        showStatus('Please select a PDF file.', 'error');
        return;
      }
      if (!watermarkConfig.text) {
        showStatus('Please enter Watermark Text', 'error');
        return;
      }

      if (!fakerSize) {
        showStatus('Please wait for the page to load.', 'info');
        return;
      }

      setLoading(true);
      showStatus('Processing PDF document, please wait...', 'info');

      const progressInterval = simulateProgress();

      const { text, fontSize, rotation, opacity, color } = watermarkConfig;
      const lang = franc(text, { minLength: 1 });
      console.log('lang', lang);

      const rgbColor = hexToRgb(color);
      const opacityValue = opacity / 100;

      // 获取PDF文档
      const file = fileList[0];
      // @ts-ignore
      const url = URL.createObjectURL(file);
      // const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf';
      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer(),
      );

      // 加载PDF文档
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      pdfDoc.registerFontkit(fontkit);
      // 泰国字体
      const thaiFont = await pdfDoc.embedFont(thaiFontBytes);
      // 中文字体
      const scFont = await pdfDoc.embedFont(scFontBytes);
      // 其他字体
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let font = helveticaFont;
      switch (lang) {
        case 'tha':
          font = thaiFont;
          break;
        case 'cmn':
          font = scFont;
          break;
        default:
          font = helveticaFont;
          break;
      }

      // 获取所有页面
      const pages = pdfDoc.getPages();
      // 1. 将角度转换为弧度
      const rad = rotation * (Math.PI / 180);
      // 2. 计算正弦和余弦值
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);
      // 3. 应用公式计算新的宽高
      const watermarkWidth =
        Math.abs(fakerSize.width * cos) + Math.abs(fakerSize.height * sin);
      const watermarkHeight =
        Math.abs(fakerSize.width * sin) + Math.abs(fakerSize.height * cos);
      // 设置水印间距（类似 Antd 的 gap 参数）
      const gapX = watermarkWidth + gap; // 水平间距
      const gapY = watermarkHeight + gap; // 垂直间距
      console.log({
        watermarkWidth,
        watermarkHeight,
      });
      // 为每一页添加水印
      pages.forEach((page) => {
        const { width: paperWidth, height: paperHeight } = page.getSize();

        // 计算需要的水印数量（覆盖整个页面）
        const cols = Math.floor(paperWidth / gapX);
        const rows = Math.floor(paperHeight / gapY);

        console.log({
          paperWidth,
          paperHeight,
          cols,
          rows,
        });
        // 计算起始偏移（类似 Antd 的 offset 参数）
        const offsetX = gap / 2;
        const offsetY = gap / 2;

        // 创建交错排列的水印网格
        for (let row = 0; row <= rows; row++) {
          for (let col = 0; col <= cols; col++) {
            // 基础位置计算
            let x = col * gapX - offsetX;
            let y = paperHeight - (row * gapY - offsetY);

            // Antd Watermark 的交错算法：每两行进行一次偏移
            if (row % 2 === 1) {
              x += gapX / 2;
            }

            if (
              x > 0 &&
              x + watermarkWidth < paperWidth &&
              y > 0 &&
              y + watermarkHeight < paperHeight
            ) {
              page.drawText(text, {
                x,
                y,
                size: fontSize,
                font,
                // font: thaiFont,
                color: rgb(
                  rgbColor.r / 255,
                  rgbColor.g / 255,
                  rgbColor.b / 255,
                ),
                opacity: opacityValue,
                rotate: degrees(-rotation),
              });
            }
          }
        }
      });

      // 保存PDF
      const pdfBytes = await pdfDoc.save();

      clearInterval(progressInterval);
      setProgress(100);

      // 触发下载
      setTimeout(() => {
        downloadjs(pdfBytes, `watermarked_${file.name}`, 'application/pdf');
        setLoading(false);
        setProgress(0);
        showStatus(
          'The PDF document has been successfully generated and is now downloading!',
          'success',
        );
      }, 500);
    } catch (error) {
      setLoading(false);
      setProgress(0);
      console.error('Error modifying PDF:', error);
      showStatus(
        `Error occurred while processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    }
  };

  // 重置表单
  const resetForm = () => {
    setWatermarkConfig(defaultWatermarkConfig);
    showStatus('Settings have been reset to default values.', 'success');
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 左侧配置面板 */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>Watermark Settings</span>
              </Space>
            }
            extra={
              <Tooltip title="Reset all settings">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetForm}
                  size="small"
                >
                  Reset
                </Button>
              </Tooltip>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 水印文字 */}
              <div>
                <Text strong>Watermark Text</Text>
                <TextArea
                  value={watermarkConfig.text}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  placeholder="Please enter watermark text"
                  rows={3}
                  style={{ marginTop: 8 }}
                  maxLength={100}
                  allowClear
                  showCount
                />
              </div>

              {/* 字体大小 */}
              <div>
                <Text strong>Font Size: {watermarkConfig.fontSize}px</Text>
                <Slider
                  min={12}
                  max={72}
                  value={watermarkConfig.fontSize}
                  onChange={(value) => handleInputChange('fontSize', value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* 旋转角度 */}
              <div>
                <Text strong>Rotation Angle: {watermarkConfig.rotation}°</Text>
                <Slider
                  min={-90}
                  max={90}
                  value={watermarkConfig.rotation}
                  onChange={(value) => handleInputChange('rotation', value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* 不透明度 */}
              <div>
                <Text strong>Opacity: {watermarkConfig.opacity}%</Text>
                <Slider
                  min={10}
                  max={100}
                  value={watermarkConfig.opacity}
                  onChange={(value) => handleInputChange('opacity', value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* 颜色选择 */}
              <div>
                <Text strong>Watermark Color</Text>
                <div style={{ marginTop: 8 }}>
                  <ColorPicker
                    value={watermarkConfig.color}
                    onChange={(color) =>
                      handleInputChange('color', color.toHexString())
                    }
                    showText
                    size="middle"
                  />
                </div>
              </div>

              <Dragger
                accept=".pdf"
                multiple={false}
                beforeUpload={handleBeforeUpload}
                fileList={fileList}
                onRemove={onFileRemove}
                customRequest={() => {}} // 防止空请求产生，http://localhost:8000/tools/watermark
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag pdf file to this area to upload
                </p>
              </Dragger>

              {/* 操作按钮 */}
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={modifyPdf}
                disabled={!fileList.length}
                loading={loading}
                size="large"
                block
              >
                {loading ? 'Processing...' : 'Generate watermarked PDF'}
              </Button>

              {/* 进度条 */}
              {loading && (
                <Progress
                  percent={progress}
                  status={progress === 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              )}

              {/* 状态提示 */}
              {status.message && (
                <Alert
                  message={status.message}
                  type={status.type}
                  showIcon
                  closable
                  onClose={() => showStatus('', 'info')}
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* 右侧预览和功能 */}
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 水印预览 */}
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  <span>Sample Preview</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              <Watermark
                content={watermarkConfig.text?.split?.('\n')}
                font={{
                  color: Color(watermarkConfig.color)
                    .alpha(watermarkConfig.opacity / 100)
                    .rgb()
                    .string(),
                  fontSize: watermarkConfig.fontSize,
                  fontFamily: 'Arial, sans-serif',
                }}
                rotate={watermarkConfig.rotation}
                gap={[gap, gap]}
                offset={[gap / 2, gap / 2]}
              >
                <div
                  style={{
                    position: 'relative',
                    height: 650,
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    background: 'white',
                    overflow: 'hidden',
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#bfbfbf',
                    }}
                  >
                    <Text type="secondary">
                      Sample Preview Area - Actual results may vary after
                      download
                    </Text>
                  </div>
                </div>
              </Watermark>
              <pre
                ref={ref}
                style={{
                  display: 'inline-block',
                  margin: 0,
                  fontFamily: 'Arial, sans-serif',
                  fontSize: watermarkConfig.fontSize,
                  color: watermarkConfig?.color,
                  transform: `rotate(${watermarkConfig.rotation}deg)`,
                  opacity: 0,
                }}
              >
                {watermarkConfig?.text}
              </pre>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PdfWatermarkGenerator;
