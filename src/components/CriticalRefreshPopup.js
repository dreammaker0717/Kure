import { Typography } from '@mui/material';
import logo from '../assets/images/kure_logo_transparent.png';

const CriticalRefreshPopup = (props) => {

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        margin: 0
      }}
    >
      <img alt="logo" src={logo} style={{ maxWidth: '298px', width: '100%' }}/>
      <Typography className="text-size-h2" sx={{ color: '#FFFFFF' }}>
        Warning
      </Typography>
      <Typography className="text-size-h3" sx={{ color: '#FFFFFF', mt: "20px" }}>
        App reset.
      </Typography>
    </div>
  );
};

export default CriticalRefreshPopup;
