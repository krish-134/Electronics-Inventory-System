import styled from "@emotion/styled"
import { ConstructionRounded, HomeRounded, LocalShippingRounded, LocationOnRounded, MemoryRounded, MoreVertRounded, SettingsRounded } from "@mui/icons-material"
import { Avatar, Badge, badgeClasses, Box, drawerClasses, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer as MUIDrawer, Stack, Typography } from "@mui/material"
import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router"

const Drawer = styled(MUIDrawer)({
    width: 240,
    flexShrink: 0,
    boxSizing: 'border-box',
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
        width: 240,
        boxSizing: 'border-box'
    }
})

interface MenuOption {
    text: string
    icon: React.ReactNode,
    href: string
}

const TOP_OPTIONS: MenuOption[] = [
    { text: "Home", icon: (<HomeRounded />), href: "/" },
    { text: "Components", icon: (<MemoryRounded />), href: "/components" },
    { text: "Projects", icon: (<ConstructionRounded />), href: "/projects" },
    { text: "Locations", icon: (<LocationOnRounded />), href: "/locations" },
    { text: "Shipping", icon: (<LocalShippingRounded />), href: "/shipping" },
]

const BOT_OPTIONS: MenuOption[] = [
    { text: "Settings", icon: (<SettingsRounded />), href: "/settings" },
]

const SideBar: React.FC = () => {
    const location = useLocation()
    const [showError, setShowError] = useState(false)
    return (
        <Drawer variant="permanent"
            sx={{
                display: { xs: 'none', md: 'block' },
                [`& .${drawerClasses.paper}`]: {
                    backgroundColor: 'background.paper'
                }
            }}
        >
            <Box sx={{
                overflow: 'auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
                    <List dense>
                        {TOP_OPTIONS.map((v, i) => (
                            <ListItem key={i} disablePadding sx={{ display: 'block' }}>
                                <Link to={v.href}>
                                    <ListItemButton selected={location.pathname == v.href}>
                                        <ListItemIcon>{v.icon}</ListItemIcon>
                                        <ListItemText primary={v.text} />
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                        ))}
                    </List>
                    <List dense>
                        {BOT_OPTIONS.map((v, i) => (
                            <ListItem key={i} disablePadding sx={{ display: 'block' }}>
                                <Link to={v.href}>
                                    <ListItemButton selected={location.pathname == v.href}>
                                        <ListItemIcon>{v.icon}</ListItemIcon>
                                        <ListItemText primary={v.text} />
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                        ))}
                    </List>
                </Stack>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', p: 2, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Avatar sizes="small" sx={{ width: 36, height: 36 }} />
                <Box sx={{ mr: 'auto' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
                        First Last
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        student@ubc.ca
                    </Typography>
                </Box>

                <Badge color="error" variant="dot" invisible={!showError} sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}>
                    <IconButton size="small">
                        <MoreVertRounded />
                    </IconButton>
                </Badge>
            </Stack>
        </Drawer>
    )
}

export default SideBar
