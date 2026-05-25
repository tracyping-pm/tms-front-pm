import { signatureFlagAdd, signatureFlagDelete } from '@/api/tool';
import { getBase64, getExts } from '@/components/CustomUpload/fileSupport';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { App, Checkbox, Dropdown, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import cls from 'classnames';
import { useEffect, useMemo } from 'react';
import styles from './common.less';

interface ISignatureList {
  signatureType: string;
  signatureEmail?: string;
  source: any;
  activeSignature: any;
  getEditData?: (data: any) => void;
  getTargetSignature?: (data: any) => void;
  refresh?: (data?: any) => void;
}

interface IState {
  loading: boolean;
  sourceData: any;
  targetSignature: any;
  sizeW: number;
  sizeH: number;
}

const SignatureList = ({
  signatureType,
  signatureEmail,
  source,
  activeSignature,
  getEditData,
  getTargetSignature,
  refresh,
}: ISignatureList) => {
  const { modal, message } = App.useApp();
  const initialState: IState = {
    loading: false,
    sourceData: source,
    targetSignature: activeSignature,
    sizeW: 220,
    sizeH: 165,
  };

  const [state, setState] = useSetState<IState>(initialState);

  const items = useMemo(() => {
    return [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
      },
    ];
  }, [signatureType]);

  const onClickHandle = (key: any, sourceItem: any) => {
    // const a = cloneDeep(state.sourceData);

    if (key === 'delete') {
      modal.confirm({
        title: 'Are you sure delete this signature style?',
        icon: <ExclamationCircleFilled />,
        content: 'Confirm to delete this signature style',
        okText: 'Yes',
        cancelText: 'No',
        onOk: async () => {
          const res = await signatureFlagDelete({ id: sourceItem.id });
          if (res.code === 200) {
            refresh?.();
          }
        },
        onCancel() {
          // do nothing
        },
      });
    }
    if (key === 'edit') {
      getEditData?.(sourceItem);
    }
  };

  const addSignatureHandle = async (url: any) => {
    const payload = {
      type: signatureType,
      emailAES: signatureEmail!,
      fileBaseStr: url,
    };
    setState({
      loading: true,
    });
    const res = await signatureFlagAdd(payload);
    setState({
      loading: false,
    });
    if (res.code === 200) {
      refresh?.(payload);
    }
  };

  const handleChange = (info: any) => {
    // console.log(info);
    getBase64(info).then((res) => {
      addSignatureHandle(res);
    });
    // if (info.file.status === 'uploading') {
    //   setState({
    //     loading: true,
    //   });

    //   return;
    // }
    // if (info.file.status === 'done') {
    //   getBase64(info.file.originFileObj).then((res) => {
    //     addSignatureHandle(res);
    //   });
    // }
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

  const targetSignatureHandle = (bol: boolean, data: any) => {
    const o = bol && data.id === state.targetSignature.id ? undefined : data;
    setState({
      targetSignature: o,
    });

    getTargetSignature?.(o);
  };

  useEffect(() => {
    setState({
      sourceData: source,
      targetSignature: activeSignature,
    });
  }, [source]);

  return (
    <>
      <div className={styles.signatureList}>
        {state.sourceData.map((item: any) => {
          return (
            <div
              key={item.id}
              className={cls(
                styles.signatureItem,
                item.id === state.targetSignature?.id &&
                  styles.signatureItemActive,
              )}
              onClick={() => {
                targetSignatureHandle(!!state.targetSignature, item);
              }}
            >
              <div className={styles.signatureTool}>
                <Checkbox
                  checked={item.id === state.targetSignature?.id}
                  onChange={() => {
                    targetSignatureHandle(!!state.targetSignature, item);
                  }}
                />
                <Dropdown
                  menu={{
                    items,
                    onClick: ({ key, domEvent }) => {
                      domEvent.stopPropagation();
                      onClickHandle(key, item);
                    },
                  }}
                >
                  <MoreOutlined />
                </Dropdown>
              </div>
              <div className={styles.signatureFont}>
                {!item?.fileThumbnailUrl?.includes?.('data') &&
                !item?.fileThumbnailUrl?.includes?.('https') ? (
                  item.fileThumbnailUrl
                ) : (
                  <img
                    style={{
                      maxWidth: 252,
                      maxHeight: 100,
                      objectFit: 'contain',
                    }}
                    src={item.fileThumbnailUrl}
                    alt=""
                  />
                )}
              </div>
            </div>
          );
        })}

        {signatureType === 'Image' && state.sourceData.length < 3 && (
          <div className={styles.uploadImgCrop}>
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
                <button style={{ border: 0, background: 'none' }} type="button">
                  {state.loading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Create Signature</div>
                </button>
              </Upload>
            </ImgCrop>
            <div className={styles.uploadDes}>
              Maximum file size: 500KB Acceptable file formats: png, jpg, jpeg
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SignatureList;
