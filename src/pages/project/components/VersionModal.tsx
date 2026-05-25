import {
  addRouteBillingVersion,
  changeRouteBillingVersion,
} from '@/api/project';
import {
  IAddRouteBillingVersion,
  IRouteVersionListItem,
} from '@/api/types/project';
import { CountryCurrencyEnumText } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { App } from 'antd';
import dayjs from 'dayjs';
import { useRef } from 'react';

type ICustomerModal = ModalFormProps & {
  versionList: IRouteVersionListItem[];
  editIndex: number | null;
  formDefaultValue?: any;
  hideModal: () => void;
  refresh: () => void;
};

const VersionModal = ({
  width = 680,
  refresh,
  versionList,
  editIndex,
  hideModal,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { modal, message } = App.useApp();
  const { id: libraryId } = useParams();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: IAddRouteBillingVersion) => {
    let payload, res;
    if (editIndex === null) {
      payload = {
        routeLibraryId: Number(libraryId),
        quotationCustomerStart: params?.quotationToCustomer?.[0] || '',
        quotationCustomerEnd: params?.quotationToCustomer?.[1] || '',
        quotationVendorStart: params?.quotationFromVendor?.[0] || '',
        quotationVendorEnd: params?.quotationFromVendor?.[1] || '',
        fuelBasis: params?.fuelBasis || 0,
      };
      res = await addRouteBillingVersion(payload);
    } else {
      if (
        editIndex < versionList.length - 1 &&
        (versionList[editIndex]?.quotationCustomerEnd !==
          params?.quotationToCustomer?.[1] ||
          versionList[editIndex]?.quotationVendorEnd !==
            params?.quotationFromVendor?.[1])
      ) {
        modal.confirm({
          title: 'Edit Confirm',
          content: `Confirm the revision of the validity period of the Version and extend the relevant validity period of the subsequent Version`,
          okText: 'Confirm',
          okButtonProps: {
            style: { outline: 'none' },
          },
          onOk: async () => {
            payload = {
              id: Number(versionList[editIndex].id),
              quotationCustomerStart: params?.quotationToCustomer?.[0] || '',
              quotationCustomerEnd: params?.quotationToCustomer?.[1] || '',
              quotationVendorStart: params?.quotationFromVendor?.[0] || '',
              quotationVendorEnd: params?.quotationFromVendor?.[1] || '',
              fuelBasis: params?.fuelBasis || 0,
            };
            res = await changeRouteBillingVersion(payload);
            if (res.code === 200) {
              refresh();
              hideModal();
              message.success(
                `${editIndex === null ? 'Add' : 'Edit'} successfully!`,
              );
            }
          },
        });
      } else {
        payload = {
          id: Number(versionList[editIndex].id),
          quotationCustomerStart: params?.quotationToCustomer?.[0] || '',
          quotationCustomerEnd: params?.quotationToCustomer?.[1] || '',
          quotationVendorStart: params?.quotationFromVendor?.[0] || '',
          quotationVendorEnd: params?.quotationFromVendor?.[1] || '',
          fuelBasis: params?.fuelBasis || 0,
        };
        res = await changeRouteBillingVersion(payload);
      }
    }
    if (res?.code === 200) {
      refresh();
      hideModal();
      message.success(`${editIndex === null ? 'Add' : 'Edit'} successfully!`);
    }
  };

  return (
    <>
      <ModalForm
        name="version-modal"
        open={true}
        title={`${editIndex === null ? 'Add' : 'Edit'} Version`}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        initialValues={{
          quotationToCustomer:
            editIndex === null
              ? [
                  versionList.length
                    ? dayjs(
                        versionList[versionList.length - 1]
                          .quotationCustomerEnd,
                      )
                        .add(1, 'day')
                        .format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD'),
                  versionList.length
                    ? dayjs(
                        versionList[versionList.length - 1]
                          .quotationCustomerEnd,
                      )
                        .add(31, 'day')
                        .format('YYYY-MM-DD')
                    : dayjs().add(30, 'day').format('YYYY-MM-DD'),
                ]
              : [
                  dayjs(versionList[editIndex].quotationCustomerStart),
                  dayjs(versionList[editIndex].quotationCustomerEnd),
                ],
          quotationFromVendor:
            editIndex === null
              ? [
                  versionList.length
                    ? dayjs(
                        versionList[versionList.length - 1].quotationVendorEnd,
                      )
                        .add(1, 'day')
                        .format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD'),
                  versionList.length
                    ? dayjs(
                        versionList[versionList.length - 1].quotationVendorEnd,
                      )
                        .add(31, 'day')
                        .format('YYYY-MM-DD')
                    : dayjs().add(30, 'day').format('YYYY-MM-DD'),
                ]
              : [
                  dayjs(versionList[editIndex].quotationVendorStart),
                  dayjs(versionList[editIndex].quotationVendorEnd),
                ],
          fuelBasis:
            editIndex === null
              ? versionList[versionList.length - 1]?.fuelBasis
              : versionList[editIndex].fuelBasis,
        }}
        onFinish={submit}
        {...restProps}
      >
        <ProFormDateRangePicker
          name="quotationToCustomer"
          label="Quotation to Customer"
          placeholder={['Quotation', 'Customer']}
          fieldProps={{
            disabled: [
              editIndex === null ? !!versionList.length : !!editIndex,
              false,
            ],
            style: { fontSize: '14px', width: '100%' },
          }}
          rules={[
            {
              required: true,
              message: 'Please enter quotation to customer',
            },
          ]}
        />
        <ProFormDateRangePicker
          name="quotationFromVendor"
          label="Quotation From Vendor"
          placeholder={['Quotation', 'Vendor']}
          fieldProps={{
            disabled: [
              editIndex === null ? !!versionList.length : !!editIndex,
              false,
            ],
            style: { fontSize: '14px', width: '100%' },
          }}
          rules={[
            {
              required: true,
              message: 'Please enter quotation from vendor',
            },
          ]}
        />
        <ProFormDigit
          name="fuelBasis"
          label="Fuel Basis"
          placeholder="Fuel Basis"
          fieldProps={{
            style: { fontSize: '14px', width: '100%' },
            controls: false,
            suffix: CountryCurrencyEnumText[countryId as any],
            min: 0,
            max: 99999999.99,
            formatter: (value) => {
              return `${value}`
                .replace(/\B(?=(\d{3})+(?!\d))/g, '')
                .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
            },
          }}
        />
      </ModalForm>
    </>
  );
};

export default VersionModal;
