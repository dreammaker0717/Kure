import React, { useState } from 'react';
import { Box, Input } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchValue from 'components/SearchValue/index';

const ProductSelectWidget = () => {
    const [keyword, setKeyword] = useState('');
    const [openSearchBox, setOpenSearchBox] = useState(false);
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#414242',
                borderRadius: '20px'
            }}
        >
            <Input
                value={keyword}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setOpenSearchBox(true);
                }}
                disableUnderline={true}
                sx={{
                    with: '250px',
                    color: '#cecece',
                    backgroundColor: '#414242',
                    borderRadius: '20px 0 0 20px',
                    fontSize: { xs: '0.75rem', sm: '1rem' },
                    '& .MuiInputBase-input': {
                        p: '6px 12px 7px 12px',
                        height: { xs: '17px', sm: '33px' },
                        textTransform: 'uppercase'
                    },
                    '&::after': { borderBottom: 0 },
                    '&::before': { borderBottom: 0 }
                }}
                placeholder="Search our products"
            />
            <Box sx={{ width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <SearchIcon />
            </Box>

            {/* If have search value and openSearchBox just opened the search value box. */}
            {keyword.length > 0 && openSearchBox && (
                <SearchValue searchValue={keyword} setSearchValue={setKeyword}
                    setopenSearchBox={setOpenSearchBox} />
            )}
        </Box>
    );
};

export default ProductSelectWidget;