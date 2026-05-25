import { getBase64, getExts } from '@/components/CustomUpload/fileSupport';
import { ModalFormProps } from '@ant-design/pro-components';
import { Image, Modal, Upload, message } from 'antd';

import { useCallback } from 'react';

import { signatureFlagUpdate } from '@/api/tool';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import ImgCrop from 'antd-img-crop';
import { ISignature } from '../../interface';
import styles from './common.less';
type ISignatureModal = ModalFormProps & {
  open: boolean;
  record: ISignature;
  signatureEmail: string;
  refresh: () => void;
  onHandleCancel: () => void;
};
interface IState {
  loading: boolean;
  url: string;
  targetSignature: any;
  sizeW: number;
  sizeH: number;
}
const SignatureImageModal = ({
  title = 'Edit Signature',
  open = false,
  signatureEmail,
  record,

  refresh,
  onHandleCancel,
  ...restProps
}: ISignatureModal) => {
  const initialState: IState = {
    loading: false,
    url: '',
    targetSignature: record,
    sizeW: 220,
    sizeH: 165,
  };

  const [state, setState] = useSetState<IState>(initialState);

  const addSignatureHandle = async () => {
    const payload = {
      id: +record.id!,
      type: 'Image',
      emailAES: signatureEmail!,
      fileBaseStr: state.url,
    };
    setState({
      loading: true,
    });
    const res = await signatureFlagUpdate(payload);
    setState({
      loading: false,
    });
    if (res.code === 200) {
      refresh?.();
    }
  };
  const handleChange = (info: any) => {
    getBase64(info).then((res) => {
      setState({ url: res });
    });
  };
  const beforeUploadHandle = (file: File) => {
    const legalExts = ['.jpg', '.jpeg', '.png'];

    const ext = getExts(file);
    const isLegalExts = legalExts.includes(ext);
    if (!isLegalExts) {
      message.error('File format is not supported');
    }

    return isLegalExts;
  };
  const handleOk = useCallback(() => {
    addSignatureHandle();
  }, [state.url]);

  return (
    <>
      <Modal
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        okButtonProps={{
          loading: state.loading,
          disabled: !state.url,
          onClick: () => handleOk?.(),
        }}
        okText="Update Signature"
        onCancel={onHandleCancel}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        {...restProps}
      >
        <div className={styles.uploadImgCrop}>
          {
            <ImgCrop
              rotationSlider
              modalTitle="Edit image"
              modalWidth={744}
              aspect={4 / 3}
              minZoom={0.2}
              maxZoom={5}
              beforeCrop={beforeUploadHandle}
              //@ts-ignore
              cropperProps={{
                restrictPosition: false,
                cropSize: { width: state.sizeW, height: state.sizeH },
                onMediaLoaded: (v) => {
                  console.log(
                    0,
                    v,
                    document.querySelector('.reactEasyCrop_Contain'),
                  );
                },
              }}
            >
              <Upload
                listType="picture-card"
                showUploadList={false}
                customRequest={(v) => {
                  handleChange(v.file);
                }}
                accept="png, jpg, jpeg"
                beforeUpload={beforeUploadHandle}
              >
                {!state.url ? (
                  <button
                    style={{ border: 0, background: 'none' }}
                    type="button"
                  >
                    {state.loading ? <LoadingOutlined /> : <PlusOutlined />}
                    {/* <div style={{ marginTop: 8 }}>Creat Signature</div> */}
                  </button>
                ) : (
                  <Image src={state.url} preview={false}></Image>
                )}
              </Upload>
            </ImgCrop>
          }
          <div className={styles.uploadDes}>
            Maximum file size: 500KB Acceptable file formats: png, jpg, jpeg
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SignatureImageModal;
