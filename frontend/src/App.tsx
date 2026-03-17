import './App.css'
import DBTable from './components/DBTable';
import { alpha, Box, Stack } from '@mui/material'
import SideBar from './components/SideBar';
import Header from './components/Header';

function App() {
    return (
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
                    <Stack direction="column" gap={2} sx={{ width: '100%' }}>
                        <DBTable tableName='component' />
                        <DBTable tableName='supplier' />
                        <DBTable tableName='location' />
                    </Stack>
                </Stack>
            </Box>
        </Box>
    )
}

export default App
