import React, { useContext, useState } from 'react';
import '../Common/NumPadStyle/NumPadStyle.css';
import { Resource } from "services/api_services/Resource";
import AnimateButton from 'components/@extended/AnimateButton';
import Button from "@mui/material/Button";
import { FormHelperText } from "@mui/material";
import CryptoJS from 'crypto-js';
import { KureDatabase } from "services/idb_services/KureDatabase";
import { broadcastMessage } from 'Common/functions';
import { SIG_AUTH_CHANGED } from 'Common/signals';
import { CircularProgress } from '@mui/material';
import { localStorageCashier } from "services/storage_services/CONSTANTS";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { getStoreId, storeSetCashierId, storeSetCashierName } from 'services/storage_services/storage_functions';
import { getCart, modifyCart } from 'services/idb_services/orderManager';

const PinNumPad = (props) => {
  const { profileData } = useContext(UsersProfileContext);
  const { openPinPopup, setOpenPinPopup } = props;
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false)
  const resource = new Resource();
  const db = new KureDatabase();

  const handleClick = (e) => {
    if (value.length < 4) {
      setValue(value + e.target.innerText);
    }
  };

  const handleClearClick = () => {
    setValue('');
  }

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setValue(value.slice(0, -1));
    }
    // If enter is pressed submit value.
    if (e.key === "Enter") {
      handleSubmit();
    } else if (value.length < 4) {
      if (e.key >= '0' && e.key <= '9') {
        setValue(value + e.key);
      }
    }
  };

  const handleSubmit = async () => {
    setIsBusy(true);
    const count = await db.usersPinData().count();
    if (count == 0) {
      setErrorMessage("User data not available for now. Try again.");
      setIsBusy(false);
      return;
    }
    const users = await db.usersPinData().getAll();
    let users_data = resource.decryptData(users[0].value);
    users_data = JSON.parse(users_data);
    // Search users data to see if we can find any user that has this pin
    const cashier = users_data.find(item => item.field_pin_value === value);
    // console.log("cashier selected:", cashier)
    if (cashier === undefined) {
      setErrorMessage("Couldn't find your PIN.");
    } else {
      setErrorMessage('');
      // Store cashier id (user_id) in local storage.
      storeSetCashierId(cashier.uid);
      // console.log('profileData', profileData)
      storeSetCashierName(profileData[cashier.uid]?.name);
      // console.log('cashier name:', profileData[cashier.uid]?.name)
      // await getCart(getStoreId(), true);
      setTimeout(() => {
        modifyCart({
          cashier_id: cashier.uid,
          cashier_name: profileData[cashier.uid]?.name
        })
      }, 200);

      //Close popup as everything is done successfully
      setOpenPinPopup(false);
      broadcastMessage(SIG_AUTH_CHANGED)
    }

    setValue('');
    setIsBusy(false);
  }

  const handleBack = () => {
    setValue(value.slice(0, -1));
  };

  return (
    <div className="numpad-wrapper">
      <FormHelperText error id="helper-text-pin-login">
        {errorMessage}
      </FormHelperText>
      <div className="display">
        <input placeholder="Enter cashier PIN" type="text" value={value} onChange={handleClick}
          onKeyDown={handleKeyDown} tabIndex={0} />
      </div>
      <div className="numpad-container">
        <div className="numpad-row">
          <button className="numpad-btn" onClick={handleClick}>7</button>
          <button className="numpad-btn" onClick={handleClick}>8</button>
          <button className="numpad-btn" onClick={handleClick}>9</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={handleClick}>4</button>
          <button className="numpad-btn" onClick={handleClick}>5</button>
          <button className="numpad-btn" onClick={handleClick}>6</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={handleClick}>1</button>
          <button className="numpad-btn" onClick={handleClick}>2</button>
          <button className="numpad-btn" onClick={handleClick}>3</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={handleClick}>0</button>
          <button className="action-button" onClick={handleBack}>&lt;</button>
          <button className="action-button" onClick={handleClearClick}>C</button>
        </div>

      </div>
      <AnimateButton>
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color='info'
          sx={{ background: '#32beb9' }}
          onClick={handleSubmit}
          className="numpad-submit-btn"
        >
          {isBusy &&
            <CircularProgress
              sx={{ color: 'white', marginRight: "10px" }}
              size={'15px'}
            />}
          Login
        </Button>
      </AnimateButton>
    </div>
  );
};

export default PinNumPad;