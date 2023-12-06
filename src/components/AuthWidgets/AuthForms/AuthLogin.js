import React, { useEffect, useState } from 'react';
import { Resource } from "services/api_services/Resource";
import Required from 'assets/images/icons/required.svg';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import { Formik } from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import CircularProgress from '@mui/material/CircularProgress';
import { broadcastMessage, } from 'Common/functions';
import {
  SIG_AUTH_CHANGED,
  SIG_REQUEST_ADJUSTMENT_DATA,
  SIG_REQUEST_COUPON_DATA,
  SIG_REQUEST_USERS_PROFILE,
  SIG_ORDER_LIST_CHANGED
} from 'Common/signals';
import { clearAuthInfo, } from 'services/storage_services/storage_functions';
import { idbSetLoggedInUser } from 'services/idb_services/configManager';
import { eventUserLoggedIn, fetchOrderNotification } from "services/idb_services/orderManager";
import { idbCustomerLoggedIn } from 'services/idb_services/userManager';
import { USER_TYPE } from 'Common/constants';

const resource = new Resource();
const db = new KureDatabase();

const AuthLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams(location.search);

  const [keepMeSignedIn, setKeepMeSignedIn] = useState(localStorage.getItem('keep_me_signed_in') === 'true');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    clearAuthInfo();
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          username: '',
          password: '',
          submit: null
        }}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          localStorage.setItem('keep_me_signed_in', keepMeSignedIn ? 'true' : 'false');
          setIsBusy(true);
          resource.login(values.username, values.password).then((response) => {
            console.log('1. login', response);
            resource.oAuthTokenSave(response.data).then((res) => {
              console.log('2. oAuthTokenSave');
              setStatus({ success: true });

              resource.userGetProfileData().then(async (user_data) => {
                console.log('3. userGetProfileData', user_data);
                // We'll use this later on to determine if we should close their session when the browser is closed.

                localStorage.setItem(resource.config.user_info, JSON.stringify(user_data.data));
                idbSetLoggedInUser(JSON.stringify(user_data.data));
                // Send our subscription request.

                resource.savePushMessagingSubscription(user_data.data);

                // send request to drupal, to get users pin data, if needed.
                resource.allUsersPinData().then((el) => {
                  db.usersPinData().count().then((count) => {
                    if (!count) {
                      db.usersPinData().put([{ key: 0, value: el.data }]).then((res) => {
                        // console.log(res);
                      });
                    }
                  });
                }).catch((error) => {
                  console.log(error);
                });

                await eventUserLoggedIn(user_data.data);
            
                broadcastMessage(SIG_REQUEST_USERS_PROFILE);
                broadcastMessage(SIG_REQUEST_COUPON_DATA);
                broadcastMessage(SIG_AUTH_CHANGED)
                broadcastMessage(SIG_REQUEST_ADJUSTMENT_DATA)

                setIsBusy(false);
                // Redirect to the front page.
                if (searchParams.get("redirect") != null) {
                  navigate(searchParams.get("redirect"));
                } else {
                  navigate('/');
                }
              })
                .catch((error) => {
                  setIsBusy(false);
                  console.log(error);
                });
            });
          }).catch((error) => {
            setIsBusy(false)
            // setStatus({ success: false });
            setErrors({ submit: error['data']['message'] });
            setSubmitting(false);
          });
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="email-login"
                    sx={{
                      fontSize: '1em',
                      color: '#FFF',
                      '&::after': {
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        margin: '0 0.3em',
                        content: '""',
                        verticalAlign: 'super',
                        backgroundImage: `url(${Required})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '6px 6px'
                      }
                    }}
                  >
                    Username
                  </InputLabel>
                  <OutlinedInput
                    id="username-login"
                    type="username"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter username"
                    fullWidth
                    sx={{ background: '#FFF' }}
                    error={Boolean(touched.username && errors.username)}
                  />
                  <Typography sx={{ fontSize: '0.85em', color: '#FFF' }}>Enter your Kure Wellness username.</Typography>
                  {touched.username && errors.username && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.username}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel
                    htmlFor="password-login"
                    sx={{
                      fontSize: '1em',
                      color: '#FFF',
                      '&::after': {
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        margin: '0 0.3em',
                        content: '""',
                        verticalAlign: 'super',
                        backgroundImage: `url(${Required})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '6px 6px'
                      }
                    }}
                  >
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ background: '#FFF' }}
                    // endAdornment={
                    //     <InputAdornment position="end">
                    //         <IconButton
                    //             aria-label="toggle password visibility"
                    //             onClick={handleClickShowPassword}
                    //             onMouseDown={handleMouseDownPassword}
                    //             edge="end"
                    //             size="large"
                    //         >
                    //             {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    //         </IconButton>
                    //     </InputAdornment>
                    // }
                    placeholder="Enter password"
                  />
                  <Typography sx={{ fontSize: '0.85em', color: '#FFF' }}>
                    Enter the password that accompanies your username.
                  </Typography>
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={keepMeSignedIn}
                        onChange={(event) => setKeepMeSignedIn(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="h6" sx={{ color: '#FFF' }}>
                        Keep me signed in
                      </Typography>
                    }
                  />
                </Stack>
              </Grid>
              {errors.submit != undefined && errors.submit != "" && (
                <Grid item xs={12}>
                  <FormHelperText sx={{ textAlign: "center", fontSize: 14 }} error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color='info'
                    sx={{ background: '#32beb9' }}
                  >
                    {isBusy && <CircularProgress sx={{ color: 'white', marginRight: "10px" }} size={'15px'} />} Login
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
