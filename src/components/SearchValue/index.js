import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import Image from 'components/Image/index';
import { useState } from 'react';
import { KureDatabase } from 'services/idb_services/KureDatabase';
import { useNavigate } from 'react-router-dom';
import { getStoreId } from "../../services/storage_services/storage_functions";
import { clickOutSide } from 'Common/functions';

const SearchValue = ({ searchValue, setSearchValue, setopenSearchBox }) => {
  const navigate = useNavigate();
  const [searchedList, setSearchedList] = useState([]);
  const boxSearchRef = useRef(null);
  const db = new KureDatabase();
  const storeId = getStoreId();

  useEffect(() => {
    const keyword = searchValue.toLowerCase();
    db.productData().getAll().then((data) => {
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
  //Catch the click event outside the search value box
  useEffect(() => {
    if (boxSearchRef.current) clickOutSide(boxSearchRef, setopenSearchBox);
  }, []);

  return (
    <List
      ref={boxSearchRef}
      sx={{
        width: { xs: '300px', md: '400px' },
        p: 0,
        top: '120%',
        left: { xs: '-20%', sm: 0 },
        bgcolor: '#414242',
        position: 'absolute',
        borderRadius: '10px',
        color: '#f7f7f7',
        zIndex: '10'
      }}
    >
      {searchedList.map((data, index) => (
        <ListItem
          key={`search-product-${data['variation_id']}`}
          onClick={() => {
            setSearchValue(data.title);
            setopenSearchBox(false);
            setTimeout(() => {

              navigate("/" + data.link)
            }, 100)
          }}
          sx={{
            p: '16px',
            cursor: 'pointer',
            gap: '12px',
            alignItems: 'flex-start',
            ':hover': { bgcolor: '#32BEB9', borderRadius: '10px' }
          }}
        >
          <Image alt="" src={data.product_image} height="100%" width="100%" sx={{ flex: 1 }} />
          <ListItemText
            sx={{ flex: 2, '.MuiTypography-root': { fontSize: '1rem' } }}
            primary={data.title}
            secondary={
              <>
                <Typography
                  sx={{ fontWeight: 'bolder', fontSize: '1rem', color: '#f7f7f7' }}
                  component="span"
                  children="Stock:"
                />
                <Typography sx={{ fontSize: '1rem', color: '#f7f7f7' }} component="span" children={data.stock} />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default SearchValue;
