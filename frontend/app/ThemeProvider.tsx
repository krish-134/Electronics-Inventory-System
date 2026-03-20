import { CheckBoxOutlineBlankRounded, CheckRounded, RemoveRounded, UnfoldMoreRounded } from "@mui/icons-material";
import { CssBaseline, ThemeProvider as MUIThemeProvider, alpha, buttonBaseClasses, checkboxClasses, createTheme, dividerClasses, iconButtonClasses, listClasses, listItemIconClasses, menuItemClasses, paperClasses, selectClasses, svgIconClasses, tabClasses, tablePaginationClasses, typographyClasses, type Components, type SvgIconProps, type Theme } from "@mui/material";
import { gridClasses } from '@mui/x-data-grid'
import React from "react";

import type { PaletteMode, Shadows } from '@mui/material/styles';

export const brand = {
    50: 'hsl(210, 100%, 95%)',
    100: 'hsl(210, 100%, 92%)',
    200: 'hsl(210, 100%, 80%)',
    300: 'hsl(210, 100%, 65%)',
    400: 'hsl(210, 98%, 48%)',
    500: 'hsl(210, 98%, 42%)',
    600: 'hsl(210, 98%, 55%)',
    700: 'hsl(210, 100%, 35%)',
    800: 'hsl(210, 100%, 16%)',
    900: 'hsl(210, 100%, 21%)',
};

export const gray = {
    50: 'hsl(220, 35%, 97%)',
    100: 'hsl(220, 30%, 94%)',
    200: 'hsl(220, 20%, 88%)',
    300: 'hsl(220, 20%, 80%)',
    400: 'hsl(220, 20%, 65%)',
    500: 'hsl(220, 20%, 42%)',
    600: 'hsl(220, 20%, 35%)',
    700: 'hsl(220, 20%, 25%)',
    800: 'hsl(220, 30%, 6%)',
    900: 'hsl(220, 35%, 3%)',
};

const paper = 'hsl(220, 30%, 7%)';

