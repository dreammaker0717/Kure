import React, { useState } from 'react';
import { Box, Grid, useMediaQuery } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationWidget from './NotificationWidget';
import './headerStyles.css';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ProfileImg from './../../../../assets/images/users/avatar-3.png';

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Grid row container className='headerContainer' alignItems="center">
        <Grid item xs={12} sm={6} md={6}>
          <div className='plan-dropdown'>
            <Button onClick={handleClick}>
              <h3> Today's Plan <KeyboardArrowDownIcon/></h3>
              <p> March 27th, 2023</p>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Item 1</MenuItem>
              <MenuItem onClick={handleClose}>Item 2</MenuItem>
              <MenuItem onClick={handleClose}>Item 3</MenuItem>
            </Menu>
          </div>
          {!matchesXs && <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}></Box>}
          {matchesXs && <Box sx={{ width: '100%', ml: 1 }}/>}
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <div className='right-side'>
            <NotificationWidget/>
            <div className='profile-details'>
              <Button onClick={handleClick}>
                <img src={ProfileImg} alt="profile"/>
                <div>
                  <h3> Mykola Ledenov </h3>
                  <p> CEO Niled</p>
                </div>

              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Item 1</MenuItem>
                <MenuItem onClick={handleClose}>Item 2</MenuItem>
                <MenuItem onClick={handleClose}>Item 3</MenuItem>
              </Menu>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default HeaderContent;