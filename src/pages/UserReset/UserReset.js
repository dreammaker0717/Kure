import { Grid, Stack } from '@mui/material';
import AuthWrapper from 'components/AuthWidgets/AuthWrapper';
import AuthPasswordReset from 'components/AuthWidgets/AuthForms/AuthPasswordReset';
import { AuthPageType } from 'Common/constants';
import HeaderLogin from 'components/AuthWidgets/HeaderLogin';
const UserReset = () => {
    return (
        <AuthWrapper>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline"
                        sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                        <HeaderLogin checkLayout={AuthPageType.Reset} />
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <AuthPasswordReset />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default UserReset;