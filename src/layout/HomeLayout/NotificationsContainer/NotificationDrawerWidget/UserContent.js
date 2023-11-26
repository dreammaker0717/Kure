import React, { useContext, useEffect, useState } from 'react';
import { useGesture } from 'react-use-gesture';

import {
  Box,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserContentRow from "layout/HomeLayout/NotificationsContainer/NotificationDrawerWidget/UserContentRow";
import DeckCards from "../../../../swipeable/deck";

const typeHeader = {
  fontWeight: "bold",
  fontSize: {
    xs: 14,
    md: 18
  },
  color: "white",
  background: "#333333",
}
const typeContainer = {
  color: "white",
  background: "#2e2e2e"
}

const MessagesAccordion = ({ messages, title, onClickMessage, onDeleteMessage }) => (
  <Accordion sx={typeContainer} defaultExpanded={true}>
    <AccordionSummary
      sx={typeHeader}
      expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
      aria-controls={`${title}`}
      id={`${title}`}
    >
      <Typography sx={{ fontWeight: 'bold', fontSize: "18px" }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {messages.length == 0 ? <Box sx={{ textAlign: "center", fontSize: "14px" }}>
        Nothing yet
      </Box> :
        messages.map(message => (
          <Box key={message.id}>
            <DeckCards initialItems={[message]}
              onClickMessage={onClickMessage}
              onDeleteMessage={onDeleteMessage} />
          </Box>
        ))
      }
    </AccordionDetails>
  </Accordion>
);

const UserContent = (props) => {
  const { openNotificationDrawer } = props;
  const { profileData } = useContext(UsersProfileContext);
  const [messages, setMessages] = useState([]);
  const db = new KureDatabase();

  useEffect(() => {
    db.getAll(IDB_TABLES.background_messages).then((data) => {
      console.log("background_messages view: ", data)
      setMessages(data)
    }).catch((err) => {
      console.log("background_messages err: ", err)
    });
  }, [openNotificationDrawer]);

  const onClickMessage = async (message) => {
    console.log("CC MESSAGE: ", message);
  };

  const handleDeleteMessage = async (message) => {
    // Handle deletion of message here
    console.log('Deleting message:', message);
    await db.deleteAllByIdList([message.id], IDB_TABLES.background_messages);
  };

  return (
    <Box>
      <MessagesAccordion title="Push notifications" messages={messages} onClickMessage={onClickMessage}
        onDeleteMessage={handleDeleteMessage} />
    </Box>
  );
};

export default UserContent;
