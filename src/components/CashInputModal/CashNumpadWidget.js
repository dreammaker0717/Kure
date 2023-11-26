import React from 'react';
import './CashNumpadWidget.css'
import { Button, FormHelperText, Grid } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { convertToNumber, monetizeToLocal } from 'Common/functions';

const CashNumpadWidget = (props) => {
  const { minVal, initVal, onSubmitValue, buttonText, is_completed } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [cashVal, setCashVal] = useState('');
  useEffect(() => {
    setErrorMessage('');
  }, [cashVal])
  // console.log('minVal: ', minVal)
  // useEffect(() => {
  //   if (initVal == undefined || initVal == "") return;
  //   if (initVal < 0) {
  //     setCashVal("0")
  //   } else {
  //     setCashVal(`${initVal}`)
  //   }
  // }, [initVal]);

  const onClickSubmit = () => {
    // if (minVal <= 0) {
    //   console.log("mimimimimimi",minVal)
    //   onSubmitValue("0");
    //   return;
    // }
    const cash_amount = parseFloat(cashVal);
    console.log("cash_amount", cash_amount)
    if (isNaN(cash_amount)) {
      setErrorMessage(`Please enter a valid dollar amount.`)
      return;
    }
    console.log("CASH: ", cash_amount, convertToNumber(minVal));
    if (minVal != undefined && minVal != "") {
      if (cash_amount < parseFloat(minVal)) {
        const min_amount = monetizeToLocal(minVal);
        setErrorMessage(`The amount should be greater than ${min_amount}`);
        return;
      }
    }

    onSubmitValue(cashVal);
  }

  const onClickNumber = (e) => {
    const val = e.target.innerText;
    if (val === "." && cashVal.includes(".")) {
      return;
    }
    setCashVal(cashVal + val);
  };

  const onClickClearButton = () => {
    setCashVal('');
  }

  const onKeydownInput = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setCashVal(cashVal.slice(0, -1));
    }
    // If enter is pressed submit value.
    if (e.key === "Enter") {
      onClickSubmit();
    } else {
      if ((e.key >= '0' && e.key <= '9') || (e.key == '.')) {
        if (e.key == '.' && cashVal.includes(".")) {
          return;
        }
        setCashVal(cashVal + e.key);
      }
    }
  };

  const onClickBack = () => {
    setCashVal(cashVal.slice(0, -1));
  };

  return (
    <div>
      <div className="cash-numpad-wrapper">
        <div>
          <input
            className='cash-numpad-input'
            placeholder="Enter amount received by customer"
            type="text"
            value={cashVal}
            onChange={(e) => setCashVal(e.target.value)}
            onKeyDown={onKeydownInput}
            tabIndex={0}
            disabled={is_completed || minVal <= 0}
          />
        </div>
        <div className="cash-numpad-container">
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>7</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>8</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>9</button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>4</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>5</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>6</button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>1</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>2</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>3</button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>0</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>00</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>000</button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickNumber}>.</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickBack}>&lt;</button>
                </Grid>
                <Grid item xs={4}>
                  <button disabled={is_completed} className="cash-numpad-btn" onClick={onClickClearButton}>C</button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>

        <FormHelperText error className="cash-numpad-error" sx={{ mt: "10px" }}>
          {errorMessage}
        </FormHelperText>

        {minVal <= 0 &&
          <FormHelperText sx={{ mt: "15px", color: "#32BEB9", fontSize: "16px", textAlign: "center" }}>

        </FormHelperText>
        }
      </div>
      <Button
        onClick={onClickSubmit}
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
        {(buttonText == undefined ? "Add Cash" : buttonText).toUpperCase()}
      </Button>
    </div>
  );
};

export default CashNumpadWidget;