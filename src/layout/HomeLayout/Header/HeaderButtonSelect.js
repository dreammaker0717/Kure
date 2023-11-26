import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link, useLocation } from 'react-router-dom';
import { KureDatabase } from 'services/idb_services/KureDatabase';
import { Navigate } from 'react-router-dom';
import { useNavigate } from '../../../../node_modules/react-router/dist/index';
import { getStoreId, getValidCategoryList, storeValidCategoryList, } from 'services/storage_services/storage_functions';
import { ButtonCategories } from 'Common/constants';
import { extractValidCategories } from 'services/idb_services/productManager';
import { broadcastMessage, MySleep } from 'Common/functions';
import { ROUTE } from 'routes/CONSTANTS';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { SIG_ALL_PRODUCT_FETCHED, SIG_CHANNEL } from 'Common/signals';
import { idbGetActiveStoreId } from 'services/idb_services/configManager';
import { checkInventoriesOfAllCarts } from 'services/idb_services/orderManager';


function HeaderButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState("");
  // const [validCategories, setValidCategories] = useState([...ButtonCategories]);
  const { values: commonData, setValueObjects: setCommonDataList } = useCommonData();
  const validCategories = commonData[CommonDataIndex.VALID_CATEGORIES];

  const getCategoryName = () => {
    const path_name = location.pathname;

    let tmp = "";
    if (path_name == ROUTE.HOME) {
      tmp = "";
    } else if (path_name.includes(`${ROUTE.CATEGORY}/`)) {
      tmp = path_name.split(`${ROUTE.CATEGORY}/`)[1];
    } else {
      tmp = category;
    }
    return tmp.toLowerCase();
  };

  useEffect(() => {
    const init_category = getCategoryName();
    setCategory(init_category);
  }, [location.pathname]);


  useEffect(() => {
    onChangedCategories();
  }, [validCategories])

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { type } = event.data;
      switch (type) {
        case SIG_ALL_PRODUCT_FETCHED:
          const store_id = await idbGetActiveStoreId();
          const valid_category_list = await extractValidCategories(store_id);
          storeValidCategoryList(store_id, valid_category_list);

          setCommonDataList({
            [CommonDataIndex.SEL_STORE]: store_id,
            [CommonDataIndex.VALID_CATEGORIES]: valid_category_list
          });
          checkInventoriesOfAllCarts();
          break;
      }
    });
  }, [])


  const onChangedCategories = async () => {
    const cat_name = getCategoryName();
    const store_id = getStoreId();
    const valid_category_list = getValidCategoryList(store_id);
    if (valid_category_list == null) {
      return;
    }
    const tmp_list = ButtonCategories.filter((x) => valid_category_list.includes(x.value));
    const same_cat = tmp_list.find((x) => x.value.toLowerCase() == cat_name);
    // console.log("valid category: ", same_cat);
    // setValidCategories([...tmp_list]);
    if (same_cat == undefined) {
      onClickSetCategory();
    }
    setCategory(cat_name);
  };

  const onClickSetCategory = (value) => {
    navigate(!value ? `/` : `${ROUTE.CATEGORY}/${value}`);
  };

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: "10px" }}>
      <ButtonGroup
        variant="contained"
        sx={{
          gap: '10px',
          overflow: 'auto',
          mx: { xs: 2 },
          boxShadow: 'none',
          '::-webkit-scrollbar': { display: 'none' }
        }}
        aria-label="Disabled elevation buttons"
      >
        {validCategories
          // .filter((x, ind) => x.isHidden == false || ind == 0)
          .map((button, index) => (
            <Link to={!button.value ? ROUTE.HOME : `${ROUTE.CATEGORY}/${button.value}`} key={`category-${button.value}`}
              style={{ textDecoration: 'none' }}>
              <Button
                onClick={() => onClickSetCategory(button.value)}
                sx={{
                  '&.MuiButtonBase-root.MuiButton-contained': {
                    p: '5px 10px',
                    bgcolor: button.value == category ? '#57c4c1' : 'transparent',
                    border: '1px solid #57c4c1',
                    borderRadius: '5px',
                    color: button.value == category ? '#fff' : '#57c4c1',
                    fontSize: '0.875rem',
                    lineHeight: '1.75',
                    '&:hover': { color: button.value == category ? '#fff' : '#499e9b' }
                  }
                }}
              >
                {button.label}
              </Button>
            </Link>
          ))}
      </ButtonGroup>
    </Container>
  );
}

export default HeaderButton;
