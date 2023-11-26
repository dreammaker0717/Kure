import { Box, Button, Grid, Tabs, Tab } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";

import { ROUTE } from 'routes/CONSTANTS';
import AuthLogin from 'components/AuthWidgets/AuthForms/AuthLogin';
import AuthRegister from 'components/AuthWidgets/AuthForms/AuthRegister';
import AuthReset from 'components/AuthWidgets/AuthForms/AuthReset';
import { AuthPageType } from 'Common/constants';

function HeaderLogin({ checkLayout, typeLayout }) {
    const navigate = useNavigate();
    const [authType, setAuthType] = useState(AuthPageType.Login);
    const cssActive = {
        textAlign: 'center',
        backgroundColor: '#32beb9',
        display: 'flex',
        color: '#fff'
    };
    const cssInactive = {
        textAlign: 'center',
        backgroundColor: '#414242',
        display: 'flex'
    };
    const getStyle = (index) => {
        if (authType == index) {
            return cssActive;
        } else {
            return cssInactive;
        }
    };
    const onClickLogin = (route) => {
        if (typeLayout === 'panel') {
            setAuthType(AuthPageType.Login)
        } else {
            navigate({ pathname: route })
        };
    }
    const onClickRegister = (route) => {
        if (typeLayout === 'panel') {
            setAuthType(AuthPageType.Register)
        } else {
            navigate({ pathname: route })
        };
    }
    const onClickReset = (route) => {
        if (typeLayout === 'panel') {
            setAuthType(AuthPageType.Reset);
        } else {
            navigate({ pathname: route })
        };
    }
    useEffect(() => {
        if (checkLayout == undefined) return;
        setAuthType(checkLayout);
    }, [checkLayout])

    return (
        <>         
            <Grid
                container
                item
                sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: '10px',
                }}
                justifyContent="space-between"
            >
                <Grid item sx={getStyle(AuthPageType.Login)}>
                    <Button
                        onClick={() => { onClickLogin(ROUTE.LOGIN) }}
                        variant="body1"
                        sx={{ textDecoration: 'none', width: '100%', padding: '0.2em 1em', color: '#FFF' }}
                    >
                        Log in
                    </Button>
                </Grid>
                <Grid item sx={getStyle(AuthPageType.Register)}>
                    <Button
                        onClick={() => { onClickRegister(ROUTE.REGISTER) }}
                        variant="body1"
                        sx={{ textDecoration: 'none', width: '100%', padding: '0.2em 1em', color: '#FFF' }}
                    >
                        Create new account
                    </Button>
                </Grid>
                <Grid item sx={getStyle(AuthPageType.Reset)}>
                    <Button
                        onClick={() => { onClickReset(ROUTE.PW_RESET) }}
                        variant="body1"
                        sx={{ textDecoration: 'none', width: '100%', padding: '0.2em 1em', color: '#FFF' }}
                    >
                        Reset your password
                    </Button>
                </Grid>

                {
                    typeLayout === 'panel' && (
                        <Box sx={{ pt: '60px' }}>
                            {authType === AuthPageType.Login && (<AuthLogin />)}
                            {authType === AuthPageType.Register && (<AuthRegister />)}
                            {authType === AuthPageType.Reset && (<AuthReset />)}
                        </Box>
                    )
                }

            </Grid>
        </>
    );
}

export default HeaderLogin;
