import {
    Box,
    Stack,
    Typography,
    Link,
    Divider,
    Drawer,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { makeStyles } from '@mui/styles';
import ProductSelectWidget from '../../Header/ProductSelectWidget/ProductSelectWidget';
import SearchProductWidget from './SearchProductWidget';

const useStyles = makeStyles({
    list: {
        width: 250
    },
    fullList: {
        width: "auto"
    },
    paper: {
        background: "#383737fa"
    }
});

const DrawerSearchProducts = () => {
    const { values: commonData, setValue: setCommonData } = useCommonData();
    const classes = useStyles();

    const open = commonData[CommonDataIndex.OPEN_SEARCH_PRODUCT_DRAWER];
    const setOpen = (is_open) => setCommonData(CommonDataIndex.OPEN_SEARCH_PRODUCT_DRAWER, is_open);
    return (
        <Drawer
            anchor={"bottom"}
            open={open}
            onClose={() => setOpen(false)}
            ModalProps={{ keepMounted: true, }}
            classes={{ paper: classes.paper }}
        >
            <Box sx={{
                width: '98vw',
                padding: {
                    xs: "10px",
                    md: "20px"
                },
                color: 'white',
                minHeight: "100vh"
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    fontSize: '36px',
                    fontWeight: 'bold',

                }}>
                    <Typography
                        variant={'h5'}
                        sx={{
                            fontSize: {
                                xs: "16px",
                                md: "30px"
                            }
                        }}
                    >Search your products.</Typography>
                    <HighlightOffIcon
                        sx={{ width: '50px', minHeight: '50px', cursor: 'pointer' }}
                        onClick={() => setOpen(false)}
                    ></HighlightOffIcon>
                </Box>

                <SearchProductWidget open={open} setOpen={setOpen} />
            </Box>
        </Drawer>
    );
};

export default DrawerSearchProducts;