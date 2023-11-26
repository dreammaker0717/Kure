import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Typography, Grid, Box, Button, Input, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { getTokenworksDataAll } from 'services/idb_services/userManager';
import {
  addUpdateCustomerData, removeSelectedCustomer,
} from 'services/idb_services/customerManager';
import {
  SIG_AUTH_CHANGED, SIG_CHANNEL,
  SIG_TOKENWORKS_SYNCED,
  SIG_REQUEST_USERS_PROFILE,
  SIG_REQUEST_COUPON_DATA,
  SIG_REQUEST_ADJUSTMENT_DATA
} from 'Common/signals';
import { broadcastMessage, clickOutSide, formatUser, getUUID } from 'Common/functions';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { CouponDataContext } from 'services/context_services/couponDataContext';
import LoadingWidget from 'components/Loading/LoadingWidget';
import CustomerMgrModal from 'components/CustomerMgrModal/CustomerMgrModal';
import { addCustomerToCart, getCart, getCustomerIdFromCart } from "services/idb_services/orderManager";
import { getStoreId } from "services/storage_services/storage_functions";
import { Resource } from "services/api_services/Resource";
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { CartDataIndex, useCartData } from 'services/context_services/cartDataContext';
import { customToast } from 'components/CustomToast/CustomToast';