interface ThemeProviderProps {
    children: React.ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }: ThemeProviderProps) => {
    const theme = React.useMemo(() => {
        return createTheme({
            shape: {
                borderRadius: 8
            },
            palette: {
                mode: 'dark',
                primary: {
                    contrastText: brand[50],
                    light: brand[300],
                    main: brand[400],
                    dark: brand[700],
                },
                grey: {
                    ...gray,
                },
                divider: alpha(gray[700], 0.6),
                background: {
                    default: gray[900],
                    paper,
                },
                text: {
                    primary: 'hsl(0, 0%, 100%)',
                    secondary: gray[400],
                },
                action: {
                    hover: alpha(gray[600], 0.2),
                    selected: alpha(gray[600], 0.3),
                },
                DataGrid: {
                    headerBg: paper
                }
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            boxShadow: 'none',
                            borderRadius: theme.shape.borderRadius,
                            textTransform: 'none',
                            variants: [
                                {
                                    props: {
                                        size: 'small',
                                    },
                                    style: {
                                        height: '2.25rem',
                                        padding: '8px 12px'
                                    }
                                },
                                {
                                    props: {
                                        variant: 'outlined'
                                    },
                                    style: {
                                        color: theme.palette.text.primary,
                                        border: '1px solid',
                                        borderColor: gray[700],
                                        backgroundColor: gray[800],
                                        '&:hover': {
                                            backgroundColor: gray[900],
                                            borderColor: gray[600],
                                        }
                                    }
                                }
                            ]
                        })
                    }
                },
                MuiIconButton: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            boxShadow: 'none',
                            borderRadius: theme.shape.borderRadius,
                            textTransform: 'none',
                            fontWeight: theme.typography.fontWeightMedium,
                            letterSpacing: 0,
                            color: theme.palette.text.primary,
                            border: '1px solid',
                            borderColor: gray[700],
                            backgroundColor: gray[800],
                            '&:hover': {
                                backgroundColor: gray[900],
                                borderColor: gray[600],
                            },
                            '&:active': {
                                backgroundColor: gray[900]
                            },
                            variants: [
                                {
                                    props: {
                                        size: 'small'
                                    },
                                    style: {
                                        width: '2.25rem',
                                        height: '2.25rem',
                                        padding: '0.25rem',
                                        [`& .${svgIconClasses.root}`]: { fontSize: '1rem' },
                                    }
                                },
                                {
                                    props: {
                                        size: 'medium'
                                    },
                                    style: {
                                        width: '2.5rem',
                                        height: '2.5rem',
                                    }
                                }
                            ]
                        })
                    }
                },
                MuiCheckbox: {
                    defaultProps: {
                        disableRipple: true,
                        icon: (<CheckBoxOutlineBlankRounded sx={{ color: 'hsla(210, 0%, 0%, 0.0)' }} />),
                        checkedIcon: (<CheckRounded sx={{ height: 14, width: 14 }} />),
                        indeterminateIcon: (<RemoveRounded sx={{ height: 14, width: 14 }} />)
                    },
                    styleOverrides: {
                        root: ({ theme }) => ({
                            margin: 10,
                            height: 16,
                            width: 16,
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: alpha(gray[700], 0.8),
                            boxShadow: '0 0 0 1.5px hsl(210, 0%, 0%) inset',
                            backgroundColor: alpha(gray[900], 0.8),
                            transition: 'border-color, background-color, 120ms ease-in',
                            '&:hover': {
                                borderColor: brand[300]
                            },
                            '&.Mui-focusVisible': {
                                borderColor: brand[400],
                                outline: `3px solid ${alpha(brand[500], 0.5)}`,
                                outlineOffset: '2px'
                            },
                            '&.Mui-checked': {
                                color: 'white',
                                backgroundColor: brand[500],
                                borderColor: brand[500],
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: brand[600]
                                }
                            }
                        })
                    }
                },
                MuiList: {
                    styleOverrides: {
                        root: {
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0
                        }
                    }
                },
                MuiListItem: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            [`& .${svgIconClasses.root}`]: {
                                width: '1rem',
                                height: '1rem',
                                color: theme.palette.text.secondary
                            },
                            [`& .${typographyClasses.root}`]: {
                                fontWeight: 500
                            },
                            [`& .${buttonBaseClasses.root}`]: {
                                display: 'flex',
                                gap: 8,
                                padding: '2px 8px',
                                borderRadius: theme.shape.borderRadius,
                                opacity: 0.7,
                                '&.Mui-selected': {
                                    opacity: 1,
                                    backgroundColor: alpha(theme.palette.action.selected, 0.3),
                                    [`& .${svgIconClasses.root}`]: {
                                        color: theme.palette.text.primary,
                                    },
                                    '&:focus-visible': {
                                        backgroundColor: alpha(theme.palette.action.selected, 0.3)
                                    },
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.action.selected, 0.5)
                                    }
                                },
                                '&:focus-visible': {
                                    backgroundColor: 'transparent'
                                }
                            },
                        })
                    }
                },
                MuiListItemText: {
                    styleOverrides: {
                        primary: ({ theme }) => ({
                            fontSize: theme.typography.body2.fontSize,
                            fontWeight: 500,
                            lineHeight: theme.typography.body2.lineHeight
                        }),
                        secondary: ({ theme }) => ({
                            fontSize: theme.typography.caption.fontSize,
                            lineHeight: theme.typography.caption.lineHeight,
                        })
                    }
                },
                MuiListSubheader: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            backgroundColor: 'transparent',
                            padding: '4px 8px',
                            fontSize: theme.typography.caption.fontSize,
                            fontWeight: 500,
                            lineHeight: theme.typography.caption.lineHeight
                        })
                    }
                },
                MuiListItemIcon: {
                    styleOverrides: {
                        root: {
                            minWidth: 0,
                        }
                    }
                },
                MuiIcon: {
                    defaultProps: {
                        fontSize: 'small'
                    },
                    styleOverrides: {
                        root: {
                            variants: [
                                {
                                    props: { fontSize: 'small' },
                                    style: {
                                        fontSize: '1rem'
                                    }
                                },
                            ]
                        }
                    }
                },
                MuiCard: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            padding: 16,
                            gap: 16,
                            transition: 'all 100ms ease',
                            backgroundColor: gray[800],
                            borderRadius: theme.shape.borderRadius,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: 'none',
                            variants: [
                                {
                                    props: { variant: 'outlined' },
                                    style: {
                                        border: `1px solid ${theme.palette.divider}`,
                                        background: alpha(gray[900], 0.4)
                                    }
                                }
                            ]
                        })
                    }
                },
                MuiCardContent: {
                    styleOverrides: {
                        root: {
                            padding: 0,
                            '&:last-child': { paddingBottom: 0 },
                        }
                    }
                },
                MuiCardHeader: {
                    styleOverrides: {
                        root: {
                            padding: 0,
                        }
                    }
                },
                MuiCardActions: {
                    styleOverrides: {
                        root: {
                            padding: 0,
                        }
                    }
                },
                MuiPaper: {
                    defaultProps: {
                        elevation: 0,
                    }
                },
                MuiDataGrid: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.background.default,
                            [`& .${gridClasses.columnHeader}`]: {
                                backgroundColor: theme.palette.background.paper,
                            },
                            [`& .${gridClasses.footerContainer}`]: {
                                backgroundColor: theme.palette.background.paper,
                            },
                            [`& .${checkboxClasses.root}`]: {
                                padding: theme.spacing(0.5),
                                '& > svg': {
                                    fontSize: '1rem'
                                }
                            },
                            [`& .${tablePaginationClasses.root}`]: {
                                marginRight: theme.spacing(1),
                                '& .MuiIconButton-root': {
                                    maxHeight: 32,
                                    maxWidth: 32,
                                    '& > svg': {
                                        fontSize: '1rem'
                                    }
                                }
                            }
                        }),
                        cell:  ({ theme }) => ({
                            borderTopColor: theme.palette.divider
                        }),
                        menu: ({ theme }) => ({
                            borderRadius: theme.shape.borderRadius,
                            backgroundImage: 'none',
                            [`& .${paperClasses.root}`]: {
                                border: `1px solid ${theme.palette.divider}`,
                            },
                            [`& .${menuItemClasses.root}`]: {
                                margin: '0 4px'
                            },
                            [`& .${listItemIconClasses.root}`]: {
                                marginRight: 0,
                            },
                            [`& .${listClasses.root}`]: {
                                paddingLeft: 0,
                                paddingRight: 0
                            }
                        }),
                        row: ({ theme }) => ({
                            '&:last-of-type': {
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            },
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                            '&.Mui-selected': {
                                background: theme.palette.action.selected,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }
                        }),
                        iconButtonContainer: ({ theme }) => ({
                            [`& .${iconButtonClasses.root}`]: {
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: gray[50],
                                '&:hover': {
                                    backgroundColor: gray[800],
                                },
                                '&:active': {
                                    backgroundColor: gray[900]
                                }
                            }
                        }),
                        menuIconButton: ({ theme }) => ({
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: gray[50],
                            '&:hover': {
                                backgroundColor: gray[800],
                            },
                            '&:active': {
                                backgroundColor: gray[900]
                            }
                        }),
                        filterForm: ({ theme }) => ({
                            gap: theme.spacing(1),
                            alignItems: 'flex-end'
                        }),
                        columnsManagementHeader: ({ theme }) => ({
                            paddingRight: theme.spacing(3),
                            paddingLeft: theme.spacing(3),
                        }),
                        columnHeaderTitleContainer: {
                            flexGrow: 1,
                            justifyContent: 'space-between'
                        },
                        columnHeaderDraggableContainer: { paddingRight: 2 }
                    }
                },
            }
        })
    }, []);

    return (
        <MUIThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MUIThemeProvider>
    )
}

export default ThemeProvider
