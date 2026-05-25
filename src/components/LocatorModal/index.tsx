import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { Overlay, useGoogleMap } from '@/hooks/useGoogleMap';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Form, Spin } from 'antd';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

const overlay = new Overlay();

export interface IMeta {
  level?: number;
  address: string;
  lat: number;
  lng: number;
}

type IProps = ModalFormProps & {
  open: boolean;
  payload?: IMeta;
  onConfirm: (p: IMeta) => void;
};

const LocatorModal = ({
  title = 'Address Locator',
  width = 680,
  open,
  payload,
  modalProps,
  onConfirm,
  ...restProps
}: IProps) => {
  const { map, initMap } = useGoogleMap({
    tiltRotationControl: false,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const formRef = useRef<ProFormInstance>();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement>();
  const submitLatLngRef = useRef<IMeta>();

  const initialValues = {
    mapAddress: '',
  };

  const reset = () => {
    if (markerRef.current?.map) {
      markerRef.current.map = null;
    }
    overlay?.clearOverlays?.();
  };

  const handleAddressSelect = (meta: IMeta) => {
    if (markerRef.current) {
      if (!_.isEmpty(meta)) {
        const { lat, lng } = meta;
        const latLng = new google.maps.LatLng(lat, lng);
        map?.setCenter(latLng);
        markerRef.current.map = map;
        markerRef.current.position = latLng;
        submitLatLngRef.current = meta;
      } else {
        markerRef.current.map = null;
      }
    }
  };

  const getGoogleMapAddress = useCallback(
    (latLngLiteral: google.maps.LatLngLiteral) => {
      map?.panTo(latLngLiteral);
      // 获取详细地址信息
      // geocode
      setLoading(true);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: latLngLiteral,
        },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus,
        ) => {
          setLoading(false);
          if (status === 'OK') {
            const frist = results?.[0];
            const { address_components, formatted_address, geometry } =
              frist ?? {};
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
            formRef.current?.setFieldsValue({
              mapAddress: formatted_address,
            });
            submitLatLngRef.current = {
              address: formatted_address,
              lat: location?.lat?.(),
              lng: location?.lng?.(),
              level,
            } as IMeta;
          }
        },
      );
    },
    [map],
  );

  const setMarkerByLatLng = (latLngLiteral: google.maps.LatLngLiteral) => {
    if (markerRef.current) {
      markerRef.current.map = map;
      markerRef.current.position = latLngLiteral;
    }
    getGoogleMapAddress(latLngLiteral);
  };

  const submit = async () => {
    await formRef.current?.validateFields();
    const { address, lat, lng, level } = submitLatLngRef.current ?? {};
    if (!lat || !lng) {
      formRef.current?.setFields([
        {
          name: 'mapAddress',
          // value: undefined,
          errors: ['Please enter the correct address'],
        },
      ]);
      // message.error('Please enter the correct address');
      return false;
    }
    const confirmPayload = {
      address: address!,
      lat: lat!,
      lng: lng!,
      level: level!,
    };

    onConfirm?.(confirmPayload);
  };

  useEffect(() => {
    if (map) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        gmpDraggable: true,
      });
      overlay?.addOverlay?.(markerRef.current);

      markerRef.current?.addListener(
        'dragend',
        (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          const latLngLiteral = {
            lat: latLng?.lat?.(),
            lng: latLng?.lng?.(),
          };
          getGoogleMapAddress(latLngLiteral as google.maps.LatLngLiteral);
        },
      );
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng;
        const latLngLiteral = {
          lat: latLng?.lat?.(),
          lng: latLng?.lng?.(),
        };
        setMarkerByLatLng(latLngLiteral as google.maps.LatLngLiteral);
      });
    }
  }, [map]);

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current);
    }
  }, [mapRef]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (open && payload && markerRef.current) {
      setLoading(true);
      if (map && mapRef && markerRef && formRef) {
        setLoading(false);
        submitLatLngRef.current = payload;
        formRef.current?.setFieldsValue({
          mapAddress: payload.address,
        });
        if (payload?.lat && payload?.lng) {
          const latLngLiteral = { lat: payload.lat, lng: payload.lng };
          map?.panTo(latLngLiteral);
          markerRef.current.map = map;
          markerRef.current.position = latLngLiteral;
        }
      }
    }
  }, [open, map, mapRef, markerRef, formRef, payload]);

  return (
    <>
      <ModalForm
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        loading={loading}
        initialValues={initialValues}
        modalProps={{
          ...modalProps,
          centered: true,
          okText: 'Confirm',
          forceRender: false,
          destroyOnClose: true,
          maskClosable: false,
          // zIndex: 9999,
        }}
        onFinish={submit}
        {...restProps}
      >
        <Spin spinning={loading}>
          <Form.Item
            name={'mapAddress'}
            label={'Address'}
            shouldUpdate
            style={{ width: '100%' }}
            rules={[
              {
                required: true,
                message: 'No address has been set yet',
              },
            ]}
            trigger="onChange"
          >
            <AutoCompleteSelectNew onSelect={handleAddressSelect} />
          </Form.Item>
          <div
            ref={mapRef}
            className="mapContainer"
            style={{ width: '100%', height: '260px' }}
          ></div>
        </Spin>
      </ModalForm>
    </>
  );
};

export default LocatorModal;