const CustomerSelectWidget = (props) => {
  const uuid = getUUID();
  const customerObject = {
    uid: uuid,
    // To prevent duplicate submissions to Drupal.
    uid_react: uuid,
    mail: '',
    name: '',
    is_medical_user: 'No',
    medical_user_info: {
      expiration_date: '',
      license: '',
    },
    user_addresses: {},
    roles: [],
    has_changed: true,
  };
  const { profileData, setProfileData } = useContext(UsersProfileContext);
  const { values: commonData, setValue: setCommonData } = useCommonData();
  const { values: cartData, setValue: setCartData } = useCartData();

  const [selectedCustomer, setSelectedCustomer] = useState(customerObject);
  const [tokenworks, setTokenworks] = useState(null);
  const [customerList, setCustomerList] = useState({});
  const [openList, setOpenList] = useState(false);
  const boxSearchRef = useRef(null);
  // const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const is_logged_in = commonData[CommonDataIndex.IS_LOGGED_IN];
  const keyword = cartData[CartDataIndex.CUSTOMER_KEYWORD];
  const setKeyword = (v) => {
    setCartData(CartDataIndex.CUSTOMER_KEYWORD, v);
  }

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };


  useEffect(() => {
    // Within SelectCustomerInfoWidget, we may receive a signal to remove customer information from the
    // 'search for customer' textfield.
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      switch (event.data.type) {
        case SIG_AUTH_CHANGED:
          setSelectedCustomer(customerObject);
          // setProfileData([]);
          setCustomerList([]);
          break;
        case SIG_TOKENWORKS_SYNCED:
          console.log("new_customer----", event.data);
          let new_customer = event.data.data;
          console.log("new_customer----", new_customer);
          profileData[new_customer.uid] = { ...new_customer };
          await setProfileData(profileData);
          setSelectedCustomer(customerObject);
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (boxSearchRef.current == null) return;
    if (boxSearchRef.current) {
      clickOutSide(boxSearchRef, e => {
        setCustomerList({});
      });
    }
  }, [boxSearchRef.current])

  useEffect(() => {
    getTokenworksDataAll().then((rows) => {
      setTokenworks(rows);
    }).catch((err) => {
      console.log(err);
    });

    async function fetchData() {
      // On first page load, profileData is empty.
      if (Object.keys(profileData).length) {
        const cart = (await getCart()).data;
        if (!cart || profileData[cart.customer_id] == null) {
          return;
        }
        const customer = profileData[cart.customer_id];
        const customer_formatted = formatUser(customer);
        setKeyword(customer_formatted);
      }
    }

    fetchData();
  }, [profileData])

  useEffect(() => {
    if (!isFocused) {
      setOpenList(false)
      setCustomerList({});
      return;
    }
    // 'keyword' variable isn't empty, a user must be typing a keyword. Display the list.
    else {
      setOpenList(true)
    }

    startTransition(() => {
      const _keyword = keyword.toLowerCase();

      const keyword_parts = _keyword.split(" ");

      const filtered_user_data = Object.fromEntries(
        Object.entries(profileData).filter(([key, item]) => {
          const search_fields = [
            item.uid,
            item.mail,
            item.name,
            ...Object.values(item.user_addresses).map((address) =>
              [
                (address.address && address.address.address_line1) && address.address.address_line1,
                (address.address && address.address.given_name) && address.address.given_name,
                (address.address && address.address.family_name) && address.address.family_name,
                (address.address && address.phone) && address.phone,
              ].join(" ")
            )
          ];

          const combined_fields = search_fields.join(" ").toLowerCase();
          try {
            const regex = new RegExp(
              `^(?=.*${keyword_parts.join(")(?=.*")}).*$`,
              "gi"
            );
            return regex.test(combined_fields);
          } catch (err) {
            return false;
          }
        })
      );
      const key_list = Object.keys(filtered_user_data).slice(0, 10);
      const slice_list = Object.fromEntries(Object.entries(filtered_user_data).filter(([key, item]) => {
        if (key_list.includes(key)) return true;
        return false;
      }))
      setCustomerList(slice_list);
    });
  }, [keyword]);

  const linkCustomer = async (customer) => {
    if (customer == undefined) {
      return;
    }
    const customer_formatted = formatUser(customer);
    setKeyword(customer_formatted);
    await addCustomerToCart(customer.uid);

    // broadcastMessage(SIG_CUSTOMER_SELECTED);
  }

  const onClickTokenworksList = async (row) => {
    const customer = profileData[row.uid];
    await linkCustomer(customer);
  }

  const onClickCustomerSelectList = async (customer) => {
    await linkCustomer(customer);
  }

  const onClickAddCustomer = () => {
    // Ensure the object is always new.
    setSelectedCustomer(customerObject);
    setDialogOpen(true);
  }

  const onRegisterNewAccount = async (customer) => {
    // console.log("Registering new account: ", customer);

    // A newly created account must be merged with our profileData manually because this won't happen until
    // the page is refreshed.
    let new_profile = { ...profileData, [customer.uid]: customer };
    setProfileData(new_profile);
    const customer_formatted = formatUser(customer);
    setKeyword(customer_formatted);

    await addCustomerToCart(customer.uid);
    // Add new customer to the customer_data table.
    const new_customer_res = await addUpdateCustomerData(customer);

    if (new_customer_res.status == true) {
      const new_customer = new_customer_res.data;
      await addCustomerToCart(new_customer.uid);

      // update context with newly updated customer
      await
        // delete old customer with guid
        delete new_profile[customer.uid];

      // add new customer.
      new_profile[new_customer.uid] = { ...new_customer };
      await setProfileData(new_profile);
    } else {
      // delete old customer with guid
      delete new_profile[customer.uid];
      setProfileData(new_profile);
      setKeyword("");
      // removeSelectedCustomer
      removeSelectedCustomer(customer.uid);
      customToast.error(new_customer_res.message)
    }
  }

  if (!is_logged_in) {
    return <></>
  }

  if (profileData.length === 0) {
    return <div style={{ textAlign: 'center' }}>
      <LoadingWidget
        text={"Loading customer information, please wait."}
      />
    </div>
  }
  return (
    <Box sx={{ width: "100%", pb: "10px" }}>
      {tokenworks != null && <>
        <Box sx={{ mt: "20px", mb: "20px" }}>
          <Typography
            variant="h3"
            component="div"
          >
            Select a customer
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          width: "100%",
          gap: '1.5em',
          pb: "1.5em",
          flexWrap: 'wrap',
          ml: "20px"
        }}>

          {tokenworks.map((row, index) => {
            // console.log("tokenworks: ", row);

            return (
              <Box
                key={`tokenworks-${row.uid}-${index}`}
                sx={{
                  display: 'flex',
                  // Light blue means it's linked, while orange means
                  color: row.uid === null ? "rgb(255,255,255)" : "rgb(50 190 185)",
                  fontSize: "18px",
                }}
              >
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ flexGrow: 1, cursor: row.uid !== null ? 'pointer' : 'inherit' }}
                  onClick={() => {
                    onClickTokenworksList(row);
                  }}
                >
                  {row['first_name']} {row['last_name']}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </>
      }
      <div style={{ marginBottom: "10px" }}>
        {
          dialogOpen &&
          <CustomerMgrModal
            open={dialogOpen}
            profileData={profileData}
            onClose={() => {
              setDialogOpen(false)
            }}
            onOK={async (customer) => {
              setDialogOpen(false);
              await onRegisterNewAccount(customer);
            }}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
        }
        <Button
          onClick={onClickAddCustomer}
          variant="outlined"
          color="info"
          sx={{
            color: 'white',
            mt: '10px',
            border: '1px solid',
            background: '#32beb9'
          }}
        >
          Register new account
        </Button>
      </div>
      <Typography>SEARCH FOR CUSTOMER</Typography>
      <Box
        sx={{
          backgroundColor: '#414242',
          borderRadius: '20px'
        }}
      >
        <Input
          value={keyword}
          fullWidth
          onChange={e => {
            setKeyword(e.target.value);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disableUnderline={true}
          endAdornment={
            <InputAdornment position="end" sx={{ pr: "20px" }}>
              <SearchIcon sx={{ color: '#cecece' }} />
            </InputAdornment>
          }
          placeholder="Search by name, address, phone, or email"
          sx={{
            color: '#cecece',
            fontSize: { xs: '0.8rem', sm: '1rem' },
            '& .MuiInputBase-input': {
              p: '6px 12px 7px 20px',
            },
          }}
        />
      </Box>
      <Box sx={{ width: "100%", position: "relative", pl: "10px", pr: "30px", }}>
        <List
          ref={boxSearchRef}
          sx={{
            maxHeight: "30vh", overflowY: 'auto', pt: 0,
            display: (Object.entries(customerList).length > 0 && openList == true) ? "display" : "none",
            position: "absolute", top: 0, left: 0,
            zIndex: 999, backgroundColor: "#515252",
            width: "95%"
          }}
        >
          {Object.entries(customerList).map(([key, customer]) => {
            // console.log(customer);
            const customer_info = Object.entries(customer.user_addresses).map((value) => {
              if (value.length < 2) return null;
              const user_data = value[1];
              let result = `${user_data?.address?.given_name} ${user_data?.address?.family_name}`;
              if (user_data?.phone) result += `, ${user_data?.phone}`;
              if (user_data?.address?.address_line1) result += `, ${user_data?.address?.address_line1}`;
              if (user_data?.address?.address_line2) result += `,${user_data?.address?.address_line2}`;
              if (user_data?.address?.locality) result += `,${user_data?.address?.locality}`;
              if (user_data?.address?.administrative_area) result += `,${user_data?.address?.administrative_area}`;
              return result;
            }).filter(x => x != null);

            return <ListItem
              key={`customer-item-${customer.mail}-${key}`}
              className="custom-button noselect"
              sx={{
                backgroundColor: "#515252",
                pt: 0, pb: 0
              }}
              onClick={async () => {
                await onClickCustomerSelectList(customer);
              }}
            >
              <ListItemText
                // sx={{ pt: 0, pb: 0 }}
                primary={customer.mail}
                secondary={
                  customer_info.length == 0
                    ? <></>
                    :
                    customer_info.map((value, index) => {
                      return <span
                        style={{ marginLeft: "10px" }}
                        key={`typo-${value}-${index}`}>
                        {value}
                        <br />
                      </span>
                    })
                }

              />

            </ListItem>
          })}
        </List>
      </Box>
    </Box>
  );
};

export default CustomerSelectWidget;