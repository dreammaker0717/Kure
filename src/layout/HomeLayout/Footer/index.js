import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, ButtonBase, Typography, Grid } from '@mui/material';
import Logo from '../Header/Logo/Logo';
import ContentFooter from './ContentFooter';

import phoneIcon from 'assets/images/icons/phone.svg';
import mailIcon from 'assets/images/icons/mail.svg';
import licenseIcon from 'assets/images/icons/license.svg';
import locationIcon from 'assets/images/icons/location.svg';
import facebookIcon from 'assets/images/icons/like.svg';
import twitterIcon from 'assets/images/icons/tiwterIcon.svg';
import instagramIcon from 'assets/images/icons/instagram.svg';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { getNotificationPermission } from 'services/storage_services/state_services';
import { Resource } from "../../../services/api_services/Resource";
import { USER_TYPE } from '../../../Common/constants';
import { useEffect } from 'react';
import { ROUTE } from 'routes/CONSTANTS';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { makeStyles } from '@mui/styles';
import StoreSelectModal from '../../../components/SetNotificationModal/SetNotificationModal';

const NotificationGroup = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row-reverse",
  position: "fixed",
  right: "20px",
  bottom: "65px",
  cursor: "pointer"
};

const NotificationBtnStyle = {
  color: '#32BEB9',
  padding: '10px',
  width: '60px',
  height: '60px',
  fontSize: 15,
  background: "black",
  borderRadius: "0px 10px 10px 0px"
};

const NotificationTextStyle = {
  color: 'white',
  fontSize: 15,
  background: "black",
  maxHeight: "60px",
  fontFamily: "bold",
  padding: "20px 0px 20px 10px",
  borderRadius: "10px 0px 0px 10px",
  cursor: "pointer"
};

const NotificationTextStyle2 = {
  position: "fixed",
  right: "87px",
  bottom: "58px",
  color: 'white',
  fontSize: 15,
  fontFamily: "bold",
  background: "black",
  padding: "18px 10px",
  borderRadius: "10px 0px 0px 10px",
  cursor: "pointer"
}

const useStyles = makeStyles({
  animatedButton: {
    animation: '$moveDown 0.5s infinite alternate', // Animation properties
  },
  '@keyframes moveDown': {
    '0%': {
      transform: 'translateY(0)', // Initial position
    },
    '100%': {
      transform: 'translateY(10px)', // Translated 10px down
    },
  },
});

const db = new KureDatabase();

function Footer() {
  const { values: commonData } = useCommonData();
  const selStoreId = commonData[CommonDataIndex.SEL_STORE];
  const [openNotificationModal, setOpenNotificationModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const classes = useStyles();
  const isLogin = localStorage.getItem('kure-user-info');
  const [footerContents, setFooterContents] = useState([
    {
      title: 'Contact us',
      data: [
        {
          text: '',
          icon: phoneIcon,
          link: false
        },
        {
          text: '',
          icon: mailIcon,
          link: true
        },
        {
          text: '',
          icon: licenseIcon,
          link: false
        },
        {
          text: '',
          icon: locationIcon,
          link: false
        }
      ]
    },
    {
      title: 'Connect with us',
      data: [
        {
          text: 'Like us on Facebook',
          icon: facebookIcon,
          link: true
        },
        {
          text: 'Follow us on Twitter',
          icon: twitterIcon,
          link: true
        },
        {
          text: 'Find us on Instagram',
          icon: instagramIcon,
          link: true
        }
      ]
    },
    {
      title: 'Company',
      data: [
        {
          text: 'About us',
          icon: null,
          link: true
        },
        {
          text: 'Farm stories',
          icon: null,
          link: true
        },
        {
          text: 'Mendo Fever article',
          icon: null,
          link: true
        },

        {
          text: 'Press release',
          icon: null,
          link: true
        }
      ]
    }
  ]);

  useEffect(() => {
    onChangedStoreId(selStoreId);
  }, [selStoreId]);

  const onChangedStoreId = (store_id) => {
    db.get(`${store_id}`, IDB_TABLES.commerce_store).then((data) => {
      if (data === undefined) return;
      setFooterContents(([prev, ...rest]) => [
        {
          title: 'Contact us',
          data: [
            {
              text: data.phone,
              icon: phoneIcon,
              link: false
            },
            {
              text: data.email,
              icon: mailIcon,
              link: true
            },
            {
              text: data.license,
              icon: licenseIcon,
              link: false
            },
            {
              text: data.address1 + data.address2 + ', ' + data.city,
              icon: locationIcon,
              link: false
            }
          ]
        },
        ...rest
      ]);
    });
  };

  useEffect(() => {
    async function getPermission() {
      const notificaionPermission = await getNotificationPermission();
      console.log("notificaionPermission", notificaionPermission);

      if (notificaionPermission) {
        setNotificationPermission(false);
        console.log("truetruetruetrue");
      } else {
        setNotificationPermission(true);
        console.log("falsefalsefalsefalsefalse");
        const isShowModal = localStorage.getItem('isNotificationNodalShow');
        if (isShowModal == null) {
          localStorage.setItem('isNotificationNodalShow', "true");
          setOpenNotificationModal(true);
        }
      }
    }

    getPermission();
  }, []);

  const onClickChangeNotification = () => {
    setOpenNotificationModal(true);
  };

  const setOpenNotification = () => {
    setOpenNotificationModal(false);
  }

  return (
    <Box sx={{ p: 2 }}>
      <StoreSelectModal
        open={openNotificationModal}
        onOK={(v) => {
          setOpenNotification();
        }}
        onCancel={(v) => {
          setOpenNotificationModal(false);
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: '40%', lg: 'auto' } }}>
          <Box m={'10px'}>
            <ButtonBase
              component={Link}
              to={ROUTE.HOME}
              sx={{ pl: '1rem', '& img': { width: '225px', height: '113px' } }}
            >
              <Logo checkfooter={true} />
            </ButtonBase>
          </Box>
          <Typography component="p" sx={{ '&.MuiTypography-root': { mb: '1rem', ml: '10px' } }}>
            © {new Date().getFullYear()} Kure Wellness
          </Typography>
        </Box>
        {footerContents.map((content, index) => (
          <ContentFooter content={content} key={index} />
        ))}
      </Box>
      {notificationPermission ? (isLogin == null ?
        <div style={NotificationGroup} className={classes.animatedButton}>
          <NotificationsActiveIcon style={NotificationBtnStyle} variant="contained" onClick={onClickChangeNotification} />
          <Typography style={NotificationTextStyle} onClick={onClickChangeNotification}>Enable Notification</Typography>
        </div> : <Typography style={NotificationTextStyle2} onClick={onClickChangeNotification}>Enable Notification</Typography>)
        : <></>}
    </Box>
  );
}

export default Footer;
