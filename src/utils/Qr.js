import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

export default function Qr({ openQRPane, onDetectedProduct, isCaptureImage }) {

  const qrScannerRef = useRef(null);
  const qrScannerResultRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null)

  const setResult = async (label, result) => {
    // Tell the UI to update.
    if (label && result) {
      label.textContent = result.data;
    }
    if (isCaptureImage == true) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const _rate = qrScannerRef.current.videoHeight / qrScannerRef.current.videoWidth;
      const _width = 250;

      canvas.width = _width;
      canvas.height = _width * _rate;

      ctx.drawImage(qrScannerRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL();
      await onDetectedProduct({
        data: result.data,
        image: dataURL
      });
    } else {
      await onDetectedProduct(result.data);
    }
  }

  useEffect(() => {
    if (openQRPane) {
      console.log("Starting QR scanner...");

      const qr_scanner = new QrScanner(
        qrScannerRef.current,
        async result => {
          await setResult(qrScannerResultRef.current, result);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 2,
        }
      );
      qr_scanner.start();
      setQrScanner(qr_scanner);
    } else {
      if (qrScanner != null) {
        console.log("Destroying the QR scanner...");
        qrScanner.destroy();
        setQrScanner(null);
      }
    }
  }, [qrScannerRef, openQRPane]);

  return (
    <div style={{
      textAlign: 'center'
    }}>
      <video ref={qrScannerRef} style={{
        width: "300px",
        // minWidth: "200px",
        objectFit: "cover",
        visibility: "visible",
        opacity: 1,
      }}>
        {/*Chrome/ReactJS complain that we need a track element.*/}
        <track src="#" kind="captions" srcLang="en" label="english_captions" />
      </video>
      <Box>
        <Typography
          ref={qrScannerResultRef}
          sx={{ fontSize: '14px', color: "white" }}>
          Waiting for a QR code...
        </Typography>
      </Box>
    </div>
  );
}