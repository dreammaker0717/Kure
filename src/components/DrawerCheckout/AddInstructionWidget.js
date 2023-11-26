import React, { useEffect, useState } from 'react';
import { Button, OutlinedInput } from '@mui/material';
import { getCart, getInstructionsFromCart, updateCartObject } from "services/idb_services/orderManager";
import DOMPurify from 'dompurify';

const AddInstructionWidget = (props) => {
  const { onClickNext, deliveryStatus } = props;
  const [instructions, setInstructions] = useState('');
  const onClickDoProcess = async () => {
    let _instructions = DOMPurify.sanitize(instructions);
    _instructions = _instructions.replace(/[^a-z0-9?\s]/gi, '');
    // Get cart and save instructions.
    await updateCartObject({ instructions: _instructions });

    onClickNext();
  };

  useEffect(() => {
    async function fetchData() {
      const instructions = await getInstructionsFromCart();
      if (instructions !== '') {
        setInstructions(instructions);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ marginTop: 10 }}>
      <OutlinedInput
        fullWidth
        value={!instructions ? "" : instructions}
        multiline={true}
        placeholder={'Add your order instructions'}
        sx={{ background: '#FFF' }}
        minRows={7}
        onChange={(e) => {
          setInstructions(e.target.value);
        }}
      />
      <Button
        onClick={onClickDoProcess}
        variant="outlined"
        color="info"
        fullWidth
        sx={{
          color: 'white',
          mt: '24px',
          border: '1px solid',
          background: '#32beb9'
        }}
      >
        {deliveryStatus['next_button'].toUpperCase()}
      </Button>
      {deliveryStatus['skip_button'] !== null && (
        <Button
          onClick={() => {
            setInstructions("");
            setTimeout(() => {
              onClickNext();
            }, 200);
          }}
          variant="outlined"
          color="info"
          fullWidth
          sx={{
            color: 'white',
            mt: '24px',
            border: '1px solid',
            background: '#32beb9'
          }}
        >
          {deliveryStatus['skip_button'].toUpperCase()}
        </Button>
      )}
    </div>
  );
};

export default AddInstructionWidget;
