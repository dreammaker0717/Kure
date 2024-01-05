import CryptoJS from 'crypto-js';
import { getStoreId } from '../storage_services/storage_functions';
import { USER_TYPE } from 'Common/constants';
import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import { idbGetIsOnline } from 'services/idb_services/configManager';

class Resource {
  defaultConfig = {
    // Base URL of your Drupal site.
    base: 'https://kurereactjs.joshideas.com',
    // base: 'http://localhost/kuremendocino.com',
    // Name to use when storing the token in localStorage.
    token_name: 'kure-oauth-token',
    // OAuth client ID - get from Drupal.
    client_id: 'c02d0901-cba4-44b0-9ec2-963bcd1a6a67',
    // OAuth client secret - set in Drupal.
    client_secret: '4420d1918bbcf7686defdf9560bb5087d20076de5f77b7cb4c3b40bf46ec428b',
    // Drupal user role related to this OAuth client.
    scope: 'kure_app',
    // Margin of time before the current token expires that we should force a
    // token refresh.
    expire_margin: 0,
    // User info storage name.
    user_info: 'kure-user-info',
    new_message_counts: 'new_message_counts'
  };

  config;

  constructor(config = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * A magic function that will encode the base64 public key to array buffer which is needed by the subscription option.
   *
   * @param base64String
   * @returns {Uint8Array}
   */
  urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  /**
   * @returns {Promise<object>}
   */
  async commerceProduct(category_name, parameters = {}) {
    return await this._fetch('/rest/commerce-products/front-page/2/' + category_name, parameters);
  }

  async commerceCategory(category_name, parameters = {}) {
    return await this._fetch('/rest/commerce-products/category/2/' + category_name, parameters);
  }

  async commerceProductDetail(variation_link, parameters = {}) {
    return await this._fetch('/rest/commerce-products/product-detail/' + variation_link, parameters);
  }

  // async commerceProductDataSync(parameters = null) {
  //   return await this._fetch('/product-endpoint' + '', parameters, null, null, 'GET');
  // }
  async commerceProductDataSync(parameters = null) {
    return await this._fetch('/product-endpoint' + '', parameters, null, null, 'GET');
  }

  async commerceStores() {
    return await this._fetch('/commerce:stores');
  }

  async allUsersPinData(user_pin) {
    return await this._fetch('/users-data', null, null, null, 'GET', true);
  }

  async getUsersProfileData(param) {
    return await this._fetch('/users-profiles', param, null, null, 'GET', true);
  }

  async createUpdateCustomer(param) {
    const _data = JSON.stringify({ ...param, action: "create_update" });
    return await this._fetch("/users-profiles", null, _data, { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', true);
  }

  async createNewOrder(param) {
    // console.log("Order param>>> ", param);
    if (param == null || param.length == 0) {
      return {
        status: false,
      };
    }

    console.log("createNewOrder>> ", param);
    const _data = JSON.stringify({ ...param, action: "create", shipping_id: param['shipping_id'] });
    // console.log("data:>>>", _data);
    return await this._fetch("/order-data", null, _data, { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', true);
  }

  async getAdjustments(param) {
    return await this._fetch('/adjustments-endpoint', param, null, null, 'GET', true);
  }

  async getAdjustmentTax(param = null) {
    return await this._fetch('/adjustment-tax-endpoint', param, null, null, 'GET', true);
  }

  async getAdjustmentShipping(param = null) {
    return await this._fetch('/adjustment-shipping-endpoint', param, null, null, 'GET', true);
  }

  async getAdjustmentPromotion(param = null) {
    return await this._fetch('/adjustment-promotion-endpoint', param, null, null, 'GET', true);
  }

  async couponCodeData(param) {
    return await this._fetch('/coupon-codes', param, null, null, 'GET', true);
  }

  async getOrders(param) {
    const _data = JSON.stringify({ ...param });
    return await this._fetch('/web-orders-notification', null, _data, { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', true);
  }

  async getTokenworks() {
    const _data = JSON.stringify({
      store_id: getStoreId(),
    });
    return await this._fetch('/tokenworks', null, _data, { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', true);
  }

  async getInventoryReconciliationData(param) {
    const _data = JSON.stringify({ ...param });
    return await this._fetch('/inventory-reconciliation', null, _data, { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', true);
  }

  /**
   * Exchange a username and password for an OAuth token.
   *
   * @param username
   * @param password
   * @returns {Promise<{data: string, message: string, status: number}>}
   */
  async login(username, password) {
    const form_data = new FormData();
    form_data.append('grant_type', 'password');
    form_data.append('client_id', this.config.client_id);
    form_data.append('client_secret', this.config.client_secret);
    form_data.append('scope', this.config.scope);
    form_data.append('username', username);
    form_data.append('password', password);
    return await this._fetch('/oauth/token', null, form_data, null, 'POST', false);
  }

  /**
   * Register a new user via a custom endpoint within Drupal.
   *
   * @param mail
   * @param username
   * @param password
   * @returns {Promise<{data: string, message: string, status: number}>}
   */
  async register(mail, username, password) {
    const form_data = new FormData();
    form_data.append('grant_type', 'password');
    form_data.append('client_id', this.config.client_id);
    form_data.append('client_secret', this.config.client_secret);
    form_data.append('scope', this.config.scope);
    form_data.append('mail', mail);
    form_data.append('username', username);
    form_data.append('password', password);

    return await this._fetch('/register-token', null, form_data, null, 'POST', false);
  }

  /**
   * To Drupal, send this user's data object (username, uid) and the subscription object - push API registration.
   *
   * @param user_data
   * @returns {Promise<void>}
   */
  async savePushMessagingSubscription(user_data) {

    const applicationServerKey = this.urlB64ToUint8Array(
      "BJ5IxJBWdeqFDJTvrZ4wNRu7UY2XigDXjgiUBYEYVXDudxhEs0ReOJRBcBHsPYgZ5dyV8VjyqzbQKS8V7bUAglk"
    );
    const options = { applicationServerKey, userVisibleOnly: true };
    // Get the pushManager object from the service worker registration
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.subscribe(options).then((subscription) => {
        const _data = JSON.stringify({
          user_data: user_data,
          subscription: subscription,
        });

        const headers = {
          'Content-Type': 'application/json',
        };
        return this._fetch('/web-push-device-registration', null, _data, headers, 'POST', true)
          .then((response) => {
          }).catch((response) => {
            console.error(response);
          });
      });
    });
  }

  /**
   * Start the user reset password process.
   *
   * @param mail
   * @returns {Promise<{data: string, message: string, status: number}>}
   */
  async passwordReset(mail) {
    let user_info = {
      name: mail,
      request_type: 'send_reset_email',
    };
    return await this._fetch('/first-rest-end-point', null, JSON.stringify(user_info), { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', false)
      .then((response) => {
        return Promise.resolve(response);
      })
      .catch((response) => {
        return Promise.reject(response);
      });
  }

  /**
   * Update the user's password. Requires the verification email which includes the parameters listed below.
   *
   * @param password
   * @param uid
   * @param hash
   * @param timestamp
   * @returns {Promise<{data: string, message: string, status: number}>}
   */
  async passwordUpdate(password, uid, hash, timestamp) {
    let data = {
      uid: uid,
      hash: hash,
      timestamp: timestamp,
      new_password: password,
      request_type: 'update_password',
    };
    return await this._fetch('/first-rest-end-point', null, JSON.stringify(data), { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', false)
      .then((response) => {
        return Promise.resolve(response);
      })
      .catch((response) => {
        return Promise.reject(response);
      });
  }

  async verifyUserEmail(uid, timestamp, hash) {
    let data = {
      uid: uid,
      hash: hash,
      timestamp: timestamp,
      request_type: 'new_user_verify',
    };

    const header = { 'Content-Type': 'application/json;charset=UTF-8', XAppType: 'ReactJS' };
    return await this._fetch('/first-rest-end-point', null, JSON.stringify(data), header, 'POST', false);
  }

  async saveTokenNewUserRegistered(uid, token) {
    let data = {
      uid: uid,
      token: token,
      request_type: 'save_user_token',
    };
    // return await this._fetch('/password-recovery', null, JSON.stringify(user_info), { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', false)
    return await this._fetch('/first-rest-end-point', null, JSON.stringify(data), { 'Content-Type': 'application/json;charset=UTF-8' }, 'POST', false)
      .then((response) => {
        return Promise.resolve(response);
      })
      .catch((response) => {
        console.error(response);
        return Promise.reject(response);
      });
  }

  /**
   * Log the current user out. It also kills the session within Drupal and removes the token from local storage.
   * Along with user data.
   *
   * @returns {Promise<{data: string, message: string, status: number}>}
   * @constructor
   */
  async userLogout() {
    const uid = this.userGetUid();
    // const res = await this._fetch('/user/' + uid, null, null, null, 'POST', true)
    const res = this._fetch('/user/' + uid, null, null, null, 'POST', true)

    // Delete our local copies as well now that Drupal has logged us out.
    localStorage.removeItem(this.config.user_info);
    // In case we need to update the UI.

    return true;
  }

  getUserRole() {
    const user_info = this.userGetLoggedInData();
    if (user_info?.roles?.includes(USER_TYPE.KURE_EMPLOYEE) || user_info?.roles?.includes(USER_TYPE.ADMIN)) {
      return USER_TYPE.KURE_EMPLOYEE;
    }
    // A customer is not an employee or an admin. We seem it's a customer if they are authenticated.
    else if (!user_info?.roles?.includes(USER_TYPE.KURE_EMPLOYEE) && !user_info?.roles?.includes(USER_TYPE.ADMIN) &&
      user_info?.roles?.includes(USER_TYPE.CUSTOMER)) {
      return USER_TYPE.CUSTOMER;
    }
    // They must not be authenticated/signed in.
    return null;
  }

  /**
   * From local storage, get user's data. Includes uid, username, email, roles.
   *
   * @returns {*|string}
   */
  userGetLoggedInData() {
    const data = localStorage.getItem(this.config.user_info)
    if (data) {
      return JSON.parse(data);
    }
    return false;
  }

  /**
   * From local storage, get user's name.
   *
   * @returns {*|string}
   */
  userGetName() {
    const data = localStorage.getItem(this.config.user_info)
    if (data) {
      return JSON.parse(data).username;
    }
    return false;
  }

  /**
   * From local storage, get user's UID.
   *
   * @returns {*|string}
   */
  userGetUid() {
    const data = localStorage.getItem(this.config.user_info)
    if (data) {
      return JSON.parse(data).uid;
    }
    return false;
  }

  /**
   * Retrieve the user's profile data such as name, email, uid, etc.
   *
   * @returns {Promise<boolean>}
   */
  async userGetProfileData() {
    return await this._fetch('/me-resource', null, null, null, 'GET', true);
  }

  /**
   * Store an OAuth token retrieved from Drupal in localStorage.
   *
   * @param {object} data
   * @returns {object}
   *   Returns the token with an additional expires_at property added.
   */
  async oAuthTokenSave(data) {
    // Make a copy of data object.
    const token = { ...data };
    token.name = 'token';
    token.date = Math.floor(Date.now() / 1000);
    token.expires_at = token.date + token.expires_in;
    //localStorage.setItem(this.config.token_name, JSON.stringify(token));
    const db = new KureDatabase();
    await db.put([token], IDB_TABLES.config_data);
    return token;
  }

  /**
   * From local storage, get the current OAuth token if there is one.
   *
   * @returns object|boolean
   *   Returns the current token, or false.
   */
  async tokenCurrent() {
    const db = new KureDatabase();
    return await db.get('token', IDB_TABLES.config_data);
  }

  /**
   * Request a new token using a refresh_token.
   *
   * This function is smart about reusing requests for a refresh token. So it is
   * safe to call it multiple times in succession without having to worry about
   * whether a previous request is still processing.
   */
  async tokenRefresh() {
    const token = await this.tokenCurrent();
    // if (!token) {
    //   await Promise.reject();
    // }
    // const { expires_at, refresh_token } = token;
    // if (expires_at - this.config.expire_margin < Date.now() / 1000) {
    //   // Note that the data in the request is different when getting a new token
    //   // via a refresh_token. grant_type = refresh_token, and do NOT include the
    //   // scope parameter in the request as it'll cause issues if you do.
    //   const form_data = new FormData();
    //   form_data.append('grant_type', 'refresh_token');
    //   form_data.append('client_id', this.config.client_id);
    //   form_data.append('client_secret', this.config.client_secret);
    //   form_data.append('refresh_token', refresh_token);
    //
    //   return await this._fetch('/oauth/token', null, form_data, null, 'POST', false);
    // }
    // return Promise.resolve(token);
    const { expires_at, refresh_token } = token;
    const form_data = new FormData();
    form_data.append('grant_type', 'refresh_token');
    form_data.append('client_id', this.config.client_id);
    form_data.append('client_secret', this.config.client_secret);
    form_data.append('refresh_token', refresh_token);

    return await this._fetch('/oauth/token', null, form_data, null, 'POST', false);
  }

  /**
   * We assume the user is logged in if they have a token in local storage.
   *
   * @returns {boolean}
   */
  async isLoggedIn() {
    return (await this.tokenCurrent()) ? true : false;
  }

  /**
   * Included the token parameter because if we send data from a service worker (a background thread), it won't have
   * access to the localStorage.
   *
   * @param resource_path
   * @param parameters
   * @param body
   * @param headers
   * @param method
   * @param with_authentication
   * @param token
   * @returns {Promise<{data: string, message: string, status: number}>}
   * @private
   */
  async _fetch(resource_path, parameters = null, body = null, headers = null, method = 'GET', with_authentication = false) {
    if (parameters !== null) {
      resource_path += '?' + Object.keys(parameters).map((key) => {
        return `${key}=${encodeURIComponent(parameters[key])}`;
      }).join('&');
    }

    let response;
    let options = {
      method: method,
      headers: new Headers(),
    };
    // When using the Drupal REST API, we need to use Accept: 'application/vnd.api+json'. When resetting a user's
    // password, we need to use 'Content-Type': 'application/json;charset=UTF-8'.
    if (headers !== null) {
      for (const property in headers) {
        options.headers.append(property, headers[property]);
      }
    }

    if (body !== null) {
      options.body = body;
    }
    if (!with_authentication) {
      response = await this.fetchWithoutAuthentication(resource_path, options);
    } else {
      response = await this.fetchWithAuthentication(resource_path, options);
    }
    // console.log("RESPONSE: ", response);
    if (response == "offline") {
      let message = "";
      if (resource_path == "/order-data") {
        message = "We will save your data but you're currently offline.\nWe will submit your data when you're back online."
      } else {
        message = "The device is offline.";
      }
      return Promise.resolve({
        status: false,
        message: message,
        data: null,
      })
    }
    if (response == null) {
      return Promise.reject({
        status: false,
        message: "Login first",
        data: null,
      })
    }
    let _data = '';
    await response.json().then((data) => {
      _data = data;
    })
      .catch((error) => {
        _data = '';
      });

    let response_body = {
      status: response.status,
      message: response.message,
      data: _data,
    };

    switch (response.status) {
      case 200:
        return Promise.resolve(response_body);

      default:
        return Promise.reject(response_body);
    }
  }

  /**
   * Wrapper for fetch() that will attempt to add a Bearer token if present.
   *
   * @param {string} url URL to fetch.
   * @param {object} options Options for fetch().
   */
  async fetchWithAuthentication(url, options) {
    try {
      const token = await this.tokenCurrent();
      // console.log("TOKEN>>>", token)
      if (!token) {
        console.error('auth failed.')
        return null;
      }
      options.headers.append('Authorization', `Bearer ${token.access_token}`);
      return await fetch(`${this.config.base}${url}`, options);
    } catch (err) {
      const is_online = await idbGetIsOnline();
      if (is_online == false) {
        console.log("offline");
        return 'offline';
      }
      console.log("ERROR");
      return null;
    }
  }

  async fetchWithoutAuthentication(url, options) {

    try {
      return await fetch(`${this.config.base}${url}`, options);
    } catch (err) {
      const is_online = await idbGetIsOnline();
      if (is_online == false) {
        console.log("offline");
        return 'offline';
      }
      console.log("ERROR");
      return null;
    }
  }

  decryptData = (encryptedString) => {
    // Need password using pbkdf2 because of bits issue on javascript side
    // as openssl_encrypt direct secrets conflicts with cryptoJS.
    let key256Bits = CryptoJS.PBKDF2("3nnZPnF8s2vqa9kZKPjgzSW", "PjEFd9cNgcKVULbfryvG6xgSg6BEWV4dFPrvhPyGNnszW4TVDAexkH5rG", {
      keySize: 256 / 32,
      iterations: 1000,
      hasher: CryptoJS.algo.SHA256
    });
    let rawData = window.atob(encryptedString);
    let rawPieces = rawData.split(":");
    let cryptText = rawPieces[0];
    let iv = CryptoJS.enc.Hex.parse(rawPieces[1]);
    let cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(cryptText) });
    let plaintextArray = CryptoJS.AES.decrypt(
      cipherParams,
      key256Bits,
      { iv: iv }
    );
    return CryptoJS.enc.Utf8.stringify(plaintextArray);
  }

  /**
   * Run a query to /oauth/debug and output the results to the console.
   */
  debug() {
    const headers = new Headers({
      Accept: 'application/vnd.api+json'
    });

    this.fetchWithAuthentication('/oauth/debug?_format=json', { headers })
      .then((response) => response.json())
      .then((data) => {
        console.log('debug', data);
      });
  }
}

export { Resource };
