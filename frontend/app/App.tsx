import './App.css'
import { alpha, Box, Stack } from '@mui/material'
import SideBar from './components/SideBar';
import Header from './components/Header';
import { useState } from 'react';
import PageContext, { type Page as PageType} from './PageContext';
import Page from './components/layout/Page';
import { Outlet } from 'react-router-dom';

function App() {
    const [page, setPage] = useState<PageType>("Home")
    return (
        <PageContext.Provider value={{page, setPage}}>
        </PageContext.Provider>
    )
}

export default App
