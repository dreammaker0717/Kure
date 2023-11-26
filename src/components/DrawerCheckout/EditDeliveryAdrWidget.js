import { Box } from '@mui/material';
import AddressMgrWidget from 'components/AddressMgrWidget/AddressMgrWidget';

const EditDeliveryAdrWidget = (props) => {
  const { onClickNext, onChangeAddress, addressList } = props;

  return (
    <Box sx={{ pt: '10px' }}>
      <AddressMgrWidget
        onSubmit={async (address) => {
          // console.log("AddressMgrWidget:", address);
          // console.log("AddressMgrWidget:", Object.keys(address).length);
          // if (Object.keys(address).length != 0) {
          //   await onChangeAddress(address);
          // }
          onClickNext();
        }}
        addressList={addressList}
      />
    </Box>
  );
};

export default EditDeliveryAdrWidget;
