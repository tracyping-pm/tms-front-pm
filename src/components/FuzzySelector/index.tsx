import { fieldQueryHighlightByUAM } from '@/api-uam/common';
import { fieldQueryHighlight } from '@/api/common';
import { Select } from 'antd';
import cls from 'classnames';
import { debounce } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_CUSTOM_PROPS,
  DEFAULT_FIELD_PROPS,
  PICKED_FIELDS,
} from './constant';
import styles from './index.less';
import {
  ENUM_NOT_FOUND_STATUS,
  I_FUZZY_API_REQUEST,
  I_FUZZY_API_RESPONSE,
  I_FUZZY_SELECTOR,
  I_OPTION,
} from './types';
// polyfill abort controller if needed
import { formatString } from '@/utils/format';
import _ from 'lodash';
import 'yet-another-abortcontroller-polyfill';
import Label from './Label';
import NotFoundContent from './NotFoundContent';

let controller: AbortController | undefined;

const FuzzySelector: FC<I_FUZZY_SELECTOR> = ({
  customProps,
  fieldProps,
  request,
  value,
  onChange,
}) => {
  const _customProps = _.merge({}, DEFAULT_CUSTOM_PROPS, customProps);
  const _fieldProps = _.merge({}, DEFAULT_FIELD_PROPS, fieldProps);
  const { isUAM, debounceTime, startupLength, requestWithoutSpace } =
    _customProps;
  const { mode } = _fieldProps;
  const isMultiple = mode === 'multiple' || mode === 'tags';

  const [notFoundStatus, setNotFoundStatus] = useState<ENUM_NOT_FOUND_STATUS>(
    ENUM_NOT_FOUND_STATUS.INIT,
  );
  const [options, setOptions] = useState<I_OPTION[]>([]);

  const onSelect = (_value: any, option: I_OPTION) => {
    const pickedValue: I_FUZZY_API_RESPONSE = _.pick(option, PICKED_FIELDS);
    if (isMultiple) {
      const newValue = _.cloneDeep(value as I_FUZZY_API_RESPONSE[]) ?? [];
      newValue.push(pickedValue);
      onChange?.(newValue);
    } else {
      onChange?.(pickedValue);
    }
  };

  const onDeselect = (id: number) => {
    const newValue = _.filter(
      value as I_FUZZY_API_RESPONSE[],
      (v) => v.id !== id,
    );
    onChange?.(newValue);
  };

  const onClear = () => {
    onChange?.(undefined);
  };

  const doQuery = async (payload: I_FUZZY_API_REQUEST) => {
    setOptions([]);
    setNotFoundStatus(ENUM_NOT_FOUND_STATUS.PENDING);

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
        const list = data.map((item) => {
          const { name } = item;
          const labelContent = name.replace(
            new RegExp(payload.value, 'gi'),
            (match) => `<span style="color: red;">${match}</span>`,
          );

          return {
            ...item,
            title: item.name,
            disabled: item.disabled,
            label: (
              <div title={item.name} className="custom-option">
                <Label
                  content={labelContent}
                  additionalRemark={item.additionalRemark}
                  disableTip={item.disabledTip}
                  extraFields={item.extraFields}
                />
              </div>
            ),
            value: item.id,
          };
        });
        if (list.length <= 0) {
          setNotFoundStatus(ENUM_NOT_FOUND_STATUS.EMPTY);
        }
        // @ts-ignore
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

    const payload = {
      ...request,
      value: _keywords,
    };
    doQuery(payload);
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
      <div className={cls('fuzzy-selector', styles.fuzzySelectorContainer)}>
        <Select
          {..._fieldProps}
          labelRender={(props: any) => {
            if (isMultiple) {
              const id = props.value;
              const obj = (value as I_FUZZY_API_RESPONSE[])?.find?.(
                (v) => v.id === id,
              );
              return obj?.name;
            } else {
              return (value as I_FUZZY_API_RESPONSE)?.name;
            }
          }}
          value={
            isMultiple
              ? (value as I_FUZZY_API_RESPONSE[])?.map((v) => v.id)
              : (value as I_FUZZY_API_RESPONSE)?.id
          }
          notFoundContent={
            <NotFoundContent
              status={notFoundStatus}
              startupLength={startupLength!}
            />
          }
          options={options}
          onSelect={onSelect}
          onDeselect={onDeselect}
          onClear={onClear}
          onSearch={debounce(onSearch, debounceTime)}
        />
      </div>
    </>
  );
};

export default FuzzySelector;
