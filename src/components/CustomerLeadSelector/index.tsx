import { customerLeadSelector } from '@/api/opportunity';
import { ICustomerLeadSelectorRecord } from '@/api/types/opportunity';
import { formatString } from '@/utils/format';
import { SearchOutlined } from '@ant-design/icons';
import { styled } from '@umijs/max';
import { Select, SelectProps, Spin } from 'antd';
import cls from 'classnames';
import { debounce } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const MIN_LEN = 2;

interface Option extends ICustomerLeadSelectorRecord {
  label: React.ReactNode | string;
  value: number | undefined;
}

const enum ENUM_NOT_FOUND_STATUS {
  INIT = 'init',
  PENDING = 'pending',
  EMPTY = 'empty',
}

const Span = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

export interface ICustomerLeadSelector extends SelectProps {
  startupLength?: number;
  debounceTime?: number;
  requestWithoutSpace?: boolean;
  value?: ICustomerLeadSelectorRecord;
  onChange?: (v?: ICustomerLeadSelectorRecord) => void;
}

let controller: AbortController | undefined;

const CustomerLeadSelector: FC<ICustomerLeadSelector> = ({
  startupLength = MIN_LEN,
  debounceTime = 500,
  requestWithoutSpace = true,
  value,
  onChange,
  ...resProps
}) => {
  const [notFoundStatus, setNotFoundStatus] = useState<ENUM_NOT_FOUND_STATUS>(
    ENUM_NOT_FOUND_STATUS.INIT,
  );
  const [options, setOptions] = useState<Option[]>([]);

  const NotFoundContent = useCallback(() => {
    return notFoundStatus === ENUM_NOT_FOUND_STATUS.INIT ? (
      <Span>{`Minimum length of ${startupLength} characters to search`}</Span>
    ) : notFoundStatus === ENUM_NOT_FOUND_STATUS.PENDING ? (
      <Spin size="small" />
    ) : (
      <Span>No results found</Span>
    );
  }, [notFoundStatus]);

  const onSelect = (_: any, option: Option) => {
    const { id, bu, isCustomer, name, leadStatus, customerStatus } = option;
    const changeValue = {
      id,
      bu,
      isCustomer,
      name,
      leadStatus,
      customerStatus,
    };
    onChange?.(changeValue);
  };

  const onClear = () => {
    onChange?.(undefined);
  };

  const doQuery = async (keywords: string) => {
    setOptions([]);
    setNotFoundStatus(ENUM_NOT_FOUND_STATUS.PENDING);

    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    try {
      const res = await customerLeadSelector(
        encodeURIComponent(keywords),
        signal,
      );
      if (res.code === 200) {
        const { data } = res;
        const list = data.map((item) => {
          const { name, id, isCustomer, customerStatus, leadStatus } = item;
          const label = name.replace(
            new RegExp(keywords, 'gi'),
            (match) => `<span style="color: red;">${match}</span>`,
          );

          return {
            ...item,
            title: name,
            label: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  className="ellipsis"
                  dangerouslySetInnerHTML={{ __html: label }}
                />
                <span>{isCustomer ? customerStatus : leadStatus}</span>
              </div>
            ),
            value: id,
          };
        });
        if (list.length <= 0) {
          setNotFoundStatus(ENUM_NOT_FOUND_STATUS.EMPTY);
        }
        setOptions([...list]);
      } else {
        setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
      }
    } catch (error) {
      console.log('fetch aborted');
    }
  };

  const onSearch = async (keywords: string) => {
    let _keywords = keywords;
    if (requestWithoutSpace) {
      _keywords = formatString(keywords);
    }
    if (!_keywords || _keywords?.length < startupLength!) {
      setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
      return;
    }
    doQuery(_keywords);
  };

  const resetAll = useCallback(() => {
    if (controller) {
      controller?.abort?.();
    }
    setOptions([]);
    setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
  }, []);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  return (
    <>
      <div
        className={cls('customer-lead-selector', styles.customerLeadSelector)}
      >
        <Select
          {...resProps}
          showSearch
          allowClear
          labelRender={() => value?.name}
          value={value?.id}
          optionLabelProp={'name'}
          filterOption={false}
          defaultActiveFirstOption={false}
          getPopupContainer={(triggerNode) => triggerNode.parentElement}
          prefixCls={'fuzzy-query'}
          suffixIcon={<SearchOutlined />}
          notFoundContent={<NotFoundContent />}
          options={options}
          onSelect={onSelect}
          onClear={onClear}
          onSearch={debounce(onSearch, debounceTime)}
        />
      </div>
    </>
  );
};

export default CustomerLeadSelector;
