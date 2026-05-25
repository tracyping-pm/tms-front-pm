import BookingSummary from './components/BookingSummary';
import BookingTrends from './components/BookingTrends';
import BookingWaybill from './components/BookingWaybill';

export default function BooKingDashboard() {
  return (
    <div className="booKingDashboard">
      {/* <div
        style={{
          backgroundColor: '#EEF6F4',
          padding: '8px 12px',
          marginTop: '-16px',
        }}
      >
        <InfoCircleFilled style={{ color: '#009688', marginRight: 8 }} />
        {`Data Description: "Committed" refers to waybills successfully created with a position time within the selected range;
 "Delivered" refers to all waybills whose status has been updated to "Delivered" or "Abnormal" with a position time within the selected range.`}
      </div> */}

      <BookingSummary />
      <BookingWaybill />
      <BookingTrends />
    </div>
  );
}
