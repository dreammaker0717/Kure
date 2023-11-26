import React, { useCallback, useEffect, useRef, useState } from 'react';
import './CameraCaptureWidget.css'
import Webcam from "react-webcam";
import { Button, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

const CameraCaptureWidget = (props) => {
    const { onCaptureImage } = props;
    const [isCamOpen, setIsCamOpen] = useState(false)
    const [imgSrc, setImgSrc] = useState(null);
    const [isCamError, setIsCamError] = useState(false);
    const [isBusy, setIsBusy] = useState(true);
    const webcamRef = useRef(null);

    // create a capture function
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        setIsBusy(true);
        setTimeout(() => {
            onCaptureImage(imageSrc);
        }, 2000);
    }, [webcamRef]);

    const onReceiveData = () => {
        setIsBusy(false);
        if (isCamOpen) return;
        setIsCamOpen(true);
    }
    const onUserMediaError = () => {
        setIsBusy(false);
        if (isCamError) return;
        setIsCamError(true);
    }

    const onClickButton = () => {
        setIsBusy(true);
        if (isCamError) {
            setImgSrc(null);
            setIsCamError(false);
        } else {
            capture();
        }
    }
    const buttonText = isBusy ? "Processing" : isCamError ? "Try again" : "Take a photo"
    return <div style={{ background: "black" }}>
        <div style={{ minHeight: "200px" }}>
            {isCamError ?
                (<div style={{ textAlign: "center", color: "#FF4D4F", paddingTop: "50px" }}>
                    Camera not found.<br />
                    Please try again.
                </div>)
                : imgSrc ?
                    (
                        <img src={imgSrc} alt="webcam" style={{ width: "300px" }} />
                    ) : (
                        <Webcam
                            height={"300px"}
                            width={"300px"}
                            ref={webcamRef}
                            forceScreenshotSourceSize={true}
                            screenshotFormat="image/png"
                            onUserMedia={onReceiveData}
                            onUserMediaError={onUserMediaError}
                        />
                    )}
        </div>
        <Button
            color="info"
            sx={{
                color: 'white',
                mt: '10px',
                border: '1px solid',
                background: '#32beb9',
                '&:hover': {
                    background: '#5CA300'
                }
            }}
            fullWidth={true}
            onClick={onClickButton}
            disabled={imgSrc != null}

        >
            {isBusy && <CircularProgress sx={{ color: 'white', marginRight: "10px" }} size={'15px'} />}
            {buttonText}
        </Button>
    </div>
};

export default CameraCaptureWidget;