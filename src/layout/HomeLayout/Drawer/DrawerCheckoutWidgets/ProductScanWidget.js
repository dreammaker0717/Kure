import { customToast } from 'components/CustomToast/CustomToast';
import React, {useRef } from 'react';
import {
  addRemoveProductFromCart,
  getCart,
  getProductFromPackageUID
} from 'services/idb_services/orderManager';
import Qr from 'utils/Qr';
import scan_successful from "assets/sounds/scan_successful.mp3";
import scan_error from "assets/sounds/scan_error.mp3";
import scan_exists from "assets/sounds/scan_exists.mp3";


const ProductScanWidget = (props) => {
  const { paneIsOpen, openQRPane, setOpenQRPane } = props;
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

  /**
   *
   * @param package_uid
   *   The package_uid is a string which may contain something similar to 1A4060300003147000000129-10 or
   *   1f477e7a01ed38ae-02. Notice the dash (-) in the middle. The first part is the package_uid and the
   *   second part represent the product count or number.
   * @returns {Promise<void>}
   */
  const onAddRemoveProduct = async (package_uid) => {
    // Before we do anything with this package_uid, let's check if our cart (within an order_item) already contains
    // this scan. If it does, then we don't need to do anything.
    const cart = (await getCart()).data;

    const toggle_scan_to_delete = localStorage.getItem("toggle_scan_to_delete") === "true";

    let package_uid_exists = false;
    for (let i = 0; i < cart.order_items.length; i++) {
      for (let j = 0; j < cart.order_items[i].package_uids.length; j++) {
        if (cart.order_items[i].package_uids[j] === package_uid) {
          package_uid_exists = true;
          break;
        }
      }
    }

    // The employee wants to remove a product from the cart.
    if (toggle_scan_to_delete) {
      // If they scanned a product that doesn't exist in the cart.
      if (!package_uid_exists) {
        playSoundError();
        customToast.error("Product doesn't exist in the cart.");
        return;
      }
    }
    // Employee wants to add a product to the cart.
    else {
      if (package_uid_exists) {
        playSoundExists();
        customToast.error("Product already scanned.");
        return;
      }
    }

    const toast_response = await getProductFromPackageUID(package_uid);
    const { status, data, message } = toast_response;
    if (status == false) {
      playSoundError();
      customToast.error(message);
    } else {
      let direction = 0;
      let product_cart_response = null;
      // User wants to add to the cart.
      if (!toggle_scan_to_delete) {
        direction = 1;
      }
      // User wants to remove from the cart.
      else {
        direction = -1;
      }

      product_cart_response = await addRemoveProductFromCart(data, direction, package_uid);

      const { status, message } = product_cart_response;
      if (status == false) {
        playSoundError();
        customToast.error(message);
      } else {
        playSoundSuccess();
        customToast.success(message);
      }
    }
  };

  return (
    <div style={{ display: openQRPane ? 'block' : 'none' }}>
      <Qr
        paneIsOpen={paneIsOpen}
        openQRPane={openQRPane}
        onDetectedProduct={onAddRemoveProduct}
      />
      <audio controls ref={audioSuccessRef} style={{ display: 'none' }}>
        <source src={scan_successful} type="audio/mpeg"/>
        <track kind="captions" label="English captions" src="" default/>
      </audio>
      <audio controls ref={audioErrorRef} style={{ display: 'none' }}>
        <source src={scan_error} type="audio/mpeg"/>
        <track kind="captions" label="English captions" src="" default/>
      </audio>
      <audio controls ref={audioExistsRef} style={{ display: 'none' }}>
        <source src={scan_exists} type="audio/mpeg"/>
        <track kind="captions" label="English captions" src="" default/>
      </audio>
    </div>
  );
};

export default ProductScanWidget;