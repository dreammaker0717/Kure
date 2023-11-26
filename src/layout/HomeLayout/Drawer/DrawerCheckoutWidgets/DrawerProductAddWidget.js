import { clickOutSide } from 'Common/functions';
import React, { useEffect, useRef, useState } from 'react';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { getStoreId } from 'services/storage_services/storage_functions';
import Image from 'components/Image/index';
import { Grid, List, ListItem, ListItemText, Typography, Box, Input } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addRemoveProductFromCart } from 'services/idb_services/orderManager';
import HighlightTextWidget from 'components/HighlightTextWidget';
import ClearIcon from '@mui/icons-material/Clear';
const db = new KureDatabase();
const DrawerProductAddWidget = (props) => {
  const { onClickProduct } = props;
  const [searchValue, setSearchValue] = useState('');
  const [searchedList, setSearchedList] = useState([]);
  const [openSearchBox, setOpenSearchBox] = useState(false);
  const boxSearchRef = useRef(null);
  const storeId = getStoreId();
  let onClickProductEvent = null;

  useEffect(() => {
    const keyword = searchValue.toLowerCase();
    db.getAll(IDB_TABLES.product_data).then((data) => {
      const filteredData = data.filter((x) => {
        if (x['store_id'].split(',').map((s) => s.trim()).includes(`${storeId}`) == false)
          return false;

        // The keyword is a string that can contain multiple words. Each word must be found in x['title'].
        const words = keyword.split(' ');
        const title = x['title'].toLowerCase();
        for (let i = 0; i < words.length; i++) {
          if (title.includes(words[i]) == false) return false;
        }
        return true;

        // // filter by title.
        // if (x['title'].toLowerCase().includes(keyword) == false) return false;
        // // // filter by selected store;
        // // if (x['store_id'].split(',').map((s) => s.trim()).includes(`${store_id}`) == false)
        // //   return false;
        // return true;
      }).slice(0, 10);

      setSearchedList(filteredData);
    });
  }, [searchValue]);
  useEffect(() => {
    if (boxSearchRef.current) clickOutSide(boxSearchRef, setOpenSearchBox);
  }, []);

  /**
   * If the user passed in a custom onClick event, use that. Otherwise, use the default event.
   */
  if (onClickProduct == null) {
    onClickProductEvent = (product) => {
      console.log(product)
      addRemoveProductFromCart(product, 1)
    }
  } else {
    onClickProductEvent = onClickProduct;
  }

  const defaultBehavior = () => {
    setOpenSearchBox(false);
    setSearchValue("");
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex', flexGrow: 1, backgroundColor: '#414242',
        borderRadius: '20px',
        px: "10px"
      }}>
        <Box sx={{
          width: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <SearchIcon />
        </Box>
        <Input
          fullWidth={true}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setOpenSearchBox(true);
          }}
          disableUnderline={true}
          sx={{
            display: 'flex',
            color: '#cecece',
            backgroundColor: '#414242',
            borderRadius: '20px',
            fontSize: { xs: '0.75rem', sm: '1rem' },
            '& .MuiInputBase-input': {
              p: '6px 12px 7px 12px',
              height: { xs: '17px', sm: '33px' },
              textTransform: 'uppercase'
            },
            '&::after': { borderBottom: 0 },
            '&::before': { borderBottom: 0 }
          }}
          placeholder="Search products to add"
        />
        {searchValue.length > 0 &&
          <Box sx={{
            width: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
            onClick={() => setSearchValue('')}
            className={"custom-button"}
          >
            <ClearIcon />
          </Box>
        }
      </Box>
      {searchValue.length > 0 && openSearchBox &&
        <List
          ref={boxSearchRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            marginTop: '5px',
            marginLeft: '1em',
            width: '400px',
            maxWidth: "80vw",
            p: 0,
            bgcolor: '#414242',
            borderRadius: '10px',
            color: '#f7f7f7',
            zIndex: '10'
          }}
        >
          {searchedList.map((data, index) => (
            <ListItem
              key={`search-product-${data['variation_id']}`}
              onClick={() => {
                onClickProductEvent(data);
                defaultBehavior();
              }}
              sx={{
                p: '16px',
                cursor: 'pointer',
                gap: '12px',
                alignItems: 'flex-start',
                ':hover': { bgcolor: '#32BEB9', borderRadius: '10px' }
              }}
            >
              <Image alt="" src={data.product_image}
                sx={{
                  width: { xs: "80px", sm: "100px" },
                  height: { xs: "80px", sm: "100px" },
                }}
                style={{ width: "100%", height: "100%", objectFit: 'cover', }}
              />
              <ListItemText
                sx={{
                  flex: 2, '.MuiTypography-root': {
                    fontSize: {
                      xs: '13px',
                      sm: "16px"
                    }, color: "#f7f7f7"
                  }
                }}
                primary={<HighlightTextWidget text={data.title} keyword={searchValue} />}
                secondary={
                  <>
                    <Typography
                      sx={{
                        fontWeight: 'bolder', fontSize: {
                          xs: "14px",
                          md: "18px"
                        }, color: '#f7f7f7'
                      }}
                      component="span"
                      children="Category: "
                    />
                    <Typography sx={{
                      fontSize: {
                        xs: "14px",
                        md: "18px"
                      }, color: '#f7f7f7'
                    }} component="span" children={data.category_name} />
                    <br />
                    <Typography
                      sx={{
                        fontWeight: 'bolder', fontSize: {
                          xs: "14px",
                          md: "18px"
                        }, color: '#f7f7f7'
                      }}
                      component="span"
                      children="Stock: "
                    />
                    <Typography sx={{
                      fontSize: {
                        xs: "14px",
                        md: "18px"
                      }, color: '#f7f7f7'
                    }} component="span" children={data.stock} />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      }
    </Box>
  );
};

export default DrawerProductAddWidget;