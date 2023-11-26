import React, { useEffect, useRef, useState } from 'react';
import { Box, Input, List, ListItem, ListItemText, Typography } from '@mui/material';
import Image from 'components/Image/index';
import SearchIcon from '@mui/icons-material/Search';
import { KureDatabase } from 'services/idb_services/KureDatabase';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { useNavigate } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import HighlightTextWidget from 'components/HighlightTextWidget';
const db = new KureDatabase();
const SearchProductWidget = (props) => {
    const { setOpen, open } = props;
    const navigate = useNavigate();
    const { values: commonData, setValue: setCommonData } = useCommonData();
    const [keyword, setKeyword] = useState('');
    const [searchedList, setSearchedList] = useState([]);
    const storeId = commonData[CommonDataIndex.SEL_STORE];
    const inputRef = useRef();
    useEffect(() => {
        if (!inputRef) return;
        if (open != true) return;
        inputRef.current.focus();
    }, [inputRef, open])

    useEffect(() => {
        const searchValue = keyword.toLowerCase();
        db.productData().getAll().then((data) => {
            const filteredData = data.filter((x) => {
                if (x['store_id'].split(',').map((s) => s.trim()).includes(`${storeId}`) == false)
                    return false;

                // The searchValue is a string that can contain multiple words. Each word must be found in x['title'].
                const words = searchValue.split(' ');
                const title = x['title'].toLowerCase();
                for (let i = 0; i < words.length; i++) {
                    if (title.includes(words[i]) == false) return false;
                }
                return true;

                // // filter by title.
                // if (x['title'].toLowerCase().includes(searchValue) == false) return false;
                // // // filter by selected store;
                // // if (x['store_id'].split(',').map((s) => s.trim()).includes(`${store_id}`) == false)
                // //   return false;
                // return true;
            }).slice(0, 10);

            setSearchedList(filteredData);
        });
    }, [keyword]);

    const onClickProduct = (product) => {
        setKeyword(product.title);
        if (setOpen) {
            setOpen(false);
        }
        setTimeout(() => {
            navigate("/" + product.link + "/" + product.variation_id)
        }, 100)
    }
    return (
        <Box

        >
            <Box sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#414242',
                borderRadius: {
                    xs: '20px',
                    md: "30px"
                },
                justifyContent: "space-between",
                padding: {
                    xs: "5px 10px",
                    md: "10px 30px"
                }
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
                    inputRef={inputRef}
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                    }}
                    disableUnderline={true}
                    fullWidth
                    sx={{
                        color: '#cecece',
                        fontSize: {
                            xs: "14px",
                            md: "16px",
                            lg: "18px"
                        }
                    }}
                    placeholder="Search our products"
                />

                {keyword.length > 0 &&
                    <Box sx={{
                        width: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                        onClick={() => setKeyword('')}
                        className={"custom-button"}
                    >
                        <ClearIcon />
                    </Box>
                }


            </Box>

            {/* If have search value and openSearchBox just opened the search value box. */}
            {keyword.length > 0
                ? (
                    <List >
                        {searchedList.length > 0 ?
                            searchedList.map((data, index) => (
                                <ListItem
                                    key={`search-product-${data['variation_id']}`}
                                    onClick={() => {
                                        onClickProduct(data);
                                    }}
                                    sx={{
                                        p: '10px',
                                        cursor: 'pointer',
                                        gap: '5px',
                                        alignItems: 'flex-start',
                                        ':hover': { bgcolor: '#32BEB9', borderRadius: '10px' }
                                    }}
                                >
                                    <Image alt="" src={data.product_image} height="100%" width="100%"
                                        sx={{ flex: 1, maxWidth: "100px" }}
                                        className="tile-product-image"
                                    />
                                    <ListItemText
                                        sx={{
                                            flex: 2, '.MuiTypography-root': {
                                                fontSize: {
                                                    xs: "14px",
                                                    md: "18px"
                                                }
                                            }
                                        }}
                                        // primary={highlightText(data.title, keyword)}
                                        primary={
                                            <HighlightTextWidget
                                                keyword={keyword}
                                                text={data.title}
                                                highlightStyle={{
                                                    background: "#7CACF8f0",
                                                    // color: "red"
                                                }}
                                            />
                                        }
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
                            ))
                            :
                            <ListItem
                                key={`search-product`}
                                sx={{
                                    p: '10px',
                                    cursor: 'pointer',
                                    gap: '5px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <ListItemText
                                    sx={{
                                        flex: 2, '.MuiTypography-root': {
                                            fontSize: {
                                                xs: "14px",
                                                md: "18px"
                                            },
                                        }
                                    }}
                                    primary={"No Products"}
                                />
                            </ListItem>
                        }
                    </List>

                )
                : <Box
                    sx={{ pt: "20px", textAlign: 'center' }}
                >
                    <Typography
                        sx={{
                            fontWeight: 'bolder',
                            fontSize: {
                                xs: "14px",
                                md: "18px"
                            },
                        }}
                        component="span"
                        children="Please input keyword to search:"
                    />

                </Box>
            }
        </Box>
    );
};

export default SearchProductWidget;