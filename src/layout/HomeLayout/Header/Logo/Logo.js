import logo from 'assets/images/icons/kure_logo.svg';
import logoTablets from 'assets/images/icons/isotype.png';
import {
  Box
} from '@mui/material';

const Logo = ({ checkfooter }) => {
  return (
    <>
      {checkfooter ? (
        <Box>
          <img src={logo} alt="Kure Wellness"/>
        </Box>
      ) : (
        <>
          <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
            <img src={logo} alt="Kure Wellness"/>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }}>
            <img src={logoTablets} alt="Kure Wellness"/>
          </Box>
        </>
      )}
    </>
  );
};

export default Logo;
