import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DrawerProductAddWidget from "layout/HomeLayout/Drawer/DrawerCheckoutWidgets/DrawerProductAddWidget";
import { Button, Grid, BottomNavigation, BottomNavigationAction, Box, Divider, Skeleton, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [packageUid, setPackageUid] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isBusyVariation, setIsBusyVariation] = useState(false);
  const [capturedQRImage, setCapturedQRImage] = useState(null);
  const [currentTabValue, setCurrentTabValue] = useState('1');
  const [drupalHistoryInfo, setDrupalHistoryInfo] = useState([]);
  const [selVariantId, setSelVariantId] = useState(null);

  const history_variant_scroll = useRef();
  const scan_history_all_scroll = useRef();

  const sel_store = commonData[CommonDataIndex.SEL_STORE];
  const variation_info = useMemo(() => { return drupalHistoryInfo[0] }, [drupalHistoryInfo]);
  const metric_info = useMemo(() => { return drupalHistoryInfo[1] }, [drupalHistoryInfo]);
  const scan_info = useMemo(() => {
    // return drupalHistoryInfo[2]    // this is correct but there's no enough data, so will change like below.
    const tmp = drupalHistoryInfo[0]?.variations;
    if (!tmp) return [];
    return drupalHistoryInfo[2];
  }, [drupalHistoryInfo]);


  const product_detail = variation_info?.product;
  const variations = variation_info?.variations;

  const sel_variation = useMemo(() => {
    setIsBusyVariation(true);
    if (selVariantId == null) return null;
    if (drupalHistoryInfo.length == 0) return null;
    return variations.find(x => x.variation_id == selVariantId);
  }, [selVariantId]);
  const sel_variant_scan_history = useMemo(() => {
    if (!sel_variation) {
      setIsBusyVariation(false);
      return [];
    }

    const focusing_history = scan_info.filter(x => x.variation_id = selVariantId);
    const total_quantity = sel_variation.total_quantity;

    let history = {};

    for (let i = 0; i < total_quantity; i++) {
      const label = `${i}`;
      const label_history = focusing_history.filter(x => x.label == label);
      history[label] = label_history;
    }
    setTimeout(() => {
      setIsBusyVariation(false);

    }, 500);
    return history;
  }, [sel_variation])

  // drupal data fetch logic
  useEffect(() => {
    // this useEffect is to update information when I change the store in header.
    if (packageUid == null) return;
    if (sel_store == undefined) return;

    fetchDrupalInfo();
  }, [sel_store, packageUid]);

  const fetchDrupalInfo = () => {
    // this function is to get all drupal reconcilation information.
    setIsBusy(true);
    Promise.all([
      fetchVariationInfo(),
      fetchMetrcStockInfo(),
      fetchScanDetailsInfo()
    ])
      .then((data) => {
        setIsBusy(false);
        const _variation_info = data[0];
        const _metric_info = data[1];
        const _scan_info = data[2];
        if (_variation_info == null) {
          return;
        }
        // make fake history info;
        let fake_scan_info = []
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
          fake_scan_info.push({
            'variation_id': _v_id,
            'label': _label,
            'created': _created
          })
        }
        fake_scan_info.sort((a, b) => (b.created - a.created));

        // set drupal history info
        setDrupalHistoryInfo(
          [_variation_info, _metric_info, fake_scan_info]
        );
        setSelVariantId(_variation_info.variations[0]?.variation_id);
      });

  }

  const fetchVariationInfo = () => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'product_details',
        store_id: sel_store,
        package_uid: packageUid
      }).then(async (res) => {
        const { data, status } = res;
        if (status == 200) {
          // resolve(data);   // this should be fine. but the endpoint doesn't give enough information.

          // below logic is to give product information from idb.
          // if the endpoint can give product information, then we can ignore.
          const { variations } = data;
          const existing_variation_data = await db.getAllFromIndexList({ "package_uid": packageUid }, IDB_TABLES.product_data);
          const tmp_variations = variations.map(v_info => {
            const existing_info = existing_variation_data.find(x => x.variation_id == v_info.variation_id);
            const total_quantity = generateRandomInt(5, 30);
            if (existing_info == undefined) return { ...v_info, total_quantity: total_quantity };
            return { ...existing_info, ...v_info, total_quantity: total_quantity };
          })
          resolve({
            ...data,
            variations: tmp_variations
          });
        } else {
          resolve(null);
        }
      }).catch((err) => {
        console.error('fetchVariationInfo error: ', err);
        resolve(null);
      })
    })
  }
  const fetchMetrcStockInfo = () => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'metrc_stock',
        store_id: sel_store,
        package_uid: packageUid
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
  const fetchScanDetailsInfo = () => {
    return new Promise((resolve, reject) => {
      resource.getInventoryReconciliationData({
        action: 'scan_details',
        store_id: sel_store,
        package_uid: packageUid,
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
  const onCapturedQRImage = async (img_data) => {
    // const img = compressBase64Image(img_data);  
    setCapturedQRImage(img_data);
  }
  const onQrScan = async (package_uid_with_count) => {
    console.log(package_uid_with_count)
    // package_uid_with_count will contain a dash and a number at the end of the string, i.e. 1A406030004086D000034503-1
    // We need to remove the dash and the number from the string to get the package_uid.
    await MySleep(300);
    const package_uid = package_uid_with_count.split('-')[0];
    setPackageUid(package_uid);
    setOpenQRPane(false);
  }
  const onClickOpenQR = (is_delete) => {
    setOpenQRPane(true);
  };
  const onClickProduct = async (variation) => {
    const package_uid = variation.package_uid;
    setPackageUid(package_uid);
    setCapturedQRImage(null);

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
        <ProductQRCaptureModal
          open={openQRPane}
          isDeletion={false}
          onCapturedImage={onCapturedQRImage}
          onClose={() => {
            setOpenQRPane(false)
          }}
          onQrScan={onQrScan}
        />
      }

      <Box sx={{ display: 'flex', width: '496px', margin: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, pb: "20px" }}>
          <Typography sx={{ fontSize: 14, mb: '.5em!important', }} color="text.secondary" gutterBottom>
            Find a product via a manual search or scan a QR code to begin.
          </Typography>
          <Box sx={{ display: 'flex', mb: '15px', gap: '1em' }}>
            <DrawerProductAddWidget onClickProduct={onClickProduct} />
            <CameraEnhanceIcon
              sx={cssCamera}
              onClick={() => onClickOpenQR(false)}
            />
          </Box>
          <Divider variant="middle" sx={{ mt: '1em', mb: '1em', borderColor: '#313030' }} />
          <Box sx={{ textAlign: 'center' }}>
            {capturedQRImage && <img src={capturedQRImage} alt="camera" />}
          </Box>
          {
            isBusy && drupalHistoryInfo.length == 0
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
                  <Fade
                    in={true}
                    style={{ transformOrigin: '0 0 0' }}
                  >
                    <Box sx={{ width: 500 }}>
                      <TabContext value={currentTabValue}>
                        <Box sx={{ borderBottom: 1, borderColor: '#313030' }}>
                          <TabList
                            onChange={onChangeTab}
                            aria-label="lab API tabs example"
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
                        <TabPanel value="1">
                          <Box>
                            <Typography variant={'h4'} sx={{ pb: "10px" }}>Variations</Typography>
                            {
                              variations.map(info => {
                                return <Box key={`${info.variation_id}`}>
                                  <Stack className="custom-button noselect"
                                    direction={"row"}
                                    alignItems={"center"}
                                    spacing={1}
                                    onClick={() => setSelVariantId(info.variation_id)}
                                  >
                                    <Box width="30px">
                                      {selVariantId == info.variation_id &&
                                        <CheckCircleIcon sx={{ color: "#00ff6f" }} />
                                      }
                                    </Box>
                                    <Box width="70px">
                                      <Image src={info.product_image} alt={'variation'} />
                                    </Box>
                                    <Box >
                                      <Typography sx={{ fontSize: "12px" }}><strong>VID: </strong>{info.variation_id}</Typography>
                                      <Typography sx={{ fontSize: "12px" }}><strong>Stock: </strong>{info.stock}</Typography>
                                    </Box>
                                  </Stack>
                                  <Divider variant="middle" sx={{ mt: '5px', mb: '5px', borderColor: '#313030' }} />
                                </Box>
                              })
                            }
                          </Box>

                          {/* variation details with scan history */}
                          {sel_variation &&
                            <Grow
                              in={!isBusyVariation}
                              style={{ transformOrigin: '0 0 0' }}
                            >
                              <Box sx={{ mt: "20px", display: isBusyVariation ? "none" : "block" }}>
                                <Box>
                                  <Typography variant={'h4'} sx={{ pb: "10px" }}>Variation Detail</Typography>
                                  <Box sx={{ mb: "10px" }}>
                                    <Grid
                                      container
                                      rowSpacing={1}
                                      alignItems={'center'}
                                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                                    >
                                      <Grid item xs={12} sm={6}>
                                        <Box width="100%" height="100%">
                                          <Image src={sel_variation.product_image} alt="variation-detail" />
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <Typography
                                          component="h1"
                                          sx={{
                                            fontSize: { xs: "18px", md: '36px' },
                                            fontWeight: 600,
                                            '&.MuiTypography-root': { mt: { xs: '20px', sm: '0' } }
                                          }}
                                        >
                                        </Typography>

                                        {sel_variation?.promotional_retail_price ? (
                                          <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                            {sel_variation?.promotional_retail_price === sel_variation?.retail_price ? (
                                              <Typography component="span" width="20%">
                                                {`$${sel_variation?.promotional_retail_price}`}
                                              </Typography>
                                            ) : (
                                              <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                                <Typography
                                                  component="span"
                                                  sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                                                >
                                                  {`$${sel_variation?.retail_price}`}
                                                </Typography>
                                                <Typography component="span" width="20%">
                                                  {`$${sel_variation?.promotional_retail_price}`}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        ) : (
                                          <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                            <Typography component="span" width="20%">
                                              {`$${sel_variation?.retail_price ? sel_variation?.retail_price : "##.##"}`}
                                            </Typography>
                                          </Box>
                                        )}
                                        <Box sx={{ mt: "10px" }}>
                                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                            <Typography
                                              children="Product Strain"
                                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                              component="span"
                                            />

                                            <Typography children={sel_variation?.strain} component="span" sx={{ fontSize: '1rem' }} />

                                          </Box>
                                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                            <Typography
                                              children="Product Type"
                                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                              component="span"
                                            />

                                            <Typography children={sel_variation?.category_name} component="span" sx={{ fontSize: '1rem' }} />

                                          </Box>
                                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                                            <Typography
                                              children="Quantity on Hand"
                                              sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                              component="span"
                                            />
                                            <Typography children={sel_variation?.stock} component="span" sx={{ fontSize: '1rem' }} />
                                          </Box>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </Box>
                                <Box sx={{ mt: "10px" }}>
                                  <SimpleBar style={{ maxHeight: "50vh" }}
                                    ref={history_variant_scroll}
                                  >
                                    <Timeline>
                                      {Object.keys(sel_variant_scan_history).map((label) => {
                                        return (
                                          <TimelineItem key={label}>
                                            <TimelineOppositeContent
                                              sx={{ m: 'auto 0' }}
                                              align="right"
                                              variant="body2"

                                            >
                                              <Typography variant="h6" component="span">
                                                {`Label #${label}`}

                                              </Typography>
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
                                                sel_variant_scan_history[label].map(info => {
                                                  return <Box key={`${label}-${info.created}`}>
                                                    {new Date(info.created).toLocaleDateString("en-US")}
                                                  </Box>
                                                })
                                              }

                                            </TimelineOppositeContent>
                                          </TimelineItem>
                                        );
                                      })}
                                    </Timeline>
                                  </SimpleBar>
                                </Box>

                              </Box>
                            </Grow>
                          }
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
                  </Fade>
                </>
          }
        </Box>
      </Box >
    </>
  );
}

export default Reconciliation;
