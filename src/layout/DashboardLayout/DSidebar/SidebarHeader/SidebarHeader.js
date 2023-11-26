
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from 'assets/images/kure_logo_gray.png';
import { useNavigate } from 'react-router';
import { ROUTE } from 'routes/CONSTANTS';
const SidebarHeaderStyled = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-start' : 'center',
    paddingLeft: theme.spacing(open ? 3 : 0)
}));

const SidebarHeader = (props) => {
    const navigate = useNavigate();
    const { open } = props;
    const theme = useTheme();
    const onClickLogo = () => {
        navigate(ROUTE.HOME)
    }
    return (
        <SidebarHeaderStyled theme={theme} open={open}>
            <Box sx={{ width: "100%", p: "10px", height: "80px",mb:"40px" }}
                onClick={onClickLogo}
            >
                <img
                    src={logo}
                    alt='dashboard-logo'
                    style={{ cursor: "pointer", maxHeight: '100%', margin: "auto" }}
                />

                <Chip size="small" label="Dashboard" />

            </Box>
        </SidebarHeaderStyled>
    );
};

export default SidebarHeader;