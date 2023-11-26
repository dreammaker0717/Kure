import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DrawerProductAddWidget from "layout/HomeLayout/Drawer/DrawerCheckoutWidgets/DrawerProductAddWidget";
import { Button, Grid, BottomNavigation, BottomNavigationAction, Box, Divider, Skeleton, Typography } from "@mui/material";
import React, { useState } from "react";
import CameraEnhanceIcon from "@mui/icons-material/CameraEnhance";
import ProductQRCaptureModal from "components/ProductQRCaptureModal/ProductQRCaptureModal";
import { Resource } from "services/api_services/Resource";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import PendingIcon from '@mui/icons-material/Pending';
import TitleIcon from '@mui/icons-material/Title';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import Image from 'components/Image/index';
import { addProductToHistory } from 'services/idb_services/productHistoryManager';
import { customToast } from 'components/CustomToast/CustomToast';

const cssCamera = {
  display: 'flex',
  cursor: 'pointer',
  color: '#32BEB9',
  ':hover': {
    color: '#44ffbb'
  },
  width: '40px',
  height: '40px',
};
const cssSkeleton = {
  backgroundColor: "rgb(233 233 233)",
  mb: "10px"
}

const db = new KureDatabase();
const resource = new Resource();
const Reconciliation = () => {
  

  const [openQRPane, setOpenQRPane] = useState(false);
  const [isDeletion, setIsDeletion] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [scannedHistory, setScannedHistory] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  // const [variationDetails, setVariationDetails] = useState({
  //   0: {
  //     title: '',
  //     stock: '',
  //     package_uid: '',
  //     variation_id: '',
  //     store_id: '',
  //     received_amount: '',
  //     metrc_stock: '',
  //   }
  // });
  const [variationDetails, setVariationDetails] = useState([]);
  const [packageUid, setPackageUid] = useState('');
  const [scanData, setScanData] = useState([]);
  const [value, setValue] = React.useState(0);
  const [selHistory, setSelHistory] = useState(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [capturedQRImage, setCapturedQRImage] = useState(null);

  function setProductData(variation) {
    // console.log(variation);
    setIsBusy(true);

    // We must get the product level details. This is because under a product we can have multiple variations.
    resource.getInventoryReconciliationData({
      action: 'product_details',
      store_id: 2,
      package_uid: variation.package_uid
    }).then((details) => {
      setIsBusy(false);
      // Response will contain the variations found under this product.
      console.log(details);

      const product = details.data.product;
      const variations = details.data.variations;

      setProductDetails({
        product_id: product.product_id,
        title: product.title,
        retail_price: product.retail_price,
        product_type: product.product_type,
        strain: product.strain,
        product_image: product.product_image,
        is_cannabis: product.is_cannabis,
        store_name: product.store_name,
      });

      const variation_ids = variations.map(x => x.variation_id);
      console.log("variation_ids: ", variation_ids)
      db.getAllFromValueList("variation_id", variation_ids, IDB_TABLES.product_data).then((res) => {
        console.log('variations: ', res);
        setVariationDetails(res);
      })

      // setVariationTitle(variation.title);
      // setVariationKureStock(variation.stock);
      // setPackageUid(variation.package_uid);
      //
      // db.get(variation.store_id, IDB_TABLES.commerce_store).then((res) => {
      //   setVariationStore(res.name);
      // }).catch((err) => {
      //   setVariationStore('N/A');
      // });
      //
      resource.getInventoryReconciliationData({
        action: 'metrc_stock',
        store_id: 2,
        package_uid: variation.package_uid
      }).then((res) => {
        console.log("metrc_stock: ", res);
        setVariationMetrcStock(res.data.stock_metrc);
      }).catch((err) => {
        console.log(err);
      });
      //
      resource.getInventoryReconciliationData({
        action: 'scan_details',
        store_id: 2,
        package_uid: variation.package_uid,
        // variation_id: variation.variation_id
      }).then((res) => {
        console.log("scan_details: ", res);
        setScanData(res.data);
      }).catch((err) => {
        console.log(err);
      });

    }).catch((err) => {
      console.log(err);
    });
  }

  const onClickProduct = async (variation) => {
    setProductData(variation);
    const package_uid = variation.package_uid;
    const label = "0";
    const add_result = await addProductToHistory(package_uid, label);
    setScannedHistory(add_result);
    setProductData(add_result[0]);
  };

  const onQrScan = async (package_uid_with_count) => {
    // package_uid_with_count will contain a dash and a number at the end of the string, i.e. 1A406030004086D000034503-1
    // We need to remove the dash and the number from the string to get the package_uid.
    const package_uid = package_uid_with_count.split('-')[0];
    const label = package_uid_with_count.split('-')[1];
    const add_result = await addProductToHistory(package_uid, label);

    // if (add_result.length == 0) return;
    setScannedHistory(add_result);
    setProductData(add_result[0]);
    setOpenQRPane(false);
  };
  const onCapturedQRImage = async (img_data) => {
    setCapturedQRImage(img_data);
  }

  const onClickOpenQR = (is_delete) => {
    setIsDeletion(is_delete);
    setOpenQRPane(true);
  };
  // console.log("scanned history>> ", scannedHistory);
  console.log("selHistory>>", selHistory)
  return (
    <>
      {openHistoryModal && <Dialog
        open={openHistoryModal}
        onClose={() => (setOpenHistoryModal(false))}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#0e0e0e',
            color: "white"
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "20px" }}>
          Product scan history
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selHistory[0].title}
          </DialogContentText>

          <Timeline>
            {selHistory.map((history) => {
              return (
                <TimelineItem key={history.label}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"

                  >
                    <Typography variant="h6" component="span">
                      {`Label #${history.label}`}

                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector />
                    {/* {Object.keys(scanData[history]).length > 1 && (
                    <TimelineDot sx={{ backgroundColor: '#000000', color: '#ff9a00' }}>
                      <WarningIcon />
                    </TimelineDot>
                    )} */}
                    {/* {Object.keys(scanData[history]).length === 1 && ( */}
                    <TimelineDot sx={{ p: 0, backgroundColor: '#00ff6f', color: '#000000' }}>
                      <CheckCircleIcon />
                    </TimelineDot>
                    {/* )} */}
                    {/* {Object.keys(scanData[history]).length === 0 && (
                      <TimelineDot sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                        <PendingIcon />
                      </TimelineDot>
                    )} */}
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0', textAlign: 'left', flex: 2 }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    {new Date(history.created).toLocaleDateString("en-US")}
                  </TimelineOppositeContent>
                </TimelineItem>
              );
            })}
          </Timeline>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => (setOpenHistoryModal(false))}>
            OK
          </Button>
        </DialogActions>
      </Dialog>}


      <Box sx={{ display: 'flex', width: '496px', margin: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {openQRPane &&
            <ProductQRCaptureModal
              open={openQRPane}
              isDeletion={isDeletion}
              onCapturedImage={onCapturedQRImage}
              onClose={() => {
                setOpenQRPane(false)
              }}
              onQrScan={onQrScan}
            />
          }
          <Typography sx={{ fontSize: 14, mb: '.5em!important' }} color="text.secondary" gutterBottom>
            Find a product via a manual search or scan a QR code to begin.
          </Typography>
          <Box sx={{ display: 'flex', mb: '15px', gap: '1em' }}>
            <DrawerProductAddWidget onClickProduct={onClickProduct} />
            <CameraEnhanceIcon
              sx={cssCamera}
              onClick={() => onClickOpenQR(false)}
            />
          </Box>
          <Box>
            {capturedQRImage && <img src={capturedQRImage} alt="qrcode" />}
          </Box>
          <Divider variant="middle" sx={{ mt: '1em', mb: '1em', borderColor: '#313030' }} />
          {isBusy && <>
            <Skeleton variant="rounded" height={40} sx={cssSkeleton} />
            <Skeleton variant="rounded" height={40} sx={cssSkeleton} />
            <Grid alignItems={'center'} container spacing={2}>
              <Grid item xs={4}>
                <Skeleton variant="rounded" height={80} sx={cssSkeleton} />
              </Grid>
              <Grid item xs={8}>
                <Skeleton sx={cssSkeleton} />
                <Skeleton sx={cssSkeleton} />
                <Skeleton sx={cssSkeleton} />
              </Grid>
            </Grid>
          </>}
          {!isBusy && productDetails && (
            <>
              <Box sx={{ display: 'flex', mb: '15px', flexDirection: 'column' }}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                        <TitleIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={productDetails.title} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                        <StoreIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`Store: ${productDetails.store_name}`} />
                  </ListItem>
                </List>
              </Box>

              {/* Variant details */}
              <Box>
                {variationDetails && variationDetails.length > 0 && variationDetails.map(variation_info => {
                  return <Box sx={{ mb: "10px" }} key={variation_info.variation_id}>
                    <Grid
                      container
                      rowSpacing={1}
                      sx={{ '&.MuiGrid-container': { m: '0 -16px 0 0', maxWidth: '100vw' } }}
                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    >
                      <Grid item xs={12} sm={6} sx={{ '&.MuiGrid-item': { p: '0 1rem' } }}>
                        <Box width="100%" height="100%">
                          {variation_info?.product_image && (
                            <Image src={variation_info?.product_image} alt="" sx={{ height: '100%' }} />
                          )}
                          {!variation_info?.product_image && <Skeleton variant="rectangular" height="100%" width="100%" sx={{ bgcolor: '#fff' }} />}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ '&.MuiGrid-item': { p: '0 1rem' } }}>
                        <Typography
                          component="h1"
                          sx={{
                            fontSize: { xs: "18px", md: '36px' },
                            fontWeight: 600,
                            '&.MuiTypography-root': { mb: '20px', mt: { xs: '20px', sm: '0' } }
                          }}
                        >
                        </Typography>

                        {variation_info?.promotional_retail_price ? (
                          <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                            {variation_info?.promotional_retail_price === variation_info?.retail_price ? (
                              <Typography component="span" width="20%">
                                {`$${variation_info?.promotional_retail_price}`}
                              </Typography>
                            ) : (
                              <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                <Typography
                                  component="span"
                                  sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                                >
                                  {`$${variation_info?.retail_price}`}
                                </Typography>
                                <Typography component="span" width="20%">
                                  {`$${variation_info?.promotional_retail_price}`}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                            <Typography component="span" width="20%">
                              {`$${variation_info?.retail_price}`}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ mt: { xs: "10px", md: "40px" }, mb: { xs: "10px", md: "75px" } }}>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                              children="Product Strain"
                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                              component="span"
                            />

                            <Typography children={variation_info?.strain} component="span" sx={{ fontSize: '1rem' }} />

                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                              children="Product Type"
                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                              component="span"
                            />

                            <Typography children={variation_info?.category_name} component="span" sx={{ fontSize: '1rem' }} />

                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                              children="Quantity on Hand"
                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                              component="span"
                            />
                            <Typography children={variation_info?.stock} component="span" sx={{ fontSize: '1rem' }} />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                })}
              </Box>
              {
                variationDetails.length > 0 &&
                <Stack spacing={2} direction="row" sx={{ mb: "10px" }}>
                  {variationDetails.map(variation => {
                    const variation_history = scannedHistory.filter(x => x.variation_id == variation.variation_id);
                    // console.log("variation_history>>", variation_history)
                    const labels = variation_history.map(x => x.label).join(",");
                    return <Box key={variation.variation_id}>
                      <Card sx={{ width: 160, }}>
                        <CardActionArea onClick={() => {
                          if (variation_history.length == 0) {
                            customToast.warn("Please scan for this variation.");
                            return;
                          }
                          setSelHistory(variation_history);
                          setTimeout(() => {
                            setOpenHistoryModal(true);
                          }, 100);
                        }}>
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="h5">
                              <Typography variant="h5" component={'span'}>VID: </Typography>
                              {variation.variation_id}
                            </Typography>
                            <Typography variant="body2">
                              <Typography variant="h5" component={'span'}>Title: </Typography>
                              {variation.title}
                            </Typography>
                            <Typography variant="body2">
                              <Typography variant="h5" component={'span'}>Labels: </Typography>
                              {labels}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Box>
                  })}
                </Stack>
              }
              {Object.keys(scanData).length ? (
                <Box sx={{ width: 500 }}>
                  <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                      setValue(newValue);
                    }}
                    sx={{ backgroundColor: 'inherit' }}
                  >
                    <BottomNavigationAction label="Scan history" icon={<RestoreIcon />} />
                    <BottomNavigationAction label="Reconcile" icon={<BuildCircleIcon />} />
                    <BottomNavigationAction label="Transfer" icon={<LocalShippingIcon />} />
                  </BottomNavigation>
                </Box>
              ) : (<Skeleton variant="rounded" height={60} sx={{ backgroundColor: 'rgb(233 233 233)' }} />)}
              <Divider variant="middle" sx={{ mt: '1em', mb: '1em', borderColor: '#313030' }} />
              <Typography variant="h5" sx={{ mb: '10px', textAlign: 'center' }}>
                {packageUid}
              </Typography>
              <Timeline>
                {Object.keys(scanData).map((key) => {
                  return (
                    <TimelineItem key={key}>
                      <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                      >
                        <Typography variant="h6" component="span">
                          {`Label ${key}`}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineConnector />
                        {Object.keys(scanData[key]).length > 1 && (
                          <TimelineDot sx={{ backgroundColor: '#000000', color: '#ff9a00' }}>
                            <WarningIcon />
                          </TimelineDot>
                        )}
                        {Object.keys(scanData[key]).length === 1 && (
                          <TimelineDot sx={{ backgroundColor: '#00ff6f', color: '#000000' }}>
                            <CheckCircleIcon />
                          </TimelineDot>
                        )}
                        {Object.keys(scanData[key]).length === 0 && (
                          <TimelineDot sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                            <PendingIcon />
                          </TimelineDot>
                        )}
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineOppositeContent
                        sx={{ m: 'auto 0', textAlign: 'left', flex: 2 }}
                        align="right"
                        variant="body2"
                      >
                        {scanData[key].map((item, index) => {
                          return (
                            <div key={index}>
                              <Typography variant="h6" component="span">
                                {item.header}
                              </Typography>
                              <Typography>{item.content}</Typography>
                              {(Object.keys(scanData[key]).length > 1 && (index + 1) !== Object.keys(scanData[key]).length) && (
                                <Divider orientation="vertical" flexItem>
                                  |
                                </Divider>
                              )}
                            </div>
                          );
                        })}
                      </TimelineOppositeContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}

export default Reconciliation;
