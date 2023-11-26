import React, { useContext } from 'react';
import {
  Button,
  Grid,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Boxider,
  Skeleton,
  Typography
} from "@mui/material";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { convertTimestampToDate, firstLetterUpperCase, getLastFiveString, machineNameToLabel } from 'Common/functions';
import { CHECKOUT_TYPE } from "Common/constants";

const UserContentRow = (props) => {
  const { message, onClickMessage } = props;
  const { profileData } = useContext(UsersProfileContext);
  const styles = {
    spacing: {
      marginRight: '10px',
    },
  };

  const getProfileById = (profile_id) => {
    const profile = profileData[profile_id];
    if (profile == undefined) return "";
    return profile['name']
  }

  return (
    <Box sx={{
      fontSize: "14px",
      p: "5px",
      borderBottom: "1px solid gray",
      transition: "all 500ms ease",
      background: message['order_id'] == message.id ? "#161616" : "transparent",
      "&:hover": {
        cursor: "pointer",
        background: message['order_id'] == message.id ? "#161616" : "gray",
      },
    }}
         onClick={() => onClickMessage(message)}
    >
      <Box>
        <span>{message.payload.title}</span><br/>
        <span>{message.payload.body}</span>
      </Box>
    </Box>
  );
};

export default UserContentRow;