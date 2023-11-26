import React, { useState } from 'react';
import { Stack, Button } from '@mui/material';
import AddressMgrWidget from 'components/AddressMgrWidget/AddressMgrWidget';

const AddressInfo = (props) => {
  const { selCustomer, setSelCustomer } = props;
  const [curAdrInfo, setCurAdrInfo] = useState(null);
  const { address } = selCustomer;

  const onChangeAddress = (event) => {
    const addressList = selCustomer['user_addresses'];
    const selAddress = addressList.find((x) => x.place_id == event.target.value);
    setSelCustomer({
      ...selCustomer,
      address: { ...selAddress }
    });
  };

  const onEditAddress = (info) => {
    let addressList = selCustomer['user_addresses'];
    addressList = addressList == undefined ? [] : addressList;
    if (curAdrInfo == 0) {
      // add
      const currentDateTime = new Date();
      const resultInSeconds = Math.round(currentDateTime.getTime());
      info = { place_id: `new-place-${resultInSeconds}`, ...info };
      addressList = [...addressList, info]
    } else {
      // update
      const index = addressList.findIndex(x => x.place_id == info.place_id);
      if (index == undefined) {
        setCurAdrInfo(null);
        return;
      }
      addressList[index] = { ...info };
    }

    setSelCustomer({
      ...selCustomer,
      address: { ...info },
      user_addresses: [...addressList]
    })
    setCurAdrInfo(null);
  }
  return (
    <div>
      <select
        defaultValue={
          selCustomer['address'] == undefined
            ? ""
            : selCustomer['address']['place_id']
        }
        onChange={onChangeAddress}
        style={{
          border: '1px solid #A8A8A8',
          fontSize: { xs: '1rem', sm: '1.5rem' },
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '8px',
          borderRadius: 3,
          minWidth: "200px"
        }}
      >
        <option value="" disabled>Select address here.</option>
        {selCustomer['user_addresses']?.map((info) => {
          const adr2 = info['address_line2'] === undefined || info['address_line2'] === '' ? '' : ` ${info['address_line2']}`;
          return (
            <option
              value={info['place_id']}
              key={`deliver-address-${info['place_id']}-${selCustomer['uid']}`}
            >
              {info['address_line1']}
              {adr2}, {info['locality']}, {info['administrative_area']}, {info['postal_code']}
            </option>
          );
        })}
      </select>

      <Stack direction="row" spacing={"30px"} sx={{ pl: "50px", mt: "10px" }}>
        <Button
          sx={{
            color: 'white',
            border: '1px solid',
            background: 'var(--primary)',
            pt: 0, pb: 0,
            '&:hover': {
              background: 'var(--primary-hover)'
            }
          }}
          disabled={selCustomer['address'] == undefined}
          onClick={() => {
            if (address == undefined) return;
            setCurAdrInfo(null);
            setTimeout(() => {
              setCurAdrInfo(address);
            }, 100)
          }}
        >Edit this address</Button>
        <Button sx={{
          color: 'white',
          border: '1px solid',
          background: 'var(--primary)',
          pt: 0, pb: 0,
          '&:hover': {
            background: 'var(--primary-hover)'
          }
        }}
                onClick={() => {
                  setCurAdrInfo(null);
                  setTimeout(() => {
                    setCurAdrInfo(0);
                  }, 100)
                }}>Add new address</Button>

      </Stack>

      {
        curAdrInfo != null && <AddressMgrWidget
          curAddress={curAdrInfo}
          titleColor={"black"}
          onClickSubmit={v => {
            onEditAddress(v);
          }}
        />
      }
    </div>
  );
};

export default AddressInfo;