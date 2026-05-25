import { useGoogleMap } from '@/hooks/useGoogleMap';
import { useReactive, useSetState } from 'ahooks';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { debounce } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import LocatorModal, { IMeta } from '../LocatorModal';
import styles from './index.less';

interface ILocator {
  open: boolean;
}

const initialLocatorState: ILocator = {
  open: false,
};

export type IAutoCompleteSelect = AutoCompleteProps & {
  maxLength?: number;
  value?: any;
  showResolve?: boolean;
  showReset?: boolean;
  showLocator?: boolean;
  defaultMeta?: IMeta;
  disabled?: boolean;
  onSelect?: (v: IMeta) => void;
  onChange?: (v: any) => void;
  onResolve?: (v: IMeta | undefined) => void;
  onReset?: () => void;
};

const AutoCompleteSelectNew: FC<IAutoCompleteSelect> = ({
  value,
  maxLength = 5,
  showResolve = false,
  showReset = false,
  showLocator = false,
  defaultMeta = undefined,
  disabled = false,
  onSelect,
  onChange,
  onResolve,
  onReset,
  ...restProps
}) => {
  const proxyState = useReactive({
    innerValue: '',
  });
  const { ready, region } = useGoogleMap();
  const [keyword, setKeyword] = useState<string>('');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [locatorState, setLocatorState] =
    useSetState<ILocator>(initialLocatorState);
  const [payload, setPayload] = useState<IMeta | undefined>();

  const handleChange = (v: any) => {
    proxyState.innerValue = v;
    onChange?.(v);
  };

  const handleSearch = (val: string) => {
    setKeyword(val);
  };

  const debouncedHandleSearch = useCallback(
    debounce((val: string) => handleSearch(val), 500),
    [],
  );

  const handleResolve = () => {
    onResolve?.(payload);
  };

  const onDropdownVisibleChange = useCallback(
    (open: boolean) => {
      if (open) {
        handleSearch(proxyState.innerValue);
      }
    },
    [proxyState.innerValue],
  );

  const handleSelect = (option: any) => {
    // 获取详细地址信息
    const service = new google.maps.places.Place({
      id: option.placeId,
      requestedRegion: region,
      // requestedLanguage: 'en',
    });

    service
      .fetchFields({ fields: ['addressComponents', 'location'] })
      .then((res: { place: google.maps.places.Place }) => {
        const { place } = res;
        const { addressComponents, location } = place;

        let level = 0;
        const length = addressComponents?.length ?? 0;
        if (length <= 2) {
          level = 1;
        } else if (length > 2 && length <= 4) {
          level = 2;
        } else {
          level = 3;
        }

        const payloadObj = {
          address: option.value,
          lat: location?.lat?.(),
          lng: location?.lng?.(),
          level,
        };
        setPayload(payloadObj as IMeta);
        onSelect?.(payloadObj as IMeta);
        handleChange?.(option.value);
      })
      .catch((err) => {
        console.error(err);
        // onSelect?.(option);
        // handleChange?.(option.value);
      });
  };

  const handleClear = () => {
    setPayload(undefined);
    onSelect?.({} as IMeta);
    handleChange?.('');
  };

  const buildOptions = (
    suggestions: google.maps.places.AutocompleteSuggestion[],
  ) => {
    return suggestions.map(
      (item: google.maps.places.AutocompleteSuggestion) => {
        const mainText = item?.placePrediction?.mainText?.text ?? '';
        // const secondaryText = item?.placePrediction?.secondaryText?.text ?? '';
        const text = item?.placePrediction?.text?.text ?? '';
        const placeId = item?.placePrediction?.placeId ?? '';

        // console.log({ mainText, secondaryText, text, placeId });
        return {
          // ...item,
          placeId,
          value: text,
          label: (
            <div className={styles.predictionItem}>
              <div className={styles.predictionItemMainText} title={mainText}>
                {mainText}
              </div>
              <div
                className={styles.predictionItemMainDescription}
                title={text}
              >
                {text}
              </div>
            </div>
          ),
        };
      },
    );
  };

  const handleLocator = () => {
    setLocatorState({ open: true });
  };

  const onLocatorConfirm = (meta: IMeta) => {
    setLocatorState({ open: false });
    proxyState.innerValue = meta.address;

    setPayload(meta);
    onSelect?.(meta);
    handleChange?.(meta.address);
  };

  useEffect(() => {
    if (ready) {
      setLoading(true);

      google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: keyword,
        region: region,
        // language: language,
      })
        .then((res) => {
          const { suggestions = [] } = res;
          const _suggestions = suggestions?.slice(0, maxLength);
          const _options = buildOptions(_suggestions);
          setOptions(_options);
        })
        .catch(() => {
          setOptions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [ready, keyword]);

  useEffect(() => {
    proxyState.innerValue = value;
  }, [value]);

  useEffect(() => {
    setPayload(defaultMeta);
  }, [defaultMeta]);

  return (
    <>
      <div className={styles.resolveInput}>
        <AutoComplete
          className="auto-complete-select"
          placeholder="Search address"
          allowClear
          showSearch
          backfill
          onSelect={(_: any, option: any) => handleSelect(option)}
          onClear={handleClear}
          filterOption={false}
          defaultValue={proxyState.innerValue}
          // searchValue={innerValue}
          value={proxyState.innerValue}
          options={options}
          onSearch={debouncedHandleSearch}
          onChange={handleChange}
          onDropdownVisibleChange={onDropdownVisibleChange}
          notFoundContent={
            <div style={{ color: '#838CA1', padding: '12px' }}>
              {loading ? 'Loading...' : 'Address not found'}
            </div>
          }
          style={{ width: '100%' }}
          listItemHeight={74}
          disabled={disabled}
          {...restProps}
        />
        {!disabled && (
          <div className={styles.btns}>
            {showLocator && (
              <span className="btnItem" onClick={handleLocator}>
                Address Locator
              </span>
            )}
            {showLocator && showResolve && <span className="divider" />}
            {showResolve && (
              <span className="btnItem" onClick={handleResolve}>
                Resolve
              </span>
            )}
            {showLocator && showReset && <span className="divider" />}
            {showReset && (
              <span className="btnItem" onClick={() => onReset?.()}>
                Reset
              </span>
            )}
          </div>
        )}
      </div>
      {locatorState.open && (
        <LocatorModal
          open={locatorState.open}
          modalProps={{
            onCancel: () => setLocatorState({ open: false }),
          }}
          onConfirm={onLocatorConfirm}
          payload={payload}
        />
      )}
    </>
  );
};

export default AutoCompleteSelectNew;
