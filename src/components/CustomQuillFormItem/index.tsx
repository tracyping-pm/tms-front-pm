import { ProFormItem, ProFormItemProps } from '@ant-design/pro-components';
import { FC } from 'react';
import RichTextEditor, { formatRichTextContent } from '../CustomQuill';

interface IProps {
  placeholder?: string;
  modules?: any;
  readonly?: boolean;
  addModules?: any[];
  minHeight?: number;
  maxHeight?: number;
}

const CustomQuillFormItem: FC<ProFormItemProps & IProps> = ({
  placeholder,
  modules = [
    { header: [1, 2, 3, 4, 5, 6, false] },
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    // 'blockquote',
    // 'code-block',
    { color: [] },
    // { background: [] },
    { list: 'ordered' },
    { list: 'bullet' },
    // { align: [] },
    { script: 'sub' },
    { script: 'super' },
    // { indent: '-1' },
    // { indent: '+1' },
    // 'clean',
    // 'emoji',
    // 'image',
    // 'undo',
    // 'redo',
    // 'fullscreen',
    // 'video',
    // 'audio',
  ],
  addModules = [],
  readonly = false,
  minHeight = 300,
  maxHeight = 500,
  ...props
}) => {
  return (
    <ProFormItem {...props}>
      <RichTextEditor
        placeholder={placeholder}
        modules={[...modules, ...addModules]}
        minHeight={minHeight}
        maxHeight={maxHeight}
        readonly={readonly}
      />
    </ProFormItem>
  );
};
export { formatRichTextContent };

export default CustomQuillFormItem;
