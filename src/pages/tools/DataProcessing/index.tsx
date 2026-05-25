import EntityDelete from './components/EntityDelete';
import EntityRename from './components/EntityRename';
import StatusModify from './components/StatusModify';
import TruckTypeModify from './components/TruckTypeModify';
import WaybillSubtaskModify from './components/WaybillSubtaskModify';

const DataProcessing: React.FC = () => {
  return (
    <>
      <EntityRename />
      <EntityDelete />
      <StatusModify />
      <WaybillSubtaskModify />
      <TruckTypeModify />
    </>
  );
};

export default DataProcessing;
