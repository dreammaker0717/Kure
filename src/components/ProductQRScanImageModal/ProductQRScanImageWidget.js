import { customToast } from 'components/CustomToast/CustomToast';
import React, { useEffect, useRef } from 'react';
import {
  addRemoveProductFromCart,
  getCart,
  getProductFromPackageUID
} from 'services/idb_services/orderManager';
import Qr from 'utils/Qr';
import scan_successful from "assets/sounds/scan_successful.mp3";
import scan_error from "assets/sounds/scan_error.mp3";
import scan_exists from "assets/sounds/scan_exists.mp3";
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
const db = new KureDatabase();
const ProductQRScanImageWidget = (props) => {
  const { openQRPane, onDetectedProduct } = props;
  const audioSuccessRef = useRef(null);
  const audioErrorRef = useRef(null);
  const audioExistsRef = useRef(null);

  function playSoundSuccess() {
    audioSuccessRef.current.play();
  }

  function playSoundError() {
    audioErrorRef.current.play();
  }

  function playSoundExists() {
    audioExistsRef.current.play();
  }

  const detectedProduct = async (v) => {
    const { data, image } = v;
    const package_uid = data.split('-')[0];
    let sel_product = await db.getAllFromIndexList({ "package_uid": package_uid }, IDB_TABLES.product_data);
    if (sel_product.length == 0) {
      playSoundError();
      return;
    }
    playSoundSuccess();
    onDetectedProduct(v);
  }


  return (
    <div>
      <Qr
        openQRPane={openQRPane}
        onDetectedProduct={detectedProduct}
        isCaptureImage={true}
      />
      <audio controls ref={audioSuccessRef} style={{ display: 'none' }}>
        <source src={scan_successful} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
      <audio controls ref={audioErrorRef} style={{ display: 'none' }}>
        <source src={scan_error} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
      <audio controls ref={audioExistsRef} style={{ display: 'none' }}>
        <source src={scan_exists} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
    </div>
  );
};

export default ProductQRScanImageWidget;