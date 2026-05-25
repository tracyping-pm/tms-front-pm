import { ModalFormProps } from '@ant-design/pro-components';
import { Button, Modal, Skeleton, message } from 'antd';
import { useEffect, useMemo, useRef } from 'react';

import CustomTabs from '@/components/CustomTabs';
import { useSetState } from 'ahooks';
import { cloneDeep } from 'lodash';

import {
  getMaterialsImage,
  signatureFlagAdd,
  signatureFlagList,
  signatureFlagUpdate,
} from '@/api/tool';
import { PlusCircleOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { ISignature } from '../../interface';
import SignatureImageModal from './SignatureImageModal';
import SignatureList from './SignatureList';
import SignatureModal from './SignatureModal';
import styles from './common.less';

type IChooseSignatureModal = ModalFormProps & {
  open: boolean;
  active?: ISignature;
  signatureId?: number | string;
  signatureEmail: string;
  signingName: string;
  getSignatureUrl: (data: { url?: string; id?: string | number }) => void;
  hideModal: () => void;
};

interface IState {
  tabKey: 'Word' | 'Image' | string;
  signatureModalOpen: boolean;
  signatureImageModalOpen: boolean;
  confirmLoading: boolean;
  loading: boolean;
  signNowLoading: boolean;
  signatureList: any;
  wordList: any;
  imgList: any;
  signatureRecord: ISignature | undefined;
  targetSignature: Partial<ISignature> | undefined;
  activeSignature: Partial<ISignature> | undefined;
}
const initialState: IState = {
  tabKey: 'Word',
  signatureModalOpen: false,
  signatureImageModalOpen: false,
  confirmLoading: false,
  loading: false,
  signNowLoading: false,
  signatureList: [],
  wordList: [],
  imgList: [],
  signatureRecord: undefined,
  targetSignature: undefined,
  activeSignature: undefined,
};
const ChooseSignatureModal = ({
  title = 'Choose Signatures',
  signingName,
  open = false,
  signatureId,
  signatureEmail,
  active,
  getSignatureUrl,
  hideModal,
}: IChooseSignatureModal) => {
  const [state, setState] = useSetState<IState>(initialState);
  const signatureRef = useRef(null);

  const INIT_SIGNATURE_STYLE = {
    size: 24,
    font: 'Roboto',
    color: '#00000',
  };

  const fetchList = async (v = undefined) => {
    setState({ loading: true });
    const res = await signatureFlagList({ emailAES: signatureEmail });
    setState({ loading: false });

    if (res.code === 200) {
      let data = cloneDeep(res?.data || []);
      // 初始化默认生成签名
      if (data.length === 0) {
        if (signatureRef.current) {
          html2canvas(signatureRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          }).then(async (canvas) => {
            const url = canvas.toDataURL();

            const a = {
              type: 'Word',
              emailAES: signatureEmail,
              fileBaseStr: url,
              name: signingName,
              size: INIT_SIGNATURE_STYLE.size,
              font: INIT_SIGNATURE_STYLE.font,
              color: INIT_SIGNATURE_STYLE.color,
            };
            setState({ loading: true });
            const r = await signatureFlagAdd(a);
            setState({ loading: false });
            if (r?.code === 200) {
              //@ts-ignore
              fetchList(a);
            }
          });
        }
      }
      // 根据时间排序拿去最新编辑的签名并选中
      data.sort((a, b) => {
        const dateA = new Date(a.updatedAtStr);
        const dateB = new Date(b.updatedAtStr);
        //@ts-ignore
        return dateA - dateB;
      });

      const activeSignature = data?.find((i) => i.id === signatureId);

      let wordList: any = [];
      let imgList: any = [];
      data.forEach((item) => {
        if (item.type === 'Word') {
          wordList.push(item);
        } else {
          imgList.push(item);
        }
      });

      let activeSignatureData = active;
      let targetSignatureData;
      if (signatureId && !v) {
        activeSignatureData = activeSignature;
        targetSignatureData = activeSignature;
      }
      // 新增、编辑项目默认选中
      // if (v) {
      // activeSignatureData = data[data.length - 1];
      // targetSignatureData = data[data.length - 1];
      // }
      setState({
        signatureList: data,
        wordList: wordList,
        imgList: imgList,
        activeSignature: activeSignatureData,
        targetSignature: targetSignatureData,
        signatureRecord: undefined,
        signatureModalOpen: false,
      });
    }
  };

  const confirmNewSignatures = async (v: any) => {
    const payload = {
      id: v.id,
      type: state.tabKey,
      emailAES: signatureEmail,
      name: v.name,
      font: v.font,
      size: +v.size,
      color: v?.color,
      fileBaseStr: v.fileBaseStr,
    };
    let res;
    setState({ confirmLoading: true });
    if (v.id) {
      res = await signatureFlagUpdate(payload);
    } else {
      res = await signatureFlagAdd(payload);
    }
    setState({ confirmLoading: false });
    if (res?.code === 200) {
      fetchList(v);
    }
  };

  const tabItems = useMemo(() => {
    // if (!state.signatureList.length) return [];
    return [
      {
        key: 'Word',
        label: 'Typed',
        children: (
          <SignatureList
            source={state.wordList}
            signatureType={state.tabKey}
            activeSignature={state.activeSignature}
            refresh={fetchList}
            getEditData={(v) => {
              setState({
                signatureModalOpen: true,
                signatureRecord: v,
              });
            }}
            getTargetSignature={(v) => {
              setState({
                targetSignature: v,
                activeSignature: v,
              });
            }}
          />
        ),
      },
      {
        key: 'Image',
        label: 'Uploaded',
        children: (
          <SignatureList
            source={state.imgList}
            signatureType={state.tabKey}
            activeSignature={state.activeSignature}
            refresh={(v) => {
              fetchList(v);
            }}
            getEditData={(v) => {
              setState({
                signatureImageModalOpen: true,
                signatureRecord: v,
              });
            }}
            signatureEmail={signatureEmail}
            getTargetSignature={(v) => {
              setState({
                targetSignature: v,
                activeSignature: v,
              });
            }}
          />
        ),
      },
    ];
  }, [state.signatureList, state.tabKey]);

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <Modal
        className={styles.signatureModal}
        title={title}
        open={open}
        maskClosable={false}
        onCancel={hideModal}
        footer={
          <div className={styles.modalFooter}>
            {state.tabKey === 'Word' ? (
              <>
                {state.wordList?.length > 2 ? (
                  <p>Typed type signature style must not exceed 3</p>
                ) : (
                  <p
                    onClick={() => {
                      setState({
                        signatureModalOpen: true,
                      });
                    }}
                  >
                    <PlusCircleOutlined /> Create New Signature
                  </p>
                )}
              </>
            ) : (
              <>
                {state.imgList?.length > 2 ? (
                  <p>Uploaded type signature style must not exceed 3</p>
                ) : (
                  <p></p>
                )}
              </>
            )}

            <Button
              type="primary"
              loading={state.signNowLoading}
              onClick={async () => {
                if (!state.targetSignature) {
                  message.error('Please select signature style');
                  return;
                }
                setState({
                  signNowLoading: true,
                });
                const res = await getMaterialsImage({
                  //@ts-ignore
                  id: state?.targetSignature?.fileDriveId,
                });
                if (res.code === 200) {
                  setState({
                    signNowLoading: false,
                  });
                  getSignatureUrl?.({
                    url: `data:image/jpeg;base64,${res.data}`,
                    id: state.targetSignature?.id,
                  });
                  hideModal?.();
                }
              }}
            >
              Sign Now
            </Button>
          </div>
        }
      >
        <div className={styles.signatureTabs}>
          <Skeleton loading={state.loading} active>
            <CustomTabs
              defaultActiveKey={state.tabKey}
              // @ts-ignore
              items={tabItems}
              size="large"
              onChange={(key: 'Word' | 'Image' | string) => {
                setState({
                  tabKey: key,
                });
              }}
              tabBarExtraContent={false}
              useSticky
              offsetTop={0}
            />
          </Skeleton>
        </div>
      </Modal>

      {state.signatureList.length === 0 && (
        <div
          className={styles.signatureName}
          style={{ position: 'absolute', top: -1000000 }}
        >
          <div
            ref={signatureRef}
            className={styles.signatureText}
            style={{
              fontFamily: INIT_SIGNATURE_STYLE.font,
              fontSize: `${INIT_SIGNATURE_STYLE.size}px`,
              color: INIT_SIGNATURE_STYLE.color,
            }}
          >
            {signingName}
          </div>
        </div>
      )}
      {state.signatureModalOpen && (
        <SignatureModal
          open={state.signatureModalOpen}
          record={state.signatureRecord!}
          signingName={signingName!}
          getNewSignature={(v) => {
            confirmNewSignatures(v);
          }}
          modalProps={{
            onCancel: () => {
              setState({
                signatureRecord: undefined,
                signatureModalOpen: false,
              });
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: state.confirmLoading,
            },
          }}
        />
      )}

      {state.signatureImageModalOpen && (
        <SignatureImageModal
          open={state.signatureImageModalOpen}
          record={state.signatureRecord!}
          signatureEmail={signatureEmail!}
          refresh={() => {
            setState({
              signatureRecord: undefined,
              signatureImageModalOpen: false,
            });
            fetchList();
          }}
          onHandleCancel={() => {
            setState({
              signatureRecord: undefined,
              signatureImageModalOpen: false,
            });
          }}
          submitter={{
            submitButtonProps: {
              loading: state.confirmLoading,
            },
          }}
        />
      )}
    </>
  );
};

export default ChooseSignatureModal;
