import PropTypes from 'prop-types';

// material-ui
import { Box } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, ...other }) => (
    <MainCard
        sx={{
            maxWidth: { xs: 500, lg: 580 },
            margin: { xs: 2, md: 3 },
            background: '#272727',
            '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
            }
        }}
        content={false}
        {...other}
        border={false}
        borderRadius={false}
        // boxShadow
        // shadow={(theme) => theme.customShadows.z1}
    >
        <Box sx={{ p: { xs: 0, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </MainCard>
);

AuthCard.propTypes = {
    children: PropTypes.node
};

export default AuthCard;
