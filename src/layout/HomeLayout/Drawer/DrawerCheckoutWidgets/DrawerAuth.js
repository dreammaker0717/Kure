import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import HeaderLogin from 'components/AuthWidgets/HeaderLogin';
import { AuthPageType } from 'Common/constants';

const DrawerAuth = () => {
    const [method, setMethod] = useState(null);

    return (
        <div>
            {
                method === null &&
                <>
                    <Box sx={{ pt: '60px' }}>
                        <Typography variant={'h2'} sx={{ fontWeight: '400', fontSize: { xs: "20px", md: '30px' }, }}>
                            Already have an account?
                        </Typography>
                        <Button
                            onClick={() => setMethod(AuthPageType.Login)}
                            variant="outlined"
                            color="info"
                            fullWidth
                            sx={{
                                color: 'white',
                                mt: '24px',
                                border: '1px solid',
                                //'&:hover': {textDecoration: 'underline'},
                                background: '#32beb9'
                            }}
                        >
                            LOGIN
                        </Button>

                    </Box>
                    <Box sx={{ pt: '60px' }}>
                        <Typography variant={'h2'} sx={{ fontWeight: '400', fontSize: { xs: "20px", md: '30px' } }}>
                            Don't have an account?
                        </Typography>
                        <Button
                            //href="/register"
                            variant="outlined"
                            color="info"
                            onClick={() => setMethod(AuthPageType.Register)}
                            fullWidth
                            sx={{
                                color: 'white',
                                mt: '24px',
                                border: '1px solid',
                                '&:hover': { textDecoration: 'underline' },
                                background: '#32beb9'
                            }}
                        >
                            CREATE AN ACCOUNT
                        </Button>
                    </Box>
                </>
            }

            <Box sx={{ pt: '60px' }}>
                {method === AuthPageType.Login && <HeaderLogin checkLayout={method} typeLayout={'panel'} />}
                {method === AuthPageType.Register && <HeaderLogin checkLayout={method} typeLayout={'panel'} />}
            </Box>

        </div>
    );
};

export default DrawerAuth;