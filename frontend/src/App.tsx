import './App.css'
import { alpha, Box, Stack } from '@mui/material'
import SideBar from './components/SideBar';
import Header from './components/Header';
import { useState } from 'react';
import PageContext, { type Page as PageType} from './PageContext';
import Page from './components/layout/Page';

function App() {
    const [page, setPage] = useState<PageType>("Home")
    return (
        <PageContext.Provider value={{page, setPage}}>
            <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
                <SideBar />
                <Box component="main" sx={(theme) => ({
                    flexGrow: 1,
                    overflow: 'auto',
                    backgroundColor: alpha(theme.palette.background.default, 1)
                })}>
                    <Stack spacing={2} sx={{
                        alignItems: 'center',
                        mx: 3,
                        pb: 5,
                        mt: { xs: 8, md: 0 }
                    }}>
                        <Header />
                        <Page page="Home">
                            home
                        </Page>
                        <Page page="Components">
                            components
                        </Page>
                        <Page page="Projects">
                            projects
                        </Page>
                        <Page page="Locations">
                            locations
                        </Page>
                        <Page page="Shipping">
                            shipping
                        </Page>
                        <Page page="Settings">
                            settings
                        </Page>
                    </Stack>
                </Box>
            </Box>
        </PageContext.Provider>
    )
}

export default App
