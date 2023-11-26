import { Grid, Stack, Typography } from '@mui/material';
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import AuthWrapper from 'components/AuthWidgets/AuthWrapper';
import { Resource } from 'services/api_services/Resource';
const resource = new Resource();

const UserVerifyPage = () => {
    const cssShow = {
        ml: 4,
        pl: 0,
        py: 0,
        width: 'calc(100% - 32px)',
        color: '#FFF'
    };
    const { uid, timestamp, hash } = useParams();

    useEffect(() => {
        resource.verifyUserEmail(uid, timestamp, hash)
            .then((response) => {
                resource.oAuthTokenSave(response.data);
            }).catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <AuthWrapper>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline"
                        sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                    </Stack>
                </Grid>
                <Grid item xs={12} sx={cssShow}>
                    <div>Please wait, while we are verifying account details ...</div>
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default UserVerifyPage;