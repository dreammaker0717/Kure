import { Box } from '@mui/material';
import { ButtonCategories } from 'Common/constants';
import { SIG_CHANNEL, SIG_VALID_CATEGORY_CHANGED } from 'Common/signals';
import CategoryDetailWidget from 'components/ProductWidgets/CategoryDetailWidget';
import { useEffect, useState } from 'react';
import { getStoreId, getValidCategoryList } from 'services/storage_services/storage_functions';
const HomePage = () => {
    const storeId = getStoreId();
    const validCategoryList = getValidCategoryList(storeId);
    const [categoryList, setCategoryList] = useState(validCategoryList);

    useEffect(() => {
        // The store_id is changed, update categories based on existence of products
        const channel = new BroadcastChannel(SIG_CHANNEL);
        channel.addEventListener('message', (event) => {
            const eventType = event.data.type;
            switch (eventType) {
                case SIG_VALID_CATEGORY_CHANGED:
                    setCategoryList(getValidCategoryList(getStoreId()));
                    break;
            }
        });
    }, []);

    return (
        <Box sx={{ maxWidth: '1804px', m: { lg: '0 auto' } }}>
            <Box>
                {ButtonCategories
                    .filter(x => categoryList === null || categoryList.includes(x.value))
                    .map((button, index) => {
                        return <CategoryDetailWidget key={`category-${button.value}-${index}`}
                            category_name={button.value}
                            on_category_page={false}
                        />;
                    })}
            </Box>
        </Box>
    );
};

export default HomePage;