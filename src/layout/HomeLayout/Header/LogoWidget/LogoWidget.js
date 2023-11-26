import React from 'react';
import logo from 'assets/images/icons/kure_logo.svg';
import logoTablets from 'assets/images/icons/isotype.png';
import { ButtonBase, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTE } from 'routes/CONSTANTS';


const LogoWidget = () => {
    const checkfooter = false;
    return (
        <ButtonBase disableRipple component={Link} to={ROUTE.HOME}
            sx={{ '& img': { width: '100%' } }}>
            {checkfooter ? (
                <Box>
                    <img src={logo} alt="Kure Wellness" />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
                        <img src={logo} alt="Kure Wellness Md" />
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }}>
                        <img src={logoTablets} alt="Kure Wellness Sm" />
                    </Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none', md: 'none' }, height: "50px" }}>
                        <img src={logoTablets} style={{ width: "50px" }} alt="Kure Wellness Xs" />
                    </Box>
                </>
            )}
        </ButtonBase>
    );
};

export default LogoWidget;