import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DrawerProductAddWidget from "layout/HomeLayout/Drawer/DrawerCheckoutWidgets/DrawerProductAddWidget";
import { Button, Grid, BottomNavigation, BottomNavigationAction, Box, Divider, Skeleton, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CameraEnhanceIcon from "@mui/icons-material/CameraEnhance";
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
import CheckIcon from '@mui/icons-material/Check';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import SimpleBar from 'simplebar-react';

import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import Image from 'components/Image/index';
import { addProductToHistory } from 'services/idb_services/productHistoryManager';
import { customToast } from 'components/CustomToast/CustomToast';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { MySleep, compressBase64Image, generateRandomDateTime, generateRandomInt } from 'Common/functions';
import ProductQRScanImageModal from 'components/ProductQRScanImageModal/ProductQRScanImageModal';

import scan_successful from "assets/sounds/scan_successful.mp3";
import scan_error from "assets/sounds/scan_error.mp3";
import scan_exists from "assets/sounds/scan_exists.mp3";
import { storeGetCashierName } from 'services/storage_services/storage_functions';

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
  const { values: commonData } = useCommonData();
  const [openQRPane, setOpenQRPane] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState('1');
  const [drupalHistoryInfo, setDrupalHistoryInfo] = useState([]);

  const [QRScanData, setQRScanData] = useState(null);

  const [selLabelModal, setSelLabelModal] = useState(null);

  const history_variant_scroll = useRef();
  const scan_history_all_scroll = useRef();
  const audioSuccessRef = useRef(null);
  const audioErrorRef = useRef(null);
  const audioExistsRef = useRef(null);

  const variation_info = drupalHistoryInfo[0];
  const metric_info = drupalHistoryInfo[1];
  const scan_info = drupalHistoryInfo[2];

  const sel_store = commonData[CommonDataIndex.SEL_STORE];
  const cashier_name = storeGetCashierName();

  const product_detail = variation_info?.product;
  const variations = variation_info?.variations;



  function playSoundSuccess() {
    audioSuccessRef.current.play();
  }

  function playSoundError() {
    audioErrorRef.current.play();
  }

  function playSoundExists() {
    audioExistsRef.current.play();
  }

  const generateFakeData = async (package_uid, data) => {
    let _variation_info = data[0];
    let _metric_info = data[1];
    let _scan_info = data[2];
    _scan_info = [];

    // fill variations with detailed information.
    const { variations } = _variation_info;
    const existing_variation_data = await db.getAllFromIndexList({ "package_uid": package_uid }, IDB_TABLES.product_data);
    const tmp_variations = variations.map(v_info => {
      const existing_info = existing_variation_data.find(x => x.variation_id == v_info.variation_id);
      const total_quantity = generateRandomInt(5, 30);
      if (existing_info == undefined) return { ...v_info, total_quantity: total_quantity };
      return { ...existing_info, ...v_info, total_quantity: total_quantity };
    })
    _variation_info = {
      ..._variation_info,
      variations: tmp_variations
    }

    // make fake history info;   
    const fake_count = generateRandomInt(10, 30);
    const variation_list = _variation_info.variations;
    // console.log("fake_quantity_list", fake_quantity_list);
    for (let i = 0; i < fake_count; i++) {
      const _index = generateRandomInt(0, variation_list.length - 1);
      const _v_id = variation_list[_index].variation_id;
      const _q = variation_list[_index].total_quantity;
      // console.log('_Q:', _q);
      const _label = `${generateRandomInt(0, _q)}`;
      const _created = generateRandomDateTime();
      _scan_info.push({
        'variation_id': _v_id,
        'label': _label,
        'created': _created,
        'creator_name': cashier_name
      })
    }
    _scan_info = _scan_info.sort((a, b) => (b.created - a.created));

    return [_variation_info, _metric_info, _scan_info]
  }
  const sortDrupalByVariation = async (variation_id, data) => {
    // sort variations by scanned variation;

    if (!variation_id) return data;

    let _variation_info = data[0];
    let _metric_info = data[1];
    let _scan_info = data[2];


    for (let i = 0; i < _variation_info.variations.length; i++) {
      if (_variation_info.variations[i].variation_id == variation_id) {
        _variation_info.variations[i].order = 0;
      } else {
        _variation_info.variations[i].order = i + 1;
      }
    }
    _variation_info.variations.sort((a, b) => a.order - b.order);

    return [_variation_info, _metric_info, _scan_info];
  }
  const fetchDrupalInfo = async (package_uid) => {
    setIsBusy(true);
    // get variation_id
    let sel_product = await db.getAllFromIndexList({ "package_uid": package_uid }, IDB_TABLES.product_data);
    const variation_id = sel_product[0].variation_id;

    // check existing data
    if (drupalHistoryInfo.length > 0) {
      const existing_product = drupalHistoryInfo[0];
      if (package_uid == existing_product.product.package_uid) {
        setIsBusy(false);
        const sorted_data = await sortDrupalByVariation(variation_id, drupalHistoryInfo);
        setDrupalHistoryInfo(sorted_data);
        return;
      }
    }

    // this function is to get all drupal reconcilation information.

    const drupal_res = await Promise.all([
      fetchVariationInfo(package_uid),
      fetchMetrcStockInfo(package_uid),
      fetchScanDetailsInfo(package_uid)
    ]);
    const _variation_info = drupal_res[0];
    const _metric_info = drupal_res[1];
    const _scan_info = drupal_res[2];
    setIsBusy(false);

    if (_variation_info == null) {
      return;
    }
    const _fakeData = await generateFakeData(package_uid, drupal_res);

    const sorted_data = await sortDrupalByVariation(variation_id, _fakeData);
    // const sorted_data = await sortDrupalByVariation(variation_id, drupal_res);


    // set drupal history info
    setDrupalHistoryInfo(sorted_data);
  }

  const fetchVariationInfo = (package_uid) => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'product_details',
        store_id: sel_store,
        package_uid: package_uid
      }).then(async (res) => {
        const { data, status } = res;
        if (status == 200) {
          resolve(data);
        } else {
          resolve(null);
        }
      }).catch((err) => {
        console.error('fetchVariationInfo error: ', err);
        resolve(null);
      })
    })
  }
  const fetchMetrcStockInfo = (package_uid) => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'metrc_stock',
        store_id: sel_store,
        package_uid: package_uid
      }).then((res) => {
        const { data, status } = res;
        if (status == 200) {
          resolve(data);
        } else {
          resolve("N/A");
        }
      }).catch((err) => {
        console.error('fetchMetrcStockInfo error: ', err);
        resolve('N/A');
      })
    })
  }
  const fetchScanDetailsInfo = (package_uid) => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'scan_details',
        store_id: sel_store,
        package_uid: package_uid,
        // variation_id: variation.variation_id      // I think the endpoint should give data for all variations.
      }).then((res) => {
        const { data, status } = res;
        if (status == 200) {
          resolve(data);  // this should be fine. but the endpoint doesn't give enough information.
        } else {
          resolve({});
        }
      }).catch((err) => {
        console.error('fetchScanDetailsInfo error: ', err);
        resolve({});
      })
    })
  }


  // package uid select logic
  const onQrScan = async (qr_scan_data) => {
    // package_uid_with_count will contain a dash and a number at the end of the string, i.e. 1A406030004086D000034503-1
    // We need to remove the dash and the number from the string to get the package_uid.

    // extract package_uid and label
    const { data, image } = qr_scan_data;
    const package_uid = data.split('-')[0];
    const label = data.split('-')[1];

    setQRScanData(qr_scan_data);

    // change order with variation id
    await fetchDrupalInfo(package_uid);
  }
  const onClickOpenQR = () => {
    setOpenQRPane(true);
  };
  const onClickProduct = async (variation) => {
    setQRScanData(null);
    const package_uid = variation.package_uid;

    await fetchDrupalInfo(package_uid);
  };

  // tab control logic
  const onChangeTab = (event, newValue) => {
    setCurrentTabValue(newValue);
  };


  // logs
  // console.log("drupalHistoryInfo >> ", drupalHistoryInfo)
  // console.log("sel_variation >> ", sel_variation)
  // console.log("sel_variant_scan_history>> ", sel_variant_scan_history)
  return (
    <>
      {openQRPane &&
        <ProductQRScanImageModal
          open={openQRPane}
          onClose={() => {
            setOpenQRPane(false);
          }}
          onQrScan={onQrScan}
        />
      }
      {selLabelModal != null && <Dialog
        open={selLabelModal != null}
        onClose={() => (setSelLabelModal(null))}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#272727',
            color: "white"
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "20px" }}>
          Scan History
        </DialogTitle>
        <DialogContent style={{ width: "90vw", maxWidth: "450px" }}>
          <Box sx={{ mb: "20px" }}>
            <Typography sx={{ fontSize: "16px" }}>
              Variation ID: {selLabelModal.variant.variation_id}
            </Typography>
          </Box>
          <Box sx={{ ml: "10px" }}>
            <Grid container sx={{ borderBottom: "1px solid #474747" }}>
              <Grid item xs={3}>Label</Grid>
              <Grid item xs={5}>Scan Date</Grid>
              <Grid item xs={4}>Name</Grid>
            </Grid>
            {
              selLabelModal.history.map((info, index) => {
                return <Grid container key={index} sx={{ borderBottom: "1px solid #474747" }}>
                  <Grid item xs={3}>{info.label}</Grid>
                  <Grid item xs={5}>{new Date(info.created).toLocaleDateString("en-US")}</Grid>
                  <Grid item xs={4}>{info.creator_name}</Grid>
                </Grid>
              })
            }

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (setSelLabelModal(null))}>
            OK
          </Button>
        </DialogActions>
      </Dialog>}

      <Box sx={{ display: 'flex', width: '496px', margin: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, pb: "20px" }}>
          <Typography sx={{ fontSize: 14, mb: '.5em!important', }} color="text.secondary" gutterBottom>
            Find a product via a manual search or scan a QR code to begin.
          </Typography>
          <Box sx={{ display: 'flex', mb: '15px', gap: '1em' }}>
            <DrawerProductAddWidget onClickProduct={onClickProduct} />
            <CameraEnhanceIcon
              sx={cssCamera}
              onClick={onClickOpenQR}
            />
          </Box>
          <Divider variant="middle" sx={{ mt: '1em', mb: '1em', borderColor: '#313030' }} />

          {
            isBusy
              ? <>
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
              </>
              : drupalHistoryInfo.length == 0
                ? <></>
                : <>

                  {product_detail &&
                    <Fade in={true}>
                      <Box sx={{ mb: '15px' }}>
                        <Stack direction="row" alignItems={'center'} spacing={1} sx={{ mb: "10px" }}>
                          <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                            <TitleIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                          </Avatar>
                          <Typography>{product_detail?.title}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems={'center'} spacing={1}>
                          <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                            <StoreIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                          </Avatar>
                          <Typography>{`Store: ${product_detail?.store_name}`}</Typography>
                        </Stack>
                      </Box>
                    </Fade>
                  }

                  <Box sx={{ width: 600 }}>
                    <TabContext value={currentTabValue}>
                      <Fade
                        in={true}
                        style={{ transformOrigin: '0 0 0' }}
                      >
                        <Box sx={{ borderBottom: 1, borderColor: '#313030' }}>
                          <TabList
                            onChange={onChangeTab}
                            aria-label="tab for reconciliation"
                            sx={{
                              backgroundColor: 'inherit',
                            }}
                            variant="fullWidth"
                          >
                            <Tab sx={{ color: "#797979" }} label="Scan history" icon={<RestoreIcon />} value="1" />
                            <Tab sx={{ color: "#797979" }} label="Reconcile" icon={<BuildCircleIcon />} value="2" />
                            <Tab sx={{ color: "#797979" }} label="Transfer" icon={<LocalShippingIcon />} value="3" />
                          </TabList>
                        </Box>
                      </Fade>
                      <TabPanel value="1">
                        <Box sx={{ textAlign: 'center' }}>
                          {QRScanData != null && QRScanData.image != undefined && <img src={QRScanData.image} alt="camera" />}
                        </Box>

                        {/* variation details with scan history */}
                        <Box>
                          {variations.map((info, index) => {
                            let sel_variant_scan_history = {};
                            const focusing_history = scan_info.filter(x => x.variation_id = info.variation_id);
                            const total_quantity = info.total_quantity;
                            for (let i = 0; i < total_quantity; i++) {
                              const label = `${i}`;
                              const label_history = focusing_history.filter(x => x.label == label);
                              sel_variant_scan_history[label] = label_history;
                            }
                            let last_scanned = "";
                            if (index == 0 && QRScanData != null) {
                              last_scanned = QRScanData.data;
                            }

                            return <Box key={`${info.variation_id}`} sx={{ mt: "10px" }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography>Variation: {info.variation_id}</Typography>
                              </Box>
                              <Accordion>
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon
                                    fontSize="large"
                                    sx={{ color: "white" }}
                                  />}
                                  aria-controls="panel-content"
                                  id={`${info.variation_id}`}
                                  justifyContent={"end"}
                                  sx={{
                                    backgroundColor: "#474747",
                                    color: "#d9d9d9",
                                  }}

                                >
                                  <Box>
                                    <Box sx={{ mb: "10px", mx: "10px" }}>
                                      <Grid
                                        container
                                        rowSpacing={1}
                                        alignItems={'center'}
                                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                                      >
                                        <Grid item xs={12} sm={5}>
                                          <Box width="100%" height="100%">
                                            <Image src={info.product_image} alt="variation-detail" />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={7}>
                                          <Typography
                                            component="h1"
                                            sx={{
                                              fontSize: { xs: "18px", md: '36px' },
                                              fontWeight: 600,
                                              '&.MuiTypography-root': { mt: { xs: '20px', sm: '0' } }
                                            }}
                                          >
                                          </Typography>

                                          {info?.promotional_retail_price ? (
                                            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                              {info?.promotional_retail_price === info?.retail_price ? (
                                                <Typography component="span" width="20%">
                                                  {`$${info?.promotional_retail_price}`}
                                                </Typography>
                                              ) : (
                                                <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                                  <Typography
                                                    component="span"
                                                    sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                                                  >
                                                    {`$${info?.retail_price}`}
                                                  </Typography>
                                                  <Typography component="span" width="20%">
                                                    {`$${info?.promotional_retail_price}`}
                                                  </Typography>
                                                </Box>
                                              )}
                                            </Box>
                                          ) : (
                                            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                              <Typography component="span" width="20%">
                                                {`$${info?.retail_price ? info?.retail_price : "##.##"}`}
                                              </Typography>
                                            </Box>
                                          )}
                                          <Box sx={{ mt: "10px" }}>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                              <Typography
                                                children="Product Strain"
                                                sx={{ width: '200px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                                component="span"
                                              />

                                              <Typography children={info?.strain} component="span" sx={{ fontSize: '1rem' }} />

                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                              <Typography
                                                children="Product Type"
                                                sx={{ width: '200px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                                component="span"
                                              />

                                              <Typography children={info?.category_name} component="span" sx={{ fontSize: '1rem' }} />

                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                              <Typography
                                                children="Quantity on Hand"
                                                sx={{ width: '200px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                                component="span"
                                              />
                                              <Typography children={info?.stock} component="span" sx={{ fontSize: '1rem' }} />
                                            </Box>
                                          </Box>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Box>
                                </AccordionSummary>

                                <AccordionDetails sx={{ backgroundColor: "#373737", color: "white" }}>
                                  {
                                    last_scanned != "" && <Box sx={{ my: "10px" }}>
                                      <Typography variant={"h5"}>Last Scanned : {last_scanned}</Typography>
                                      <Button variant={"h6"} sx={{ pl: "10px" }}
                                        onClick={() => {
                                          setSelLabelModal({
                                            variant: info,
                                            history: focusing_history.filter(x => x.creator_name == cashier_name)
                                          })
                                        }}>Scanned By: {cashier_name}</Button>
                                    </Box>
                                  }

                                  {/* <Divider variant="middle" sx={{ mt: '5px', mb: '5px', borderColor: '#313030' }} /> */}

                                  <Box>
                                    <Timeline>
                                      {Object.keys(sel_variant_scan_history).map((label) => {
                                        return (
                                          <TimelineItem key={label}>
                                            <TimelineOppositeContent
                                              sx={{ m: 'auto 0' }}
                                              align="right"
                                              variant="body2"
                                            >
                                              <Typography variant="h6">
                                                {`Label #${label}`}
                                              </Typography>
                                              {/* {Object.keys(sel_variant_scan_history[label]).length === 1 &&
                                                <Typography sx={{ fontSize: "14px" }}>
                                                  Scanned by {sel_variant_scan_history[label][0].creator_name}
                                                </Typography>
                                              } */}
                                            </TimelineOppositeContent>
                                            <TimelineSeparator>
                                              <TimelineConnector />
                                              {Object.keys(sel_variant_scan_history[label]).length > 1 && (
                                                <TimelineDot sx={{ backgroundColor: '#000000', color: '#ff9a00' }}>
                                                  <WarningIcon />
                                                </TimelineDot>
                                              )}
                                              {Object.keys(sel_variant_scan_history[label]).length === 1 && (
                                                <TimelineDot sx={{ backgroundColor: '#00ff6f', color: '#000000' }}>
                                                  <CheckCircleIcon />
                                                </TimelineDot>
                                              )}
                                              {Object.keys(sel_variant_scan_history[label]).length === 0 && (
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
                                              color="text.secondary"
                                            >
                                              {
                                                Object.keys(sel_variant_scan_history[label]).length > 1 && <>
                                                  <div>Error (too many scans)</div>
                                                  <Button size={"small"} sx={{ color: "white" }}
                                                    onClick={() => {
                                                      setSelLabelModal({
                                                        variant: info,
                                                        // label: label,
                                                        history: sel_variant_scan_history[label]
                                                      })
                                                    }}
                                                  >
                                                    See Scan History
                                                  </Button>
                                                </>
                                              }
                                              {
                                                Object.keys(sel_variant_scan_history[label]).length === 1 && "Sold at " + (new Date(sel_variant_scan_history[label][0].created).toLocaleDateString("en-US"))
                                              }
                                              {
                                                Object.keys(sel_variant_scan_history[label]).length === 0 && "Available"
                                              }
                                              {/* {
                                                sel_variant_scan_history[label].map(info => {
                                                  return <Box key={`${label}-${info.created}`}>
                                                    {new Date(info.created).toLocaleDateString("en-US")}
                                                  </Box>
                                                })
                                              } */}
                                            </TimelineOppositeContent>
                                          </TimelineItem>
                                        );
                                      })}
                                    </Timeline>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </Box>
                          })}
                        </Box>

                        {/* scanned history   */}
                        <Box sx={{ mt: "20px" }}>
                          <Typography variant={'h4'} sx={{ pb: "10px" }}>Last Scanned({scan_info.length})</Typography>
                          <SimpleBar ref={scan_history_all_scroll}
                            style={{ maxWidth: "100%", paddingBottom: "20px" }}
                          >
                            <Box sx={{ display: 'flex' }}>
                              {
                                scan_info.map((info, index) => {
                                  return <Box
                                    key={`${info.variation_id}-${index}`}
                                    sx={{ width: "130px", flexShrink: 0, marginRight: "10px", }}
                                  >
                                    <Card sx={{ backgroundColor: "#373737", color: "white", borderColor: 'gray' }}>
                                      <CardActionArea
                                        onClick={() => {
                                          console.log("CLICKED");
                                        }}>
                                        <CardContent sx={{ p: 1, fontSize: "12px", bg: "transparent" }}>
                                          <Box sx={{ marginBottom: "10px" }}>
                                            <strong>VID:</strong> {info.variation_id}
                                          </Box>
                                          <Box sx={{ marginBottom: "10px" }}>
                                            <strong>Label:</strong> {info.label}
                                          </Box>
                                          <Box>
                                            <strong>Scanned:</strong> {info.created.toLocaleDateString("en-US")}
                                          </Box>
                                        </CardContent>
                                      </CardActionArea>
                                    </Card>
                                  </Box>
                                })
                              }
                            </Box>
                          </SimpleBar>
                        </Box>
                      </TabPanel>
                      <TabPanel value="2">
                        Reconcile information
                      </TabPanel>
                      <TabPanel value="3">
                        Transfer information
                      </TabPanel>
                    </TabContext>
                  </Box>
                </>
          }
        </Box>
      </Box >

      <audio controls ref={audioSuccessRef} style={{ display: 'none' }}>
        <source src={scan_successful} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
      <audio controls ref={audioErrorRef} style={{ display: 'none' }}>
        <source src={scan_error} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
      <audio controls ref={audioExistsRef} style={{ display: 'none' }}>
        <source src={scan_exists} type="audio/mpeg" />
        <track kind="captions" label="English captions" src="" default />
      </audio>
    </>
  );
}

export default Reconciliation;
