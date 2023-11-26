import { Box, Grid, Stack, Typography, Link } from '@mui/material';
import defaultImage from 'assets/images/kure_lm_default_product_image.jpg';
import pdf from 'assets/images/icons/application-pdf.png';
import { ROUTE } from 'routes/CONSTANTS';


const PressReleasePage = () => {
    const cssTypography = {
        fontSize: '1.1em',
        marginBottom: '0.5rem !important'
    };
    const cssTypographyHeader = {
        fontSize: '1em',
        width: '58px'
    };
    const cssLink = {
        fontSize: '1.1em',
        marginBottom: '0.5rem !important',
        color: '#57c4c1'
    };
    return (
        <Grid>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pb: '32px' }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, m: 'auto', px: { xs: '15px', md: '0px' } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pb: '20px' }}>
                        <img src={defaultImage} alt="img" width={139} height={139} />
                        <Box>
                            <Typography>KURE WELLNESS, INC.</Typography>
                            <Typography>License # C12-0000152-LIC</Typography>
                            <Typography>"BE EXCELLENT TO EACH OTHER"</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={cssTypographyHeader}>TO:</Typography>
                        <Box>
                            <Typography sx={cssTypography}>ALL MEDIA OUTLETS</Typography>
                            <Typography sx={cssTypography}>Carole Brodsky, Publicist, Kure</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={cssTypographyHeader}>FROM:</Typography>
                        <Box>
                            <Typography sx={cssTypography}>Wellness</Typography>
                            <Link underline="hover" href="mailto:carole@kuremendocino.com" sx={cssLink}>
                                carole@kuremendocino.com
                            </Link>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={cssTypographyHeader}>RE:</Typography>
                        <Box>
                            <Typography sx={cssTypography}>KURE MENDOCINO INVITATIONAL</Typography>
                            <Typography sx={cssTypography}>August 14, 2021</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1.1em', marginBottom: '0.5rem !important', fontWeight: 'bolder' }}>
                        FOR IMMEDIATE RELEASE
                    </Typography>
                    <Typography sx={{ fontSize: '1.1em', marginBottom: '0.5rem !important', fontWeight: 'bolder' }}>
                        ANNOUNCING THE KURE MENDOCINO INVITATIONAL- A CUSTOMER-DRIVEN CANNABIS COMPETITION
                    </Typography>
                    <Typography sx={cssTypography}>
                        For Russell Green, founder and CEO of Kure Wellness- three Mendocino County dispensaries, a continuing dream is to
                        showcase and market the region's cultivators and distribute their cannabis flowers to a broader audience.
                    </Typography>
                    <Typography sx={cssTypography}>
                        “Despite the fact that Mendocino County cannabis has name recognition, very little of our high-grade products are
                        sold south of the Sonoma County line," says Green. "In order to address this issue, we have created the Kure
                        Mendocino Invitational- a customer-driven contest where customers will vote to determine the premiere county
                        cultivator."
                    </Typography>
                    <Typography sx={cssTypography}>The idea for the Invitational is simple, says Green.</Typography>
                    <Typography sx={cssTypography}>
                        "Come harvest time, we will begin accepting entries from local, licensed farms. The first 28 entrants that meet our
                        high-quality standards will be entered into the contest."
                    </Typography>
                    <Typography sx={cssTypography}>
                        Kure staff will do the heavy lifting- testing, packaging, manufacturing and marketing their flower.
                    </Typography>
                    <Typography sx={cssTypography}>
                        "In February 2022, we will have 28-gram 'sampler' boxes available for purchase by the public. These samplers will
                        contain 28 individual grams from the top 28 farms. We believe the public drives the cannabis market. We respect
                        their opinions and want them to have a say in identifying our region's superior cannabis products."
                    </Typography>
                    <Typography sx={cssTypography}>
                        Customers will have the entire month of February to judge the cannabis samples and submit their votes to a
                        confidential online portal.
                    </Typography>
                    <Typography sx={cssTypography}>
                        The event officially kicks off on September 10th with a farmers-only informational supper held at Kure's Lake
                        Mendocino Drive retail store.
                    </Typography>
                    <Typography sx={cssTypography}>
                        "We will introduce ourselves to our farmers, present the concept of the event and encourage everyone to sign up."
                        Interested cultivators should contact Kure to RSVP.
                    </Typography>
                    <Typography sx={cssTypography}>
                        Following the supper, Kure will begin accepting high-grade flower for consideration from October 1st to December
                        31st.All 28 entrants will be featured in a commemorative booklet, and all 28 entries will be sold at Kure outlets
                        and regional partners.
                    </Typography>
                    <Typography sx={cssTypography}>
                        "Once we've determined the winners, we will host an elegant dinner party for our farmers and their guest on April
                        1st, 2022. We want to keep this event simple, safe and focused on the people who are responsible for growing what is
                        arguably the best cannabis in the world."
                    </Typography>
                    <Typography sx={cssTypography}>
                        "We hope there is enough interest to replicate the Invitational throughout the year, thus providing our farmers with
                        reliable outlets to sell their wares, generating much-needed revenue and credibility for our county while creating a
                        fun, memorable event for our customers and supporters,” Green concludes.
                    </Typography>
                    <Typography sx={{ fontSize: '1.1em', fontWeight: 'bolder' }}>
                        A PDF is attached below. Feel free to share. For more information email <br />
                        <Link underline="hover" href="mailto:info@kuremendocino.com" sx={{ color: '#57c4c1' }}>
                            info@kuremendocino.com
                        </Link>
                        , attention Leslie or phone (707) 621-5390.
                    </Typography>
                </Box>
            </Box>
            <Stack sx={{ px: { xs: '15px', md: '0px' } }}>
                <Typography sx={{ px: '0.5em !important', fontSize: '16px' }}>
                    <Link href={ROUTE.LOGIN} underline="hover" sx={{ color: '#57c4c1' }}>
                        Log in
                    </Link>
                    or
                    <Link href={ROUTE.REGISTER} underline="hover" sx={{ color: '#57c4c1' }}>
                        register
                    </Link>
                    to post comments
                </Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>Attachment</Typography>
                <Box sx={{ pl: '3px' }}>
                    <img src={pdf} alt="img" />
                    <Link href="#" underline="hover" sx={{ color: '#57c4c1' }}>
                        Printable press release
                    </Link>
                </Box>
            </Stack>
        </Grid>
    );
};

export default PressReleasePage;