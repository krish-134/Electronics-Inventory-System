import './index.css'
import ThemeProvider from './ThemeProvider'
import { alpha, Box, InitColorSchemeScript, Stack } from '@mui/material'
import SideBar from './components/SideBar.tsx'
import Header from './components/Header.tsx'

import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Route } from './+types/root'
import { ToastProvider } from './ToastProvider.tsx'

export function Layout({ children }) {
    return (
        <ToastProvider>
            <html lang="en" suppressHydrationWarning data-mui-color-scheme="dark">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <Meta />
                    <Links />
                </head>
                <body>
                    <InitColorSchemeScript attribute="class" />
                    <ThemeProvider>
                        
                        {children}
                    </ThemeProvider>
                    <ScrollRestoration />
                    <Scripts />
                </body>
            </html>
        </ToastProvider>
        
    )
}

export function HydrateFallback() {
    return <h1>loading</h1>
}

export default function App() {
    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
            <SideBar />
            <Box component="main" sx={(theme) => ({
                flexGrow: 1,
                overflow: 'auto',
                backgroundColor: alpha(theme.palette.background.default, 1)
            })}>
                <Stack spacing={2} sx={{
                    alignItems: 'stretch',
                    mx: 3,
                    pb: 5,
                    mt: { xs: 8, md: 0 }
                }}>
                    <Header />
                    <Outlet />
                </Stack>
            </Box>
        </Box>
    )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
