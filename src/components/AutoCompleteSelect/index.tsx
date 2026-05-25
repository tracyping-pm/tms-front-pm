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

const AutoCompleteSelect: FC<IAutoCompleteSelect> = ({
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
    // 使用google.maps.places.PlaceDetailsRequest
    // 获取详细地址信息
    const service = new google.maps.places.PlacesService(
      document.createElement('div'),
    );
    service.getDetails(
      {
        placeId: option?.place_id,
        // fields: ['geometry', 'formatted_address'],
      },
      (
        res: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus,
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && res) {
          const { address_components, geometry } = res ?? {};
          const { location } = geometry ?? {};
          let level = 0;
          const length = address_components?.length ?? 0;
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
        } else {
          console.error('status: ', status);
          // onSelect?.(option);
          // handleChange?.(option.value);
        }
      },
    );
  };

  const handleClear = () => {
    setPayload(undefined);
    onSelect?.({} as IMeta);
    handleChange?.('');
  };

  const buildOptions = (predictions: any[]) => {
    return predictions.map(
      (item: google.maps.places.AutocompletePrediction) => {
        return {
          ...item,
          value: item.description,
          label: (
            <div className={styles.predictionItem}>
              <div
                className={styles.predictionItemMainText}
                title={item?.structured_formatting?.main_text}
              >
                {item?.structured_formatting?.main_text}
              </div>
              <div
                className={styles.predictionItemMainDescription}
                title={item?.description}
              >
                {item?.description}
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
      const service = new google.maps.places.AutocompleteService();
      service
        .getPlacePredictions({
          input: keyword,
          componentRestrictions: {
            country: region?.toLocaleLowerCase(),
            // country: 'CN',
            // administrativeArea: '四川省',
            // locality: '成都市',
            // sublocality: '双流区',
            // postalCode: '610000',
          },
          //   types: ['address'],
          region: region,
          // language: language,
        })
        .then((res: google.maps.places.AutocompleteResponse) => {
          const { predictions = [] } = res;
          const _predictions = predictions?.slice(0, maxLength);
          const _options = buildOptions(_predictions);
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
          onSearch={debounce(handleSearch, 200)}
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

export default AutoCompleteSelect;
