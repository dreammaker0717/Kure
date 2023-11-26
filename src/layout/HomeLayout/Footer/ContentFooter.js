import { Box, Typography, ListItemText, ListItemIcon, ListItem, List, } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTE } from 'routes/CONSTANTS';

function ContentFooter({ content }) {
    return (
        <Box sx={{ mx: 1, my: 2, width: {xs: '100%', sm: '40%', lg: 'auto'} }}>
            <Typography component="h2" sx={{ fontSize: '20px', mb: '0.5rem' }}>
                {content.title}
            </Typography>
            <List>
                {content.data.map((item, index) => (
                    <ListItem key={index} sx={{ display: 'flex', alignItems: 'center', p: 0, '& a': { textDecoration: 'none' } }}>
                        {item.icon && (
                            <ListItemIcon sx={{ minWidth: '0', mr: '3px', pb: '3px', '& img': { width: '16px', height: '16px' } }}>
                                <img src={item.icon} alt="" />
                            </ListItemIcon>
                        )}
                        <Link to={ROUTE.HOME}>
                            <ListItemText
                                sx={{
                                    color: '#fff',
                                    fontSize: '15px',
                                    pt: content.title === 'Company' ? '3px' : 0,
                                    m: 0,
                                    '& .MuiTypography-root': { lineHeight: 1.57 },
                                    '&:hover': { textDecoration: item.link ? 'underline' : 'none', cursor: item.link ? 'pointer' : 'default' }
                                }}
                                primary={item.text}
                            />
                        </Link>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default ContentFooter;
