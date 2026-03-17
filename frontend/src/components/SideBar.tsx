import styled from "@emotion/styled"
import { ConstructionRounded, HomeRounded, LocalShippingRounded, LocationOnRounded, MemoryRounded, MoreVertRounded, SettingsRounded } from "@mui/icons-material"
import { Avatar, Badge, badgeClasses, Box, drawerClasses, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer as MUIDrawer, Stack, Typography } from "@mui/material"
import { Button, IconButton } from "./StyledIcons"
import type React from "react"
import { useState } from "react"

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

const TOP_OPTIONS = [
    { text: "Home", icon: (<HomeRounded />) },
    { text: "Components", icon: (<MemoryRounded />) },
    { text: "Projects", icon: (<ConstructionRounded />) },
    { text: "Locations", icon: (<LocationOnRounded />) },
    { text: "Shipping", icon: (<LocalShippingRounded />) },
]

const BOT_OPTIONS = [
    { text: "Settings", icon: (<SettingsRounded />) },
]

const SideBar: React.FC = () => {
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
                                <ListItemButton selected={i == 0}>
                                    <ListItemIcon>{v.icon}</ListItemIcon>
                                    <ListItemText primary={v.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <List dense>
                        {BOT_OPTIONS.map((v, i) => (
                            <ListItem key={i} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton>
                                    <ListItemIcon>{v.icon}</ListItemIcon>
                                    <ListItemText primary={v.text} />
                                </ListItemButton>
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
