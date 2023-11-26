import {
  Box,
  Button, FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Formik } from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import Required from 'assets/images/icons/required.svg';
import { Resource } from "../../../services/api_services/Resource";
import {strengthColor, strengthIndicator} from "utils/password-strength";
import * as Yup from "yup";
import { idbSetLoggedInUser } from 'services/idb_services/configManager';

const resource = new Resource();

function AuthPasswordReset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(localStorage.getItem('keep_me_signed_in') === 'true');
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

  const changePassword = (value) => {
    setPassword(value);
  };

  useEffect(() => {
    changePassword('');
  }, []);
  // uid/:timestamp/:hash
  let { uid, timestamp, hash } = useParams();

  return (
    <Formik
      initialValues={{
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string().max(255).required('Password is required'),
        confirmPassword: Yup.string().max(255).required('Password is required').oneOf([Yup.ref('password')], 'Passwords does not match'),
        // confirmPassword: Yup.string().max(255).required('Confirm Password is required')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        resource.passwordUpdate(values.password, uid, hash, timestamp).then((response) => {
          let response_json = JSON.parse(response);
          if(!response_json.error) {

            // If no errors we want to login user and redirect to homepage.
            resource.login(response_json.username, values.password)
              .then((token_object) => {
                setStatus({ success: true });
                resource.userGetProfileData().then((profile) => {
                  if (profile) {
                    // We'll use this later on to determine if we should close their session when the browser is closed.
                    localStorage.setItem('keep_me_signed_in', keepMeSignedIn ? 'true' : 'false');
                    // Save their username.
                    localStorage.setItem(resource.config.user_info, profile[0].name);
                    idbSetLoggedInUser(profile[0].name);
                    // Redirect to the front page.
                    navigate('/');
                  }
                }).catch((error) => {
                  console.log(error);
                });
              }).catch((error) => {
              setStatus({ success: false });
              setErrors({ submit: error });
              setSubmitting(false);
            });

            setStatus({success: true, message: response_json.message});
          }
          else {
            console.log(response_json.message);
            setStatus({ success: false });
            setErrors({ submit: response_json.message });
          }
        }).catch((error) => {
          console.log(error);
          setStatus({ success: false });
          setErrors({ submit: error });
          setSubmitting(false);
        });
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
                  placeholder="************"
                  inputProps={{}}
                />
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
              </Stack>
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
                  placeholder="************"
                  inputProps={{}}
                />
                <Typography variant="subtitle1" fontSize="0.75rem" sx={{ display: 'flex' }}>
                  Passwords match:
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
                  Provide new password for account in both fields.
                </InputLabel>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.confirmPassword}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <AnimateButton>
                {touched.submit && errors.submit && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.submit}
                  </FormHelperText>
                )}
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ background: '#32beb9' }}
                >
                  Submit
                </Button>

              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

export default AuthPasswordReset;
