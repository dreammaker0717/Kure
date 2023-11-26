import { Box, Button, FormHelperText, Grid, InputLabel, OutlinedInput, Stack } from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import InputMaskWidget from 'components/InputMaskWidget';
import { PhoneRegExp } from 'Common/constants';
import { useContext, useEffect, useState } from "react";
import { getGUID, getUUID } from "Common/functions";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { addBillingProfileToCart, getCart } from 'services/idb_services/orderManager';
import { addOrUpdateOneAddress } from 'services/idb_services/addressManager';

const AddressMgrWidget = (props) => {
  const uuid = getUUID();
  const { profileData, setProfileData } = useContext(UsersProfileContext);
  const { onSubmit, addressList, titleColor } = props;
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {

    getCart().then((res) => {
      const { data, status } = res;
      const cartInfo = data;
      const billing_info = cartInfo.billing_profile;
      if (Object.keys(addressList).length == 0 || status == false || !cartInfo || billing_info == null || billing_info == undefined || Object.keys(billing_info) == 0) {
        setSelectedAddress({});
        setIsNew(true);
      } else {
        const selected_address = Object.entries(billing_info)[0];
        const profile_id = selected_address[0];
        const address_body = selected_address[1];
        // The phone number. Our form is expecting the phone property within the address property.
        address_body.address.phone = address_body.phone ?? '';
        address_body.address.profile_id = profile_id;

        setSelectedAddress(address_body.address);
        setIsNew(false);
      }
    })
  }, []);

  console.log("selectedAddress::: ", selectedAddress)
  const cssStart = {
    fontSize: '1em',
    color: titleColor == undefined ? "#FFF" : titleColor,
    '&::after': {
      display: 'inline-block',
      width: '6px',
      height: '6px',
      margin: '0 0.3em',
      content: '""',
      verticalAlign: 'super',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '6px 6px'
    }
  };


  if (addressList === undefined) {
    return <></>;
  }

  const onClickSubmit = async (values) => {
    const res = await addOrUpdateOneAddress(values, profileData);
    if (res == false) {
      console.log(res);
    }
    const { new_profile_data, new_address, new_uid } = res.data;
    setProfileData(new_profile_data);
    setTimeout(async () => {
      await addBillingProfileToCart({ [new_uid]: new_address });
      onSubmit();
    }, 200);
  }

  return (
    <Box sx={{ pt: '10px', pb: "30px" }}>
      {selectedAddress !== null && (
        <Formik initialValues={Object.keys(selectedAddress).length == 0 ? ({
          // We need profile_id or else our submit handler will not work.
          "profile_id": uuid,
          // To prevent duplicate submissions to Drupal.
          "profile_id_react": uuid,
          "country_code": "",
          "given_name": "",
          "family_name": "",
          "address_line1": "",
          "address_line2": "",
          "locality": "",
          "administrative_area": "",
          "postal_code": "",
          "phone": "",
        }) : selectedAddress}
                validationSchema={Yup.object().shape({
                  address_line1: Yup.string().max(255).required('Address is required'),
                  locality: Yup.string().max(255).required('City is required'),
                  administrative_area: Yup.string().max(255).required('State is required'),
                  postal_code: Yup.string().max(255).required('Zip code is required'),
                  country_code: Yup.string().max(2).required('Country is required'),
                  given_name: Yup.string().max(255).required('First name is required'),
                  family_name: Yup.string().max(255).required('Last name is required'),
                  phone: Yup.string()
                  .required('Phone number is required')
                  .test('phone-style', 'Phone number is not valid', (v) => {
                    if (v === undefined || v === '') return false;
                    return v.match(PhoneRegExp) !== null;
                  })
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                  onClickSubmit(values)
                }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup" sx={cssStart}>
                      First Name <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.given_name && errors.given_name)}
                      id="country-checkout"
                      type="given_name"
                      value={values.given_name}
                      name="given_name"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="First Name"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.given_name && errors.given_name && (
                      <FormHelperText error id="helper-text-country-checkout">
                        {errors.given_name}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup" sx={cssStart}>
                      Last Name <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.family_name && errors.family_name)}
                      id="country-checkout"
                      type="country"
                      value={values.family_name}
                      name="family_name"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Last Name"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.family_name && errors.family_name && (
                      <FormHelperText error id="helper-text-country-checkout">
                        {errors.family_name}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel sx={cssStart}>
                      Address1 <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.address_line1 && errors.address_line1)}
                      type="address_line1"
                      value={values.address_line1}
                      name="address_line1"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Address"
                      sx={{ background: '#FFF', marginTop: 0 }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.address_line1 && errors.address_line1 &&
                      <FormHelperText error>{errors.address_line1}</FormHelperText>}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel sx={cssStart}>Address2</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.address_line2 && errors.address_line2)}
                      id="address-checkout"
                      type="address_line2"
                      value={values.address_line2}
                      name="address_line2"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Address2"
                      sx={{ background: '#FFF', marginTop: 0 }}
                      inputProps={{}}
                      required={false}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel sx={cssStart}>
                      City <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.locality && errors.locality)}
                      id="address-checkout"
                      type="address"
                      value={values.locality}
                      name="locality"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="City"
                      sx={{ background: '#FFF', marginTop: 0 }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.locality && errors.locality && <FormHelperText error>{errors.locality}</FormHelperText>}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="state-checkout" sx={cssStart}>
                      State <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.administrative_area && errors.administrative_area)}
                      id="administrative_area-checkout"
                      type="administrative_area"
                      value={values.administrative_area}
                      name="administrative_area"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="State"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.administrative_area && errors.administrative_area && (
                      <FormHelperText error id="administrative_area-checkout">
                        {errors.administrative_area}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup" sx={cssStart}>
                      ZIP Code <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.postal_code && errors.postal_code)}
                      id="postal_code-checkout"
                      type="postal_code"
                      value={values.postal_code}
                      name="postal_code"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Zip code"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.postal_code && errors.postal_code && (
                      <FormHelperText error id="helper-text-postal_code-checkout">
                        {errors.postal_code}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup" sx={cssStart}>
                      Country <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.country_code && errors.country_code)}
                      id="country_code-checkout"
                      type="country_code"
                      value={values.country_code}
                      name="country_code"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Country"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                    />
                    {touched.country_code && errors.country_code && (
                      <FormHelperText error id="helper-text-country_code-checkout">
                        {errors.country_code}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup" sx={cssStart}>
                      Phone Number <code style={{ color: 'red' }}>*</code>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.phone && errors.phone)}
                      id="phone-checkout"
                      type="phone"
                      value={values.phone}
                      name="phone"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      sx={{ background: '#FFF' }}
                      inputProps={{}}
                      required={true}
                      inputComponent={InputMaskWidget}
                    />
                    {touched.phone && errors.phone && (
                      <FormHelperText error id="helper-text-phone-checkout">
                        {errors.phone}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                {errors.submit && (
                  <Grid item xs={12} sm={6} md={6}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Button
                        disableElevation
                        disabled={isSubmitting}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        color="info"
                        sx={{ background: '#32beb9' }}
                      >
                        Save address
                      </Button>
                    </Grid>

                    <Grid item xs={4}>
                      <Button
                        disableElevation
                        disabled={isSubmitting}
                        fullWidth
                        size="large"
                        variant="contained"
                        color="error"
                        sx={{ background: '#FF494B' }}
                        onClick={() => {
                          onClickSubmit(selectedAddress)
                        }}
                      >
                        Cancel Edit
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default AddressMgrWidget;