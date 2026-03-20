import { NavigateNextRounded } from "@mui/icons-material"
import { Breadcrumbs, breadcrumbsClasses, Stack, styled, Typography } from "@mui/material"
import type React from "react"
import { useLocation } from "react-router";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
    margin: theme.spacing(1, 0),
    [`& .${breadcrumbsClasses.separator}`]: {
        color: theme.palette.action.disabled,
        margin: 1
    },
    [`& .${breadcrumbsClasses.ol}`]: {
        alignItems: 'center'
    }
}))

const Header: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname?.substring(1);

    const pageName = pathname.length === 0 ? "Home" : pathname.toUpperCase()[0] + pathname.substring(1);

    return (
        <Stack direction="row" sx={{
            display: { xs: 'none', md: 'flex' },
            width: '100%',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            pt: 1.5,
        }}
            spacing={2}>
            <StyledBreadcrumbs aria-label="breadcrumb" separator={<NavigateNextRounded fontSize="small" />}>
                <Typography variant="body1">Dashboard</Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>{pageName ?? "Home"}</Typography>
            </StyledBreadcrumbs>
            {/* <Stack direction="row" gap={1}> */}
            {/*     <IconButton><SearchRounded /></IconButton> */}
            {/*     <IconButton><DownloadRounded /></IconButton> */}
            {/*     <IconButton><RefreshRounded /></IconButton> */}
            {/* </Stack> */}
        </Stack>
    )
}

export default Header
