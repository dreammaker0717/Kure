import React, { useState } from 'react';
import 'Common/NumPadStyle/NumPadStyle.css';
import { Button, FormHelperText, CircularProgress } from '@mui/material';

const NumpadWidget = (props) => {
    const { cashVal, setCashVal, onSubmitValue } = props;
    const { errorMessage, setErrorMessage } = props;

    const [isBusy, setIsBusy] = useState(false)

    const onClickNumber = (e) => {
        setCashVal(cashVal + e.target.innerText);
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
            onSubmitValue();
        } else {
            if ((e.key >= '0' && e.key <= '9') || (e.key == '.')) {
                setCashVal(cashVal + e.key);
            }
        }
    };


    const onClickBack = () => {
        setCashVal(cashVal.slice(0, -1));
    };

    return (
        <div className="numpad-wrapper">
            <FormHelperText error id="helper-text-pin-login">
                {errorMessage}
            </FormHelperText>
            <div className="display">
                <input placeholder="Input cash value"
                    type="text"
                    value={cashVal}
                    onChange={onClickNumber}
                    onKeyDown={onKeydownInput}
                    tabIndex={0}
                />
            </div>
            <div className="numpad-container">
                <div className="numpad-row">
                    <button className="numpad-btn" onClick={onClickNumber}>7</button>
                    <button className="numpad-btn" onClick={onClickNumber}>8</button>
                    <button className="numpad-btn" onClick={onClickNumber}>9</button>
                </div>
                <div className="numpad-row">
                    <button className="numpad-btn" onClick={onClickNumber}>4</button>
                    <button className="numpad-btn" onClick={onClickNumber}>5</button>
                    <button className="numpad-btn" onClick={onClickNumber}>6</button>
                </div>
                <div className="numpad-row">
                    <button className="numpad-btn" onClick={onClickNumber}>1</button>
                    <button className="numpad-btn" onClick={onClickNumber}>2</button>
                    <button className="numpad-btn" onClick={onClickNumber}>3</button>
                </div>
                <div className="numpad-row">
                    <button className="numpad-btn" onClick={onClickNumber}>0</button>
                    <button className="numpad-btn" onClick={onClickNumber}>00</button>
                    <button className="numpad-btn" onClick={onClickNumber}>000</button>
                </div>
                <div className="numpad-row">
                    <button className="numpad-btn" onClick={onClickNumber}>.</button>
                    <button className="action-button" onClick={onClickBack}>&lt;</button>
                    <button className="action-button" onClick={onClickClearButton}>C</button>
                </div>

            </div>
            <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color='info'
                sx={{ background: '#32beb9' }}
                onClick={onSubmitValue}
                className="numpad-submit-btn"
            >
                {isBusy && <CircularProgress
                    sx={{ color: 'white', marginRight: "10px" }}
                    size={'15px'}
                />} Add Cash Payment
            </Button>

        </div>
    );
};

export default NumpadWidget;