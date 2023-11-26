import AuthWrapper from 'components/AuthWidgets/AuthWrapper';
import React from 'react';
import { Grid, Stack } from '@mui/material';
import HeaderLogin from 'components/AuthWidgets/HeaderLogin';
import AuthLogin from 'components/AuthWidgets/AuthForms/AuthLogin';
import { AuthPageType } from 'Common/constants';

const LoginPage = () => {
    return (
        <AuthWrapper>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                        <HeaderLogin checkLayout={AuthPageType.Login} />
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <AuthLogin />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default LoginPage;