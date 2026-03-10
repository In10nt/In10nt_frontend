import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft,
  Assignment,
  People,
  EventNote,
  AttachMoney,
  Inventory,
  Subscriptions,
  Person,
  Logout,
  Folder,
  Group
} from '@mui/icons-material'
import NotificationBell from '../components/common/NotificationBell'

const drawerWidth = 240
const collapsedWidth = 65

function Layout({ user, onLogout, children, tabs, activeTab, setActiveTab }) {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const getIcon = (tabId) => {
    const iconMap = {
      tasks: <Assignment />,
      projects: <Folder />,
      projectMembers: <Group />,
      employees: <People />,
      leaves: <EventNote />,
      salary: <AttachMoney />,
      inventory: <Inventory />,
      subscriptions: <Subscriptions />,
      profile: <Person />
    }
    return iconMap[tabId] || <Assignment />
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 2, color: '#c71f37' }}
          >
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              <span style={{ color: '#c71f37' }}>iN</span>
              <span style={{ color: '#000000' }}>10N</span>
              <span style={{ color: '#c71f37' }}>T</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationBell user={user} />
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, color: '#000000' }}>
              {user.fullName} ({user.role})
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              sx={{ color: '#c71f37' }}
            >
              <Avatar 
                src={user.profilePicture} 
                sx={{ width: 32, height: 32, bgcolor: '#c71f37' }}
              >
                {user.fullName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
      >
        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : collapsedWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List>
            {tabs?.map((tab) => (
              <ListItem
                button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: activeTab === tab.id ? '#c71f37' : '#ffffff',
                  color: activeTab === tab.id ? '#fff' : '#000000',
                  '&:hover': {
                    backgroundColor: activeTab === tab.id ? '#c71f37' : '#f5f5f5',
                  },
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: activeTab === tab.id ? '#fff' : '#c71f37',
                  }}
                >
                  {getIcon(tab.id)}
                </ListItemIcon>
                <ListItemText
                  primary={tab.label}
                  sx={{
                    opacity: drawerOpen ? 1 : 0,
                    transition: theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shorter,
                    }),
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default Layout
