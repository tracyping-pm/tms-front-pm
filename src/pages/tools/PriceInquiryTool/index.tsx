import PriceInquiryV1 from './priceInquiryV1';
import styles from './styles.less';

export default function PaymentApproval() {
  // const [tabKey, setTabKey] = useState<string>(PriceInquiryVersionEnum.V1);

  // const tabItems = useMemo(() => {
  //   return [
  //     true
  //       ? {
  //           key: PriceInquiryVersionEnum.V1,
  //           label: 'PriceInquiryTool V1',
  //           children: <PriceInquiryV1 />,
  //         }
  //       : null,
  //     true
  //       ? {
  //           key: PriceInquiryVersionEnum.V2,
  //           label: 'PriceInquiryTool V2',
  //           children: <PriceInquiryV2 />,
  //         }
  //       : null,
  //   ].filter(Boolean);
  // }, []);

  // useEffect(() => {
  //   if (tabItems.length) {
  //     setTabKey(tabItems?.[0]?.key as string);
  //   }
  // }, []);

  return (
    <div className={styles.content}>
      <PriceInquiryV1 />
      {/*tabs list*/}
      {/* <CustomTabs
        defaultActiveKey={tabKey}
        // tabBarGutter={60}
        // @ts-ignore
        items={tabItems}
        size="large"
        onChange={(key) => setTabKey(key as PriceInquiryVersionEnum)}
        // tabBarExtraContent={<TabBarExtraContent tabKey={tabKey} />}
        useSticky
        // offsetTop={LAYOUT_HEADER_HEIGHT + 82}
      /> */}
    </div>
  );
}
