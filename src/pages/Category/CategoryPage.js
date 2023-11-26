import { Box } from '@mui/material';
import CategoryDetailWidget from 'components/ProductWidgets/CategoryDetailWidget';
import { useParams } from 'react-router-dom';
const CategoryPage = () => {
    const { product_category } = useParams();
    // Pass on_category_page props when router catches category select event.
    return (
        <Box sx={{ maxWidth: '1804px', m: { lg: '0 auto' } }}>
            <CategoryDetailWidget category_name={product_category} on_category_page={true} />
        </Box>
    );
};

export default CategoryPage;