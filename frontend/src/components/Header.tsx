import { DownloadRounded, NavigateNextRounded, RefreshRounded } from "@mui/icons-material"
import { Breadcrumbs, breadcrumbsClasses, IconButton, Stack, styled, Typography } from "@mui/material"
import { SearchRounded } from '@mui/icons-material';
import type React from "react"
import { useContext } from "react";
import PageContext from "../PageContext";

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
    const { page } = useContext(PageContext)

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
                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>{page}</Typography>
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
