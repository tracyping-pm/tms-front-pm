import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Spin, message } from 'antd';

import { useEffect, useRef, useState } from 'react';

import {
  getProjectPodConfiguration,
  saveProjectPodConfiguration,
} from '@/api/project';
import {
  IPodConfigurationItem,
  IPriveVendorListItemV,
} from '@/api/types/project';
import { waybillListPodNumberType } from '@/api/waybill';
import { PodConfigurationCopyEnum, TransmittalTypeEnum } from '@/enums';
import dayjs from 'dayjs';
import PodConfigurationRequirement, {
  ICheckedObj,
  IPodConfigurationRequirementRef,
} from './components/PodConfigurationRequirement';

type IPodConfigurationModal = ModalFormProps & {
  projectId: number;
  onConfirm: () => void;
};

const minInit = [
  {
    id: `id${dayjs().valueOf()}`,
    podNumberTypeId: undefined,
    copyType: PodConfigurationCopyEnum.HARD_COPY,
  },
];

const PodConfigurationModal = ({
  projectId,
  onConfirm,
  modalProps,
  ...restProps
}: IPodConfigurationModal) => {
  const formRef = useRef<ProFormInstance>();
  const customerRef = useRef<IPodConfigurationRequirementRef>(null);
  const inteluckRef = useRef<IPodConfigurationRequirementRef>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const [checkedList, setCheckedList] = useState<(string | number)[]>([]);
  const [customerInitData, setCustomerInitData] = useState<
    IPodConfigurationItem[]
  >([]);
  const [inteluckInitData, setInteluckInitData] = useState<
    IPodConfigurationItem[]
  >([]);
  const [initSkippable, setInitSkippable] = useState(false);
  const [configNumber, setConfigNumber] = useState(0);
  const [podNumberTypeCheckedObj, setPodNumberTypeCheckedObj] = useState({});
  const [options, setOptions] = useState<IPriveVendorListItemV[]>([]);

  const formatPostParams = async () => {
    const customerData = await customerRef?.current?.submit();
    const resultList: IPodConfigurationItem[] = [];
    // @ts-ignore
    customerData.forEach((item: IPodConfigurationItem) => {
      if (item.podNumberTypeId) {
        resultList.push({
          requirementType: TransmittalTypeEnum.CUSTOMER,
          podNumberTypeId:
            typeof item.podNumberTypeId === 'number'
              ? item.podNumberTypeId
              : undefined,
          customizedTypeName:
            typeof item.podNumberTypeId !== 'number'
              ? item.podNumberTypeId
              : undefined,
          copyType: item.copyType,
        });
      }
    });
    const inteluckData = await inteluckRef?.current?.submit();
    // @ts-ignore
    inteluckData.forEach((item: IPodConfigurationItem) => {
      if (item.podNumberTypeId) {
        resultList.push({
          requirementType: TransmittalTypeEnum.INTELUCK,
          podNumberTypeId:
            typeof item.podNumberTypeId === 'number'
              ? item.podNumberTypeId
              : undefined,
          customizedTypeName:
            typeof item.podNumberTypeId !== 'number'
              ? item.podNumberTypeId
              : undefined,
          copyType: item.copyType,
          skippable: inteluckRef?.current?.skippable,
        });
      }
    });
    return resultList;
  };

  const submit = async () => {
    const list = await formatPostParams();
    setConfirmLoading(true);
    const res = await saveProjectPodConfiguration({
      projectId: Number(projectId),
      list,
    }).finally(() => {
      setConfirmLoading(false);
    });

    if (res.code === 200) {
      message.success('POD Configuration of Project successfully.');
      onConfirm?.();
    }
  };

  const getPodConfigurationList = async () => {
    setLoading(true);
    const res = await getProjectPodConfiguration({ id: projectId });
    setLoading(false);
    if (res.code === 200) {
      setInitSkippable(res.data?.skippable);
      const checkedObj: ICheckedObj = {};
      let customerInitList: IPodConfigurationItem[] = minInit;
      let inteluckInitList: IPodConfigurationItem[] = minInit;
      if (res.data?.customer) {
        customerInitList = res.data?.customer.map((item, index) => {
          const id = `cid${dayjs().valueOf()}` + index;
          const podNumberTypeId =
            item.podNumberTypeId || item.customizedTypeName;
          checkedObj[`podNumberTypeId${id}`] = podNumberTypeId;
          return {
            ...item,
            id,
            podNumberTypeId,
          };
        });
      }
      if (res.data?.inteluck) {
        inteluckInitList = res.data?.inteluck.map((item, index) => {
          const id = `iid${dayjs().valueOf()}` + index;
          const podNumberTypeId =
            item.podNumberTypeId || item.customizedTypeName;
          checkedObj[`podNumberTypeId${id}`] = podNumberTypeId;
          return {
            ...item,
            id,
            podNumberTypeId,
          };
        });
      }
      setPodNumberTypeCheckedObj(checkedObj);
      setCustomerInitData(customerInitList);
      setInteluckInitData(inteluckInitList);
    }
  };

  const getPodConfiguration = async () => {
    setLoading(true);
    const res = await waybillListPodNumberType();
    setLoading(false);
    if (res.code === 200) {
      const idList: number[] = [];
      const list = (res.data || []).map((item) => {
        idList.push(item.id);
        return {
          label: item.name,
          value: item.id,
        };
      });
      setOptions(list);
    }
  };

  useEffect(() => {
    getPodConfigurationList();
    getPodConfiguration();
  }, []);

  const initBaseData = () => {
    const checkedOptions: (string | number)[] = [];
    customerInitData.forEach((item) => {
      checkedOptions.push(item.podNumberTypeId!);
    });
    inteluckInitData.forEach((item) => {
      checkedOptions.push(item.podNumberTypeId!);
    });
    setCheckedList([...checkedOptions]);
    setConfigNumber(customerInitData.length + inteluckInitData.length);
  };

  useEffect(() => {
    initBaseData();
  }, [options, customerInitData, inteluckInitData]);

  return (
    <>
      <ModalForm
        name="Pod-Configuration"
        open={true}
        title={`POD Configuration of Project`}
        width={690}
        style={{
          height: configNumber > 10 ? 560 : 'auto',
          overflowY: configNumber > 10 ? 'scroll' : 'hidden',
        }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
        {...restProps}
      >
        <Spin spinning={loading}>
          <PodConfigurationRequirement
            ref={customerRef}
            initData={customerInitData}
            requireType={TransmittalTypeEnum.CUSTOMER}
            configNumber={configNumber}
            podNumberTypeCheckedObj={podNumberTypeCheckedObj}
            setPodNumberTypeCheckedObj={setPodNumberTypeCheckedObj}
            setConfigNumber={setConfigNumber}
            checkedList={checkedList}
            setCheckedList={setCheckedList}
            optionList={options}
          />
          <div style={{ marginTop: 16 }}>
            <PodConfigurationRequirement
              ref={inteluckRef}
              initData={inteluckInitData}
              initSkippable={initSkippable}
              requireType={TransmittalTypeEnum.INTELUCK}
              configNumber={configNumber}
              podNumberTypeCheckedObj={podNumberTypeCheckedObj}
              setPodNumberTypeCheckedObj={setPodNumberTypeCheckedObj}
              setConfigNumber={setConfigNumber}
              checkedList={checkedList}
              setCheckedList={setCheckedList}
              optionList={options}
            />
          </div>
        </Spin>
      </ModalForm>
    </>
  );
};

export default PodConfigurationModal;
