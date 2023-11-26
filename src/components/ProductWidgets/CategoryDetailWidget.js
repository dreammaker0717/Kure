import { Box, Typography, Grid } from '@mui/material';
import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link as Route } from 'react-router-dom';
import { SIG_CHANGED_STORE, SIG_CHANNEL, SIG_VALID_CATEGORY_CHANGED } from 'Common/signals';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { firstLetterUpperCase, getDeviceSize } from 'Common/functions';
import { ROUTE } from 'routes/CONSTANTS';
import { DEVICE_SIZE, EmptyProductCard } from 'Common/constants';
import ProductCard from './ProductCard';
import { getLastProductCount, storeLastProductCount } from 'services/storage_services/storage_functions';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';

const db = new KureDatabase();
const cssRouter = {
  lineHeight: { xs: 1.1, md: 1.5 },
  fontSize: { xs: "0.8rem", md: '1rem' },
  fontWeight: 'bold',
  color: '#32BEB9',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
    color: '#499e9b'
  }
};
const CategoryDetailWidget = ({ category_name, on_category_page }) => {
  const { values: commonData } = useCommonData();

  const [productStore, setProductStore] = useState([]);
  const rowsPerPage = on_category_page ? 12 : 6;
  const [rowCurrent, setRowCurrent] = useState(rowsPerPage);
  const [isBusy, setIsBusy] = useState(false)
  const observer = useRef();
  // const categoryName = React.useMemo(() => {
  //   return category_name.charAt(0).toUpperCase() + category_name.slice(1);
  // }, [category_name]);
  const categoryName = category_name.charAt(0).toUpperCase() + category_name.slice(1);
  const storeId = commonData[CommonDataIndex.SEL_STORE];
  const device = getDeviceSize(commonData[CommonDataIndex.WIDTH]);
  const validCategoryList = commonData[CommonDataIndex.VALID_CATEGORIES]

  const lastProductElementRef = useCallback((node) => {
    if (!on_category_page) {
      return;
    }
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setRowCurrent((prevRowCurrent) => prevRowCurrent + rowsPerPage);
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, []);

  const selectProducts = async (store_id) => {
    const count = await db.count(IDB_TABLES.product_data);
    if (count === 0) return;

    setIsBusy(true);
    let products = [];
    if (categoryName == 'Promotions') {
      products = await db.getAll(IDB_TABLES.product_data);
      products = products.filter(x => x.promotional_retail_price !== x.retail_price)
    } else {
      products = await db.getAllFromIndex('category_name', categoryName, IDB_TABLES.product_data);
    }

    const selected_products = store_id === null ? [] : products.filter((product) => {
      if (product.store_id == null) return false;
      const filters = product.store_id.split(',').filter((id) => Number(id) == store_id);
      return filters.length > 0;
    });
    setProductStore(selected_products);
    storeLastProductCount(selected_products.length);
    setIsBusy(false)
  };

  useEffect(() => {
    selectProducts(storeId);
  }, [category_name, validCategoryList]);

  if (categoryName === '') {
    return <></>;
  }

  let lastProductCount = 0;
  if (on_category_page == true) {
    lastProductCount = getLastProductCount();
    if (lastProductCount == null) {
      lastProductCount = 12;
    }
  } else {
    lastProductCount = 6
  }

  return (
    <Box sx={{ mt: '20px' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: '0.5rem', md: '1rem' },
        px: '1rem'
      }}>
        <Typography
          variant="h3"
          sx={{
            '&.MuiTypography-root': {
              fontSize: { xs: '20px', md: "35px" },
              fontWeight: 500,
              lineHeight: 1.2,
              mb: { xs: '0.1rem', md: '0.5rem' }
            }
          }}
        >
          {firstLetterUpperCase(category_name)}
        </Typography>
        {!on_category_page && (
          <Route to={`${ROUTE.CATEGORY}/${category_name}`}
                 style={{ textDecoration: 'none' }}
          >
            <Typography sx={cssRouter}>View All</Typography>
          </Route>
        )}
      </Box>
      <Box sx={{ mb: '20px' }}>
        {
          ((device == DEVICE_SIZE.xs || device == DEVICE_SIZE.sm) && on_category_page == false)
            ? <Box style={{
              "padding": "10px",
              "paddingTop": "0px",
              "whiteSpace": on_category_page ? "wrap" : "nowrap",
              "overflowX": "auto",
            }}>
              {productStore.length > 0
                ? productStore?.slice(0, rowCurrent).map((row, index) => {
                  const itemProps = rowCurrent === index + 1 ? { ref: lastProductElementRef } : {};
                  return (
                    <Box key={`real-image-${row.variation_id}`}
                         {...itemProps}
                         style={{
                           "width": "40vw",
                           "maxWidth": "200px",
                           "minWidth": "160px",
                           "marginRight": "10px",
                           "display": "inline-block",
                         }}
                    >
                      <ProductCard index={index} key={index} variation={row}/>
                    </Box>
                  );
                })
                : [...Array(lastProductCount).keys()].map((row, index) => {
                  const itemProps = lastProductCount == index + 1 ? { ref: lastProductElementRef } : {};
                  return (
                    <Box key={`fake-image-${storeId}-${category_name}+${index}`}
                         {...itemProps}
                         style={{
                           "width": "40vw",
                           "maxWidth": "200px",
                           "minWidth": "160px",
                           "marginRight": "10px",
                           "display": "inline-block",
                         }}
                    >
                      <ProductCard index={index} key={index} variation={EmptyProductCard}/>
                    </Box>
                  );
                })}
            </Box>
            : <Grid container rowSpacing={'20px'}>
              {productStore.length > 0
                ? productStore?.slice(0, rowCurrent).map((row, index) => {
                  const itemProps = rowCurrent === index + 1 ? { ref: lastProductElementRef } : {};
                  return (
                    <Grid item {...itemProps} key={`real-image-${row.variation_id}`}
                          sx={{ px: { xs: 2, sm: 2, md: 2 } }} xs={12} md={4} sm={4} lg={2}>
                      <ProductCard index={index} key={index} variation={row}/>
                    </Grid>
                  );
                })
                : [...Array(lastProductCount).keys()].map((row, index) => {
                  const itemProps = lastProductCount == index + 1 ? { ref: lastProductElementRef } : {};
                  return (
                    <Grid {...itemProps} key={`fake-image-${storeId}-${category_name}+${index}`} item xs={12}
                          sx={{ px: { xs: 2, sm: 2, md: 2 } }} md={4} sm={4} lg={2}>
                      <ProductCard index={index} key={index} variation={EmptyProductCard}/>
                    </Grid>
                  );
                })}
            </Grid>
        }

      </Box>
    </Box>
  );
};

export default CategoryDetailWidget;