import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  styled
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  letterSpacing: '.3rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

interface NavButtonProps {
  active: boolean;
}

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active'
})<NavButtonProps>(({ theme, active }) => ({
  margin: theme.spacing(0, 1),
  fontWeight: 600,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: active ? '10%' : '50%',
    right: active ? '10%' : '50%',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    transition: 'all 0.3s ease',
    opacity: active ? 1 : 0,
  },
  '&:hover::after': {
    left: '10%',
    right: '10%',
    opacity: 1,
  },
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
}));

interface DrawerListItemProps {
  active: boolean;
}

const DrawerListItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'active'
})<DrawerListItemProps & { onClick?: React.MouseEventHandler }>(({ theme, active }) => ({
  borderLeft: active ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  backgroundColor: active ? 'rgba(230, 169, 84, 0.08)' : 'transparent',
  transition: 'all 0.3s ease',
  padding: theme.spacing(1.5),
  cursor: 'pointer',
  listStyleType: 'none',
  '&:hover': {
    backgroundColor: 'rgba(230, 169, 84, 0.15)',
    borderLeft: `4px solid ${theme.palette.primary.light}`,
  }
}));

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const navItems = [
    { name: 'YouTube İndirme', path: '/youtube-downloader' },
    { name: 'YouTube MP3', path: '/youtube-to-mp3' },
    { name: 'Instagram', path: '/instagram-downloader' },
    { name: 'TikTok', path: '/tiktok-downloader' },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <LogoText variant="h5" sx={{ textDecoration: 'none' }}>
          <Box component={Link} to="/" sx={{ textDecoration: 'none' }}>
            VBULK
          </Box>
        </LogoText>
      </Box>
      <List>
        {navItems.map((item) => (
          <DrawerListItem 
            key={item.name}
            active={isActiveRoute(item.path)}
            onClick={toggleDrawer}
          >
            <Box component={Link} to={item.path} sx={{ textDecoration: 'none', width: '100%', display: 'block' }}>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ fontWeight: isActiveRoute(item.path) ? 600 : 400 }}
              />
            </Box>
          </DrawerListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <StyledAppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ flexWrap: 'wrap', py: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <LogoText
            variant="h6"
            noWrap
            sx={{ 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <CloudDownloadIcon sx={{ mr: 1, transform: 'translateY(-2px)' }} />
              VBULK
            </Box>
          </LogoText>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ color: theme.palette.primary.main }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer}
              PaperProps={{
                sx: { backgroundColor: theme.palette.background.default }
              }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex' }}>
            {navItems.map((item) => (
              <NavButton
                key={item.name}
                active={isActiveRoute(item.path)}
              >
                <Box component={Link} to={item.path} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  {item.name}
                </Box>
              </NavButton>
            ))}
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar; 