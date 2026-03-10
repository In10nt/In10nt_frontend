import { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'

const drawerWidth = 240
const drawerWidthCollapsed = 65

function Layout({ user, onLogout, children, tabs, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    onLogout()
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: '#D32F2F' }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <svg viewBox="0 0 200 60" width="150" height="45">
              <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold">
                <tspan fill="#D32F2F">iN</tspan>
                <tspan fill="#666666">10N</tspan>
                <tspan fill="#D32F2F">T</tspan>
              </text>
            </svg>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ color: '#333333', fontWeight: 500 }}>
              {user.fullName}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{ bgcolor: '#D32F2F', width: 40, height: 40 }}
                src={user.profilePicture}
              >
                {user.fullName.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Role: {user.role}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {tabs && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarOpen ? drawerWidth : drawerWidthCollapsed,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? drawerWidth : drawerWidthCollapsed,
              boxSizing: 'border-box',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: 'hidden',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {tabs.map((tab) => (
                <ListItem key={tab.id} disablePadding>
                  <ListItemButton
                    selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        borderLeft: '4px solid',
                        borderLeftColor: '#D32F2F',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.12)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 3 : 'auto',
                        justifyContent: 'center',
                        color: activeTab === tab.id ? '#D32F2F' : 'inherit',
                      }}
                    >
                      {tab.icon}
                    </ListItemIcon>
                    {sidebarOpen && (
                      <ListItemText
                        primary={tab.label}
                        sx={{
                          color: activeTab === tab.id ? '#D32F2F' : 'inherit',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
