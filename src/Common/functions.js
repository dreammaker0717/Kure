import moment from 'moment';
import CryptoJS from 'crypto-js';
import { SIG_CHANNEL } from './signals';
import { syncCustomersWithDrupal } from "services/idb_services/customerManager";
import { DEVICE_SIZE, OrderProductType } from './constants';

const { v4: uuidv4 } = require('uuid');

/**
 * Take a string, 'foo_bar', and return 'Foo Bar'.
 *
 * @param machineName
 * @returns {*}
 */
export const machineNameToLabel = (machineName) => {
  if (machineName == null) return '';
  return machineName.split('_').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export const getDeviceSize = (width) => {
  const width_list = {
    [DEVICE_SIZE.xs]: 0,
    [DEVICE_SIZE.sm]: 600,
    [DEVICE_SIZE.md]: 900,
    [DEVICE_SIZE.lg]: 1200,
    [DEVICE_SIZE.xl]: 1536,
  }
  const keys = Object.keys(width_list);
  for (let i = 1; i < keys.length; i++) {
    if (width < width_list[keys[i]]) {
      return keys[i - 1];
    }
  }
  return keys[keys.length - 1]
}

export const generateRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const convertTimestampToDate = (timestamp) => {
  if (!timestamp || isNaN(parseInt(timestamp)) || parseInt(timestamp) <= 0) return '';

  let timestampNumber = parseInt(timestamp);

  //php unix timestamp is counted in seconds and js timestamp is measured in milliseconds.
  //JS timestamp = php timestamp * 1000;
  // Check if the timestamp is in seconds or milliseconds (PHP or JS)
  if (timestampNumber < 10000000000) {
    // It's likely in seconds (PHP timestamp), convert it to milliseconds (JS timestamp)
    timestampNumber *= 1000;
  }
  
  const _time = new Date(parseInt(timestampNumber));
  return `${_time.toLocaleDateString()} ${_time.toLocaleTimeString()}`;
}

export const getUniqueArray = (arr) => {
  return [...new Set(arr)]
}
export const getColorOfVariation = (variation) => {
  return !variation
    ? ""
    : !(variation.attributes)
      ? ""
      : Object.keys(variation.attributes.color)[0]
}
export const getSizeOfVariation = (variation) => {
  return !variation
    ? ""
    : !(variation.attributes)
      ? ""
      : Object.keys(variation.attributes.size)[0]
}
export const generateRandomDateTime = () => {

  // Get current year and month
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth(); // Adding 1 to match the format of new Date("YYYY-MM-DDTHH:mm:ss")

  // Generate random day and time
  var day = Math.floor(Math.random() * 28) + 1; // Random number between 1 and 28
  var hours = Math.floor(Math.random() * 24); // Random number between 0 and 23
  var minutes = Math.floor(Math.random() * 60); // Random number between 0 and 59
  var seconds = Math.floor(Math.random() * 60); // Random number between 0 and 59

  // Combine all parts into a new Date object
  var dateString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  var randomDate = new Date(dateString);
  return randomDate;
}
export const formatUser = (customer) => {
  if (!customer) return "";
  //return customer.mail + " (" + customer.uid + ")";
  return customer.mail + " (" + customer.name + ")";
}
export const getAddressString = (address_info) => {
  /**
   * address_info = {
   *     "name": "Kure Wellness - Kits",
   *     "phone": "(707) 245-2806",
   *     "country": "US",
   *     "address1": "7990 CA-29 Suite E",
   *     "address2": "",
   *     "state": "California",
   *     "city": "Kelseyville",
   *     "postal_code": "95451",
   *     "email": "info@kuremendocino.com",
   *     "store_id": "6",
   *     "license": "C10-0001250-LIC"
   * }
   * @type {*[]}
   */
  const parts = [
    address_info.address1,
    address_info.address2,
    ` ${address_info.city}, ${address_info.state} ${address_info.postal_code}`
  ];

  return parts.filter(part => part);
}
export const compare = (a, b, field) => {
  if (a[field] < b[field]) {
    return -1;
  }
  if (a[field] > b[field]) {
    return 1;
  }
  return 0;
}


export const sortObjectArray = (objectArray, field, asc = true) => {
  const is_asc = asc ? -1 : 1;
  if (!objectArray || objectArray.length == 0) return [];
  if (!field || field == "") return objectArray;
  const res = [...objectArray];
  res.sort((a, b) => (a[field] > b[field]) ? is_asc * 1 : ((b[field] > a[field]) ? is_asc * -1 : 0))
  return res;
}

export const toastPrepareMessage = (status = true, data = null, message = '') => {
  return {
    status: status,
    data: data,
    message: message
  };
};
export const renameLink = (link) => {
  const checkLink = link.toString().replaceAll(/[-#*:;,.<>\{\}\[\]\\\/]/gi, '');
  const replaceSpace = checkLink.replaceAll('  ', ' ')
  return replaceSpace.replaceAll(' ', '-')
}


export const clickOutSide = (refElement, setIsOpen) => {
  if (!refElement.current) return;
  document.addEventListener(`click`, (evt) => {
    if (refElement?.current && refElement.current.contains(evt.target)) return;
    setIsOpen(false);
  });
}
export const generateKey = (prefix = "") => {
  const currentDateTime = new Date();
  const resultInSeconds = Math.round(currentDateTime.getTime());
  return `${prefix}${resultInSeconds}`
}

export const backgroundServiceMessenger = async (type) => {
  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('./sw.js');

    // Check if the service worker is active
    if (registration.active) {
      // console.log('Service Worker is active with scope:', registration.scope);

      // If the service worker is active, register the sync
      await registration.sync.register(type);
      console.log('Sync registered successfully');
      return true;
    } else {
      // If the service worker is not active, log a message
      console.log('Service Worker is not active');
      return false;
    }
  } catch (error) {
    // If there's an error during registration or sync registration, log the error
    // console.error('Service Worker registration or sync registration failed:', error);
    return false;
  }
};

export const broadcastMessage = (type, data = null) => {
  const channel = new BroadcastChannel(SIG_CHANNEL);
  channel.postMessage({ type: type, data: data, action: 'sync' });
};

export const firstLetterUpperCase = (string) => {
  if (string == "" || string == null) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const convertToNumber = (string, errorValue = "") => {
  if (string) {
    const str = `${string}`;
    return parseFloat(str.replace(/[^0-9.,-]/g, '').replace(/,/g, ''));
  }
  return errorValue;
};
export const monetizeToLocal = (value) => {
  const pre = convertToNumber(value, 0) >= 0 ? '' : '-';
  return pre + '$' + Math.abs(parseFloat(value)).toFixed(2);
};

export const encode_utf8 = (s) => {
  return encodeURIComponent(s);
};

export const decode_utf8 = (s) => {
  return decodeURIComponent(s);
};

export const getFormattedDate = (day = 0, format = 'YYYY-MM-DDTHH:mm:ss') => {
  let date = '';
  date = moment();
  date = date.add(day, 'days');
  return date.utc().format(format);
};

export const getCalculatedDate = (day = 0, isFrom = true, format = 'YYYY-MM-DDTHH:mm:ss') => {
  let date = '';
  date = moment();
  date = date.add(day, 'days');
  date = date.utc()
  if (isFrom) {
    date = date.startOf('day')
  } else {
    date = date.endOf('day')
  }
  return date.format(format);
};

export const generateSignature = (secret) => {
  const date = getFormattedDate(0, 'YYYYMMDDHHmm');
  const e_date = CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(date), CryptoJS.enc.Utf8.parse(secret));
  const hash = CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse('ScansByDate'), e_date);
  const sig = CryptoJS.enc.Hex.stringify(hash);
  return sig;
};

export const MySleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getGUID = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export const getCalculatedCartTotals = (cart) => {
  if (cart == null) {
    return {
      subtotal: 0,
      adjustments: [],
      total: 0,
    }
  }
  // console.log(cart);

  let subtotal = 0;
  let subtotal_changes = 0;
  let adjustments = [];

  // We process order_items first because they contain the retail price.
  // Two things happen here: 1) Sum the subtotal for each order item, 2) Place adjustments into our map. We want to sort
  // them by weight. Make sure the adjustment is simplified in order to display each one to the user.
  cart.order_items.forEach((order_item) => {
    if (order_item.type === OrderProductType.return) {
      return;
    }

    // Add the retail price to our subtotal.
    subtotal += parseFloat(order_item.retail_price) * order_item.quantity;

    order_item.adjustments.forEach((adjustment) => {
      adjustments.push({
        weight: adjustment.weight,
        data: {
          label: adjustment.label,
          value: adjustment.amount.number
        }
      });
      subtotal_changes += parseFloat(adjustment.amount.number);
    });
  });

  // Place adjustments into our map. We want to sort them by weight. Make sure the adjustment is simplified in order to
  // display each one to the user.

  // cart.adjustments.forEach((adjustment) => {
  //   adjustments.push({
  //     weight: adjustment.weight,
  //     data: {
  //       label: adjustment.label,
  //       value: adjustment.amount.number
  //     }
  //   });
  //   subtotal_changes += parseFloat(adjustment.amount.number);
  // });

  // Make sure the final sort order is by weight, ascending.
  adjustments = adjustments.sort((a, b) => a.weight - b.weight);
  // Make sure we merge adjustments that have the same label and we sum the value.
  adjustments = combineAdjustmentsByLabel(adjustments)
  // console.log(">> Adjustments", adjustments)

  // Simplify the adjustments array by only keeping the label and value.
  adjustments = adjustments.map((adjustment) => {
    return {
      label: adjustment.data.label,
      value: adjustment.data.value
    }
  });

  // console.log("Subtotal", subtotal)
  // console.log("Adjustments: ", adjustments)
  // console.log("Total: ", subtotal + subtotal_changes)

  return {
    subtotal: subtotal,
    adjustments: adjustments,
    total: subtotal + subtotal_changes,
  };
}

export const getCalculatedCartReturnTotals = (cart) => {
  if (cart == null) {
    return {
      subtotal: 0,
      adjustments: [],
      total: 0,
    }
  }
  // console.log(cart);

  let subtotal = 0;
  let subtotal_changes = 0;
  let adjustments = [];
  let return_flag = false;
  // We process order_items first because they contain the retail price.
  // Two things happen here: 1) Sum the subtotal for each order item, 2) Place adjustments into our map. We want to sort
  // them by weight. Make sure the adjustment is simplified in order to display each one to the user.
  cart.order_items.forEach((order_item) => {
    if (order_item.type !== OrderProductType.return) {
      return;
    }

    return_flag = true;
    // Add the retail price to our subtotal.
    subtotal += parseFloat(order_item.retail_price) * order_item.quantity;

    order_item.adjustments.forEach((adjustment) => {
      adjustments.push({
        weight: adjustment.weight,
        data: {
          label: adjustment.label,
          value: adjustment.amount.number
        }
      });
      subtotal_changes += parseFloat(adjustment.amount.number);
    });
  });

  // Place adjustments into our map. We want to sort them by weight. Make sure the adjustment is simplified in order to
  // display each one to the user.
  if (return_flag) {
    cart.adjustments.forEach((adjustment) => {
      adjustments.push({
        weight: adjustment.weight,
        data: {
          label: adjustment.label,
          value: adjustment.amount.number
        }
      });
      subtotal_changes += parseFloat(adjustment.amount.number);
    });

    // Make sure the final sort order is by weight, ascending.
    adjustments = adjustments.sort((a, b) => a.weight - b.weight);

    // Make sure we merge adjustments that have the same label and we sum the value.
    adjustments = combineAdjustmentsByLabel(adjustments)

    // console.log(">> Adjustments", adjustments)

    // Simplify the adjustments array by only keeping the label and value.
    adjustments = adjustments.map((adjustment) => {
      return {
        label: adjustment.data.label,
        value: adjustment.data.value
      }
    });
  }

  // console.log("Subtotal", subtotal)
  // console.log("Adjustments: ", adjustments)
  // console.log("Total: ", subtotal + subtotal_changes)

  return {
    subtotal: subtotal,
    adjustments: adjustments,
    total: subtotal + subtotal_changes,
  };
}

function combineAdjustmentsByLabel(array) {
  // Create an empty object to store combined label data
  let combined = {};

  // Iterate through the input array
  array.forEach(item => {
    // Use the label as a key in the combined object
    let label = item.data.label;
    if (combined[label]) {
      // If this label already exists in the combined object, sum the values
      combined[label].data.value += item.data.value;
    } else {
      // If this label doesn't exist yet, create a new entry in the combined object
      combined[label] = {
        weight: item.weight,
        data: {
          label: label,
          value: item.data.value
        }
      };
    }
  });

  // Convert the combined object back into an array of objects
  return Object.values(combined);
}

/**
 * Generate UUID without dashes.
 *
 * @returns {*}
 */
export const getUUID = () => {
  return uuidv4().replace(/-/g, '');
}

let key256Bits = null;

export const decryptData = (encryptedString, key256Bits = null) => {
  try {
    if (!key256Bits) {
      key256Bits = CryptoJS.PBKDF2("3nnZPnF8s2vqa9kZKPjgzSW", "PjEFd9cNgcKVULbfryvG6xgSg6BEWV4dFPrvhPyGNnszW4TVDAexkH5rG", {
        keySize: 256 / 32,
        iterations: 1000,
        hasher: CryptoJS.algo.SHA256
      });
    }

    let rawData = atob(encryptedString);
    let rawPieces = rawData.split(":");
    let cryptText = rawPieces[0];
    let iv = CryptoJS.enc.Hex.parse(rawPieces[1]);
    let cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cryptText)
    });
    let plaintextArray = CryptoJS.AES.decrypt(
      cipherParams,
      key256Bits,
      { iv: iv }
    );
    return CryptoJS.enc.Utf8.stringify(plaintextArray);
  } catch (err) {
    return null;
  }
}

export const encryptData = (rawString) => {

  let key256Bits = CryptoJS.PBKDF2("3nnZPnF8s2vqa9kZKPjgzSW", "PjEFd9cNgcKVULbfryvG6xgSg6BEWV4dFPrvhPyGNnszW4TVDAexkH5rG", {
    keySize: 256 / 32,
    iterations: 1000,
    hasher: CryptoJS.algo.SHA256
  });
  let iv = "aes-256-cbc";
  iv = CryptoJS.enc.Hex.parse(iv);
  const data = rawString;
  let body = CryptoJS.AES.encrypt(data, key256Bits, { iv: iv });
  body = CryptoJS.enc.Base64.stringify(body.ciphertext);
  iv = CryptoJS.enc.Hex.stringify(iv);
  return btoa(body + ":" + iv);
}