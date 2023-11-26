import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  ListItemIcon,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Collapse
} from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import FirebaseSocial from './FirebaseSocial';
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Required from 'assets/images/icons/required.svg';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Resource } from "../../../services/api_services/Resource";
import Toast from "components/Toast";
import { broadcastMessage } from 'Common/functions';
import { SIG_AUTH_CHANGED } from 'Common/signals';

const resource = new Resource();

// ============================|| FIREBASE - REGISTER ||============================ //

const AuthRegister = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [hideCorrect, sethideCorrect] = useState([]);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(true);
  const [captchaNumber, setCaptchaNumber] = useState([]);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    setPassword(value);
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp.strengths));
    sethideCorrect(temp.correct);
  };

  const comparePassword = (value) => {
    setConfirmPassword(value === password);
  };
  const cssStart = {
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
  };
  const cssShow = {
    display: 'list-item',
    ml: 4,
    pl: 0,
    py: 0,
    width: 'calc(100% - 32px)',
    color: '#FFF'
  };

  const handleChangeCheck = (event) => {
    setChecked(event.target.checked);
  };

  const handleClickOpen = () => {
    setOpen(!open);
  };

  const getRandomIntInclusive = (min, max) => {
    const number1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const number2 = Math.floor(Math.random() * (max - min + 1)) + min;
    setCaptchaNumber([number1, number2]);
  };

  useEffect(() => {
    changePassword('');
    getRandomIntInclusive(5, 10);
  }, []);

  const [messageToast, setMessageToast] = useState('');

  return (
    <>
      <Toast messageToast={messageToast} setMessageToast={setMessageToast}/>
      <Formik
        initialValues={{
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          checked: false,
          captCha: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          username: Yup.string().max(255).required('Username is required'),
          password: Yup.string().max(255).required('Password is required'),
          confirmPassword: Yup.string().max(255).required('Password is required'),
          // captCha: Yup.string().max(2).required('CAPTCHA is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          resource.register(values.email, values.username, values.password).then((response) => {
            console.log(response);
            broadcastMessage(SIG_AUTH_CHANGED)
          }).catch((error) => {
            console.log(error);
            setStatus({ success: false });
            setErrors({ submit: error });
            setSubmitting(false);
          })
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup" sx={cssStart}>
                    Email Address
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ background: '#FFF' }}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.email}
                    </FormHelperText>
                  )}
                  <InputLabel sx={{ textOverflow: 'none', whiteSpace: 'inherit', color: '#FFF' }}>
                    A valid email address. All emails from the system will be sent to this address. The email address is
                    not made public and will only be used if you wish to receive a new password or wish to receive
                    certain news or notifications by email.
                  </InputLabel>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup" sx={cssStart}>
                    Username
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.username && errors.username)}
                    id="username-login"
                    type="username"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo123"
                    sx={{ background: '#FFF' }}
                    inputProps={{}}
                    required={true}
                  />
                  {touched.username && errors.username && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.username}
                    </FormHelperText>
                  )}
                  <InputLabel sx={{ textOverflow: 'none', whiteSpace: 'inherit', color: '#FFF' }}>
                    Several special characters are allowed, including space, period (.), hyphen (-), apostrophe ('),
                    underscore (_), and the @ sign.
                  </InputLabel>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup" sx={cssStart}>
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
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
                    placeholder="************"
                    inputProps={{}}
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="helper-text-password-signup">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container direction="column">
                    <Grid item>
                      <Box sx={{ bgcolor: '#FFF', width: '55%', height: 8, borderRadius: '7px' }}>
                        <Box sx={{ bgcolor: level?.color, width: level?.width, height: 8, borderRadius: '7px' }}/>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem" sx={{ color: '#FFF' }}>
                        Password strength: {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ color: '#FFF' }}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="confirmPassword-signup" sx={cssStart}>
                    Confirm password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirmPassword-signup"
                    type={'password'}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    sx={{ background: '#FFF' }}
                    onChange={(e) => {
                      handleChange(e);
                      comparePassword(e.target.value);
                    }}
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
                    placeholder="************"
                    inputProps={{}}
                  />
                  <Typography variant="subtitle1" fontSize="0.75rem" sx={{ display: 'flex' }}>
                    Passwords match:&nbsp;
                    <Typography
                      sx={[
                        { ml: 1, fontSize: '0.75rem', color: 'red' },
                        confirmPassword && {
                          color: 'green'
                        }
                      ]}
                    >
                      {confirmPassword ? 'Yes' : 'No'}
                    </Typography>
                  </Typography>
                  <InputLabel sx={{ textOverflow: 'none', whiteSpace: 'inherit', color: '#FFF' }}>
                    Provide a password for the new account in both fields.
                  </InputLabel>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <FormHelperText error id="helper-text-password-signup">
                      {errors.confirmPassword}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              {password.toString().length > 0 && (
                <Grid item xs={12}>
                  <Stack spacing={1} sx={{ border: 'solid #ccc 1px' }}>
                    <List
                      sx={{ listStyleType: 'disc' }}
                      subheader={
                        <ListSubheader
                          component="div"
                          id="nested-list-subheader"
                          sx={{ pl: 1, color: '#FFF', background: '#272727' }}
                        >
                          Recommendations to make your password stronger:
                        </ListSubheader>
                      }
                    >
                      {!hideCorrect.includes(1) && (
                        <ListItem sx={cssShow}>
                          <ListItemText primary="Make it at least 12 characters"/>
                        </ListItem>
                      )}
                      {!hideCorrect.includes(2) && (
                        <ListItem sx={cssShow}>
                          <ListItemText primary="Add lowercase letters"/>
                        </ListItem>
                      )}
                      {!hideCorrect.includes(3) && (
                        <ListItem sx={cssShow}>
                          <ListItemText primary="Add uppercase letters"/>
                        </ListItem>
                      )}
                      {!hideCorrect.includes(4) && (
                        <ListItem sx={cssShow}>
                          <ListItemText primary="Add numbers"/>
                        </ListItem>
                      )}
                      {!hideCorrect.includes(5) && (
                        <ListItem sx={cssShow}>
                          <ListItemText primary="Add punctuation"/>
                        </ListItem>
                      )}
                    </List>
                  </Stack>
                </Grid>
              )}
              <Grid item xs={12} sx={{ color: '#FFF' }}>
                <FormControlLabel
                  control={<Checkbox checked={values.checked} sx={{ '& .MuiSvgIcon-root': { fontSize: 38 } }}/>}
                  label="Wholesale account request"
                  name="checked"
                  onChange={handleChange}
                />
              </Grid>
              {/*<Grid item xs={12} sx={{ color: '#FFF' }}>*/}
              {/*  <Box sx={{ border: '1px solid #ccc' }}>*/}
              {/*    <Typography sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}*/}
              {/*                onClick={handleClickOpen}>*/}
              {/*      {open ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}*/}
              {/*      CAPTCHA*/}
              {/*    </Typography>*/}
              {/*    <Collapse in={open} timeout="auto" unmountOnExit sx={{ padding: '0.5em 1.5em' }}>*/}
              {/*      <Typography>*/}
              {/*        This question is for testing whether or not you are a human visitor and to prevent automated*/}
              {/*        spam submissions.*/}
              {/*      </Typography>*/}
              {/*      <Box sx={{ display: 'flex' }}>*/}
              {/*        <Typography sx={cssStart}>Math question</Typography>*/}
              {/*        <Typography>{captchaNumber[0] + ' + ' + captchaNumber[1] + ' ='}</Typography>*/}
              {/*      </Box>*/}
              {/*      <OutlinedInput*/}
              {/*        fullWidth*/}
              {/*        error={Boolean(touched.captCha && errors.captCha)}*/}
              {/*        id="captCha-login"*/}
              {/*        type="text"*/}
              {/*        value={values.captCha}*/}
              {/*        name="captCha"*/}
              {/*        onBlur={handleBlur}*/}
              {/*        onChange={handleChange}*/}
              {/*        sx={{ background: '#FFF' }}*/}
              {/*        inputProps={{}}*/}
              {/*      />*/}
              {/*      {touched.captCha && errors.captCha && (*/}
              {/*        <FormHelperText error id="helper-text-email-signup">*/}
              {/*          {errors.captCha}*/}
              {/*        </FormHelperText>*/}
              {/*      )}*/}
              {/*      <Typography sx={{ fontSize: '0.85em' }}>*/}
              {/*        Solve this simple math problem and enter the result. E.g. for 1+3, enter 4.*/}
              {/*      </Typography>*/}
              {/*    </Collapse>*/}
              {/*  </Box>*/}
              {/*</Grid>*/}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
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
                    color = 'info'
                    sx={{ background: '#32beb9' }}
                  >
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
              {/* <Grid item xs={12}>
                                <Divider>
                                    <Typography variant="caption">Sign up with</Typography>
                                </Divider>
                            </Grid> */}
              {/* <Grid item xs={12}>
                                <FirebaseSocial />
                            </Grid> */}
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
