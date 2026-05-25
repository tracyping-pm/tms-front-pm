import { QuestionCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { useState } from 'react';
import styles from './styles.less';

interface ICustomLabel {
  LabelName: string;
  isShowIcon?: boolean;
}
export default function CustomLabel({
  LabelName,
  isShowIcon = false,
}: ICustomLabel) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const expositoryCase: Record<string, string[]> = {
    BindingProject: [
      "When creating a Route Library in our TMS system, it is essential to bind it to a specific project. This binding ensures that the routes and pricing defined in the Route Library are readily accessible for dispatching and managing transport orders within that project. Here's how it works:",
      `<span><i></i>If Created Within a Project</span>: When you create a Route Library within a project, it will automatically be bound to that project. This means all routes and pricing information in the Library will be exclusively available for use in transport orders associated with this project.`,
      `<span><i></i>If Created Independently</span>: In cases where the Route Library is created independently, without being initially tied to any project, you will need to manually select a project to bind it to. Once bound, the routes and pricing in the Library can be utilized for transport orders within the selected project.`,
      'Remember, binding a Route Library to a project is a key step in ensuring that your transport scheduling and pricing are efficiently managed and aligned with project-specific requirements.',
    ],
    PricingMode: [
      '1.Route Pricing (By Route)',
      '<span><i></i>Explanation</span>: This pricing mode sets a uniform charge for a specific route based on the origin point (where the journey starts), the destination point (where the journey ends), and the type of truck assigned for the transport. Once set, the price remains constant regardless of other factors like the time taken for the journey or any detours.',
      '<span><i></i>Example</span>: If a route from City A (origin point) to City B (destination point) using a standard truck is typically charged at $500, this amount will remain the same for every trip made on this route with a similar truck, irrespective of the actual distance or time taken.',
      '2.Mileage Pricing (By Distance)',
      '<span><i></i>Explanation</span>: In this mode, the cost is calculated based on the actual distance traveled from the origin point to the destination point, considering the type of truck used. The final charge is dynamic and changes according to the total miles covered during the transport.',
      '<span><i></i>Example</span>: If the rate is $2 per mile and a trip from City C (origin point) to City D (destination point) covers 300 miles using a standard truck, the total charge for this trip would be $600. This amount will vary if the distance traveled changes in future trips.',
    ],
    MultipleRoute: [
      'In scenarios where a transport involves multiple loading and unloading points, meaning several origin or destination points, our system offers three distinct methods to calculate the price based on preset routes in the Route Library. These methods are:',
      '1.<span>Highest Rate (P2P)</span>: This method calculates the price based on the highest customer rate among all the routes hit. It is ideal when prioritizing revenue, as it ensures billing at the maximum rate among the selected routes.',
      "2.<span>Farthest Location (P2P)</span>: This approach bases the price on the route with the farthest transport distance. It's suitable when distance is a significant factor in cost calculation, ensuring that the longest route dictates the pricing.",
      "3.<span>Route Distance (All Points)</span>: This method calculates the price based on the actual total distance traveled across all points. It's the most reflective of the actual transportation effort, making it fair and transparent for distance-based pricing.",
      '<span>Applicability Based on Pricing Mode</span>:',
      '<i></i>When the Pricing Mode is set to <span>Route Pricing (By Route)</span>, you can choose between the Highest Rate (P2P) and Farthest Location (P2P) methods.',
      '<i></i>If the Pricing Mode is <span>Mileage Pricing (By Distance)</span>, all three methods – Highest Rate (P2P), Farthest Location (P2P), and Route Distance (All Points) – are available for selection.',
      'Selecting the appropriate Multiple Route pricing method is crucial for accurate and fair billing, especially in complex transport scenarios involving multiple destinations or origins.',
    ],
    MileageCalculation: [
      `<span>Mileage Calculation Methods</span> In the "Mileage Pricing (By Distance)" mode, pricing is based on setting per-mile rates for different mileage ranges along a route. To accurately determine the cost, it's essential to select an appropriate Mileage Calculation method. We offer four methods:`,
      '1.<span>Distribute Mileage Calculation</span>: This method distributes the actual transport mileage across different mileage ranges. Each segment of the journey is priced according to its corresponding mileage range rate. These segment costs are then summed to determine the total price. Ideal for complex routes involving multiple mileage ranges, it ensures that each segment is fairly priced.',
      '2.<span>Flat Mileage Calculation</span>: Contrary to the Distribute method, this method calculates the price based on the mileage range that the total transport mileage falls into. The entire journey is priced at the rate set for that particular mileage range. Suitable for routes where the majority of the distance falls within a single mileage range, this method is straightforward.',
      '3.<span>Total Range Distribute Calculation</span>: Similar to the Distribute Mileage Calculation, but instead of pricing each segment based on a per-mile rate, this method uses a set total price for each mileage range. The total cost is the sum of the total prices for all ranges covered by the transport mileage. This method simplifies billing for routes with fixed costs per range.',
      "4.<span>Total Range Flat Calculation</span>: This method is akin to the Flat Mileage Calculation, but instead of a per-mile rate, it uses a fixed total price for the entire mileage range in which the transport mileage falls. It's efficient for routes where the entire journey can be priced based on one total range cost.",
      `<span>Note</span>: The term "Mileage Range" refers to different segments of distance used for rate calculation, ensuring a flexible and fair pricing model for various transport needs.`,
    ],
    CustomerTaxType: [
      `The "Customer Tax Type" setting in our TMS system is designed to specify whether the prices listed in the Route Library for customers are inclusive or exclusive of tax. It's essential to ensure that this setting aligns accurately with the nature of the prices entered into the system. Here's how it works:`,
      "<span><i></i>Importance of Accuracy</span>: It's crucial to match the tax inclusion status of the entered prices with the setting of the Customer Tax Type. This ensures clarity in billing and avoids any confusion regarding the final charges to the customers.",
      '<span><i></i>No Automatic Conversion</span>: Please note that our system does not automatically convert prices from tax-inclusive to tax-exclusive, or vice versa. This means the tax status of the price as entered must be consistent with the chosen Customer Tax Type setting.',
      "<span><i></i>Setting the Tax Type</span>: When entering prices into the Route Library, determine whether these prices include tax or not. Then, correspondingly set the Customer Tax Type to either 'Tax-Inclusive' or 'Tax-Exclusive', based on the nature of the prices.",
      '<span><i></i>Consistency is Key</span>: Maintaining consistency in this setting across your pricing data is vital for accurate and transparent pricing communication to your customers.',
      'By carefully setting the Customer Tax Type in line with the actual tax status of your prices, you ensure accurate and compliant billing practices.',
    ],
    VendorTaxType: [
      `The "Vendor Tax Type" feature in our TMS system allows you to define whether the prices listed in the Route Library for vendors include taxes. Accurate alignment of this setting with the tax status of entered prices is essential. Here’s what you need to know:`,
      '<span><i></i>Consistency in Pricing</span>: It’s imperative that the tax status of the prices entered into the Route Library matches the Vendor Tax Type setting. This consistency is crucial for clear and precise financial dealings with your vendors.',
      '<span><i></i>Manual Tax Status Identification</span>: Our system does not automatically adjust prices to reflect tax inclusion or exclusion. Therefore, it is necessary to manually ascertain whether the prices are tax-inclusive or tax-exclusive before entering them into the system.',
      "<span><i></i>Configuring Tax Type</span>: When inputting prices into the Route Library, first determine their tax status. Then, set the Vendor Tax Type accordingly to either 'Tax-Inclusive' or 'Tax-Exclusive', depending on whether or not the prices include tax.",
      '<span><i></i>Maintaining Accuracy</span>: To ensure accurate accounting and avoid potential misunderstandings, always make sure that the prices’ tax status in the Route Library aligns with the selected Vendor Tax Type.',
      'Properly setting the Vendor Tax Type according to the actual tax inclusion of your prices helps maintain transparent and correct pricing structures with your vendors.',
    ],
    MileageRange: [
      `When configuring Mileage Ranges for transport routes, you have the option to set the first distance segment as a "Fixed Starting Price". Here's how this feature works:`,
      `<span><i></i>With Fixed Starting Price</span>: If you opt for a Fixed Starting Price, it means that the first segment of the journey will be charged at a predetermined, flat rate, regardless of the actual distance traveled in that segment. This option simplifies the billing process for shorter distances or initial segments of a journey, as it avoids the need for precise distance-to-price calculations for that first segment.`,
      `<span><i></i>Without Fixed Starting Price</span>: If you choose not to set the first segment as a Fixed Starting Price, then the cost for this initial mileage range will be calculated based on the standard per-mile rate. This method is more reflective of the actual distance covered in the first segment and is ideal for situations where distance-based accuracy in pricing is essential from the start of the journey.`,
      'Remember, selecting the Fixed Starting Price option can significantly streamline billing for shorter routes or initial segments, while opting out of it allows for a more detailed and distance-specific pricing structure right from the beginning of the transport.',
    ],
  };
  return (
    <>
      {isShowIcon ? (
        <QuestionCircleOutlined
          style={{ color: '#696969', marginLeft: 6 }}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className={styles.main}>
          <span>{LabelName}</span>
          <QuestionCircleOutlined
            style={{ color: '#696969' }}
            onClick={() => {
              setIsModalOpen(true);
            }}
          />
        </div>
      )}
      <Modal
        width={680}
        title={LabelName + ' Instructions'}
        closeIcon={false}
        open={isModalOpen}
        onOk={handleOk}
        okText="OK"
        cancelButtonProps={{
          style: { display: 'none' },
        }}
      >
        <div>
          {expositoryCase?.[LabelName?.replace?.(/\s*/g, '') as string]?.map(
            (i: string, index: number) => {
              return (
                <p
                  key={index}
                  className={styles.labelTips}
                  dangerouslySetInnerHTML={{ __html: i || '' }}
                >
                  {/* {i} */}
                </p>
              );
            },
          )}
        </div>
      </Modal>
    </>
  );
}
