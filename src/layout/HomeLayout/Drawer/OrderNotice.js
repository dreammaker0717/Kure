import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    margin: '20px 0',
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    color: theme.palette.text.primary,
  },
  bodyText: {
    color: theme.palette.text.secondary,
  },
  strongText: {
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
}));

function OrderNotice({ orderNumber, destinationName, address, phone }) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box marginBottom={2}>
          <Typography variant="h5" component="h2" className={classes.title} gutterBottom>
            Your order #{orderNumber}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body1" className={classes.bodyText} gutterBottom>
            Sent to:
          </Typography>
          <Typography variant="body1" component="strong" className={classes.strongText} gutterBottom>
            {destinationName}
          </Typography>
          <Typography variant="body1" className={classes.bodyText} gutterBottom>
            {address} <br/>
            {phone}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default OrderNotice;
