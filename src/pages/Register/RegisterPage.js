import { Grid, Stack } from '@mui/material';
import AuthWrapper from 'components/AuthWidgets/AuthWrapper';
import AuthRegister from 'components/AuthWidgets/AuthForms/AuthRegister';
import { AuthPageType } from 'Common/constants';
import HeaderLogin from 'components/AuthWidgets/HeaderLogin';
const RegisterPage = () => {
    return (
        <AuthWrapper>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                        <HeaderLogin checkLayout={AuthPageType.Register} />
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <AuthRegister />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default RegisterPage;