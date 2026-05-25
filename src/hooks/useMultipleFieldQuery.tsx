import { fieldQueryHighlightByUAM } from '@/api-uam/common';
import { fieldQueryHighlight } from '@/api/common';
import {
  IDynamicFuzzyParams,
  IFieldQueryHighlightParams,
  IFieldQueryHighlightRes,
} from '@/api/types/common';
import { SearchOutlined, StopOutlined } from '@ant-design/icons';
import { styled } from '@umijs/max';
import { SelectProps, Spin, Tooltip } from 'antd';
import { cloneDeep, debounce, findIndex } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
// polyfill abort controller if needed
import 'yet-another-abortcontroller-polyfill';

const MIN_LEN = 2;

const enum NotFoundStatusEnum {
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

const LabelWrap = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
`;

const LabelExtra = styled.span`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Ellipsis = styled.span`
  display: inline-block;
  width: 156px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
`;

interface ILabel {
  content: string;
  additionalRemark?: React.ReactNode;
  disableTip?: string;
}

const Label: FC<ILabel> = ({ content, additionalRemark, disableTip }) => {
  return (
    <LabelWrap>
      <span dangerouslySetInnerHTML={{ __html: content }} />
      <LabelExtra>
        {additionalRemark && <Ellipsis>{additionalRemark}</Ellipsis>}
        {disableTip && (
          <Tooltip
            placement="topLeft"
            title={disableTip}
            align={{ offset: [-12, -6] }}
            color="#FAAD14"
            styles={{ body: { color: 'var(--character-title-85)' } }}
          >
            <span>
              <StopOutlined />
            </span>
          </Tooltip>
        )}
      </LabelExtra>
    </LabelWrap>
  );
};

let controller: AbortController | undefined;

interface Option extends IFieldQueryHighlightRes {
  label: React.ReactNode | string;
  value: number | undefined;
}

export type IFieldQueryParams = {
  isUAM?: boolean;
  startupLength?: number;
  debounceTime?: number;
} & Omit<IFieldQueryHighlightParams, 'value'>;

export const useMultipleFieldQuery = (params: IFieldQueryParams) => {
  const { debounceTime, isUAM = false } = params;
  const [notFoundStatus, setNotFoundStatus] = useState<NotFoundStatusEnum>(
    NotFoundStatusEnum.INIT,
  );
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<any[] | undefined>(undefined);

  const NotFoundContent = useCallback(() => {
    return notFoundStatus === NotFoundStatusEnum.INIT ? (
      <Span>{`Minimum length of ${MIN_LEN} characters to search`}</Span>
    ) : notFoundStatus === NotFoundStatusEnum.PENDING ? (
      <Spin size="small" />
    ) : (
      <Span>No results found</Span>
    );
  }, [notFoundStatus]);

  const optionRender = useCallback((oriOption: any) => {
    return (
      <Label
        content={oriOption.data.nameHighlight || oriOption.data.name}
        additionalRemark={oriOption.data.additionalRemark}
        disableTip={oriOption.data.disabledTip}
      />
    );
  }, []);

  const onSelect = useCallback(
    (option: { key: number; label: string; value: number }) => {
      const obj = {
        id: option.value,
        value: option.value,
        name: option.label,
        label: option.label,
      };
      const newList = value?.concat?.(obj);
      setValue(newList);
    },
    [value],
  );

  const onDeselect = useCallback(
    (option: { key: number; label: string; value: number }) => {
      const i = findIndex(value, (item) => item.value === option.value);
      value?.splice?.(i, 1);

      setValue(value);
    },
    [value],
  );

  const onClear = () => {
    setOptions([]);
    setValue(undefined);
  };

  const DEFAULT_FIELD_PROPS: SelectProps = {
    mode: 'multiple',
    // maxTagCount: 'responsive',
    showSearch: true,
    allowClear: true,
    defaultActiveFirstOption: false,
    notFoundContent: <NotFoundContent />,
    optionRender: optionRender,
    labelInValue: true,
    optionLabelProp: 'name',
    filterOption: false,
    getPopupContainer: (triggerNode) => triggerNode.parentElement,
    prefixCls: 'fuzzy-multiple-query',
    // value,
    onSelect: onSelect,
    onDeselect: onDeselect,
    onClear: onClear,
    suffixIcon: <SearchOutlined />,
  };

  const doQuery = async (payload: IFieldQueryHighlightParams) => {
    setNotFoundStatus(NotFoundStatusEnum.PENDING);
    setOptions([]);
    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    try {
      const apiMethod = isUAM ? fieldQueryHighlightByUAM : fieldQueryHighlight;
      const res = await apiMethod(payload, signal);

      if (res.code === 200) {
        const { data } = res;
        const list = data.map((item) => ({
          ...item,
          title: item.name,
          disabled: item.disabled,
          label: item.name,
          value: item.id,
        }));
        if (list.length <= 0) {
          setNotFoundStatus(NotFoundStatusEnum.EMPTY);
        }
        setOptions(cloneDeep(list));
      } else {
        setNotFoundStatus(NotFoundStatusEnum.INIT);
      }
    } catch (error) {
      console.log('fetch aborted');
    }
  };

  const onSearch = async (
    keywords: string,
    dynamicParams?: IDynamicFuzzyParams,
  ) => {
    // setOptions([]);
    const { startupLength = MIN_LEN, field, esDtoClass, type } = params;
    if (!keywords || keywords?.length < startupLength) {
      setNotFoundStatus(NotFoundStatusEnum.INIT);
      return;
    }

    const payload = {
      field,
      esDtoClass,
      value: keywords,
      type: type,
      projectId: params?.projectId ? params?.projectId : undefined,
      approved: params?.approved ? params?.approved : undefined,
      ...dynamicParams,
    };
    doQuery(payload);
  };

  const resetAll = useCallback(() => {
    if (controller) {
      controller?.abort?.();
    }
    setOptions([]);
    setNotFoundStatus(NotFoundStatusEnum.INIT);
    setValue(undefined);
  }, []);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  return {
    options,
    onSearch: debounceTime ? debounce(onSearch, debounceTime) : onSearch,
    defaultFieldProps: DEFAULT_FIELD_PROPS,
    value,
    setValue,
    resetAll,
  };
};
