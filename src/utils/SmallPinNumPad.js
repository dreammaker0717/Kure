import React, { useContext, useState } from 'react';
import '../Common/NumPadStyle/NumPadStyle.css';
import { Resource } from "services/api_services/Resource";
import AnimateButton from 'components/@extended/AnimateButton';
import Button from "@mui/material/Button";
import { FormHelperText } from "@mui/material";
import CryptoJS from 'crypto-js';
import { KureDatabase } from "services/idb_services/KureDatabase";
import { CircularProgress } from '@mui/material';
import { broadcastMessage } from 'Common/functions';
import { SIG_AUTH_CHANGED } from 'Common/signals';
import { localStorageCashier, localStorageCashierName } from "services/storage_services/CONSTANTS";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { getStoreId, storeSetCashierId, storeSetCashierName } from 'services/storage_services/storage_functions';
import { getCart, modifyCart } from 'services/idb_services/orderManager';

const resource = new Resource();
const db = new KureDatabase();

const SmallPinNumPad = (props) => {
  const { profileData } = useContext(UsersProfileContext);
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

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
      setErrorMessage("User PIN data isn't available at the moment. Please try again in a moment.");
      setIsBusy(false);
      return;
    }
    const users = await db.usersPinData().getAll();
    let users_data = resource.decryptData(users[0].value);
    users_data = JSON.parse(users_data);
    // console.log("USERS PIN DATA: ", users_data.filter(x => x.field_pin_value != null));
    // Search users data to see if we can find any user that has this pin.
    const cashier = users_data.find(item => item.field_pin_value === value);
    // console.log("cashier selected:", cashier)
    if (cashier === undefined) {
      setErrorMessage("Couldn't find your PIN");
    } else {
      if (!profileData[cashier.uid] && Object.keys(profileData).length > 0) {
        // console.log('profile data:', profileData[cashier.uid])
        setErrorMessage("We're downloading important profile data. Please try again in a moment.");
        return;
      }
      setErrorMessage('');
      // Store cashier id (user_id) in local storage.
      storeSetCashierId(cashier.uid);
      storeSetCashierName(profileData[cashier.uid]?.name);
      // console.log('cashier name:', profileData[cashier.uid]?.name)
      setTimeout(() => {
        modifyCart({
          cashier_id: cashier.uid,
          cashier_name: profileData[cashier.uid]?.name
        })
      }, 200);
      broadcastMessage(SIG_AUTH_CHANGED);
    }

    setValue('');
    setIsBusy(false);
  }

  const handleBack = () => {
    setValue(value.slice(0, -1));
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FormHelperText error id="helper-text-pin-login">
        {errorMessage}
      </FormHelperText>
      <div>
        <input placeholder="Enter cashier PIN"
               type="text"
               className='numpad-input-small'

               value={value} onChange={handleClick}
               onKeyDown={handleKeyDown}
               tabIndex={0}/>
      </div>
      <div style={{ width: "100%", marginTop: "10px" }}>
        <div className="numpad-row">
          <button className="numpad-btn-small" onClick={handleClick}>7</button>
          <button className="numpad-btn-small" onClick={handleClick}>8</button>
          <button className="numpad-btn-small" onClick={handleClick}>9</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn-small" onClick={handleClick}>4</button>
          <button className="numpad-btn-small" onClick={handleClick}>5</button>
          <button className="numpad-btn-small" onClick={handleClick}>6</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn-small" onClick={handleClick}>1</button>
          <button className="numpad-btn-small" onClick={handleClick}>2</button>
          <button className="numpad-btn-small" onClick={handleClick}>3</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn-small" onClick={handleClick}>0</button>
          <button className="numpad-btn-small" onClick={handleBack}>&lt;</button>
          <button className="numpad-btn-small" onClick={handleClearClick}>C</button>
        </div>

      </div>

      <Button
        fullWidth
        size="medium"
        type="submit"
        variant="contained"
        color='info'
        sx={{ background: '#32beb9', marginTop: "10px" }}
        onClick={handleSubmit}
      >
        {isBusy && <CircularProgress sx={{ color: 'white', marginRight: "10px" }} size={'15px'}/>} Login
      </Button>
    </div>
  );
};

export default SmallPinNumPad;