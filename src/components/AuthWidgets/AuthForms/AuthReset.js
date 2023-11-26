import {
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import Required from 'assets/images/icons/required.svg';
import { Resource } from "../../../services/api_services/Resource";

const resource = new Resource();

function AuthReset() {
  return (
    <Formik
      initialValues={{
        email: '',
        submit: null
      }}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        resource.passwordReset(values.email).then((response) => {
          let response_json = JSON.parse(response);
          if(!response_json.error) {
            setStatus({success: true, message: response_json.message});
          }
          else {
            console.log(response_json.message);
            setStatus({ success: false });
            setErrors({ email: response_json.message });
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
                  Email address
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
                <Typography sx={{ fontSize: '0.85em', color: '#FFF' }}>
                  Password reset instructions will be sent to your registered email address.
                </Typography>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
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

export default AuthReset;
