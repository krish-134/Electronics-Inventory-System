import { Button, ButtonGroup, InputAdornment, Menu, MenuItem, Popover, Stack, styled, tableBodyClasses, TextField, Tooltip, Typography } from "@mui/material"
import { ColumnsPanelTrigger, ExportCsv, ExportPrint, FilterPanelTrigger, GridDownloadIcon, GridFilterListIcon, GridRowSelectionModel, GridSearchIcon, GridToolbarColumnsButton, GridViewColumnIcon, QuickFilter, QuickFilterClear, QuickFilterControl, QuickFilterTrigger, Toolbar, ToolbarButton, useGridApiContext } from "@mui/x-data-grid"
import { Add, Cancel as CancelIcon, PlusOne } from '@mui/icons-material'
import type React from "react"
import { useRef, useState } from "react"
import { IconTrash } from "@tabler/icons-react"

interface OwnerState {
    expanded: boolean
}

const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
})

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
    ({ theme, ownerState }) => ({
        gridArea: '1 / 1',
        width: 'min-content',
        height: 'min-content',
        zIndex: 1,
        opacity: ownerState.expanded ? 0 : 1,
        pointerEvents: ownerState.expanded ? 'none' : 'auto',
        transition: theme.transitions.create(['opacity'])
    })
)

const StyledTextField = styled(TextField)<{
    ownerState: OwnerState
}>(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity'])
}))

const ExportMenu: React.FC = () => {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            <Tooltip title="Export">
                <ToolbarButton ref={triggerRef}
                    id="export-menu-trigger"
                    aria-controls="export-menu"
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={() => setOpen(true)}
                >
                    <GridDownloadIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
            <Menu
                id="export-menu"
                anchorEl={triggerRef.current}
                open={open}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        'aria-labelledby': 'export-menu-trigger'
                    }
                }}
            >
                <ExportCsv render={<MenuItem />}>Download as CSV</ExportCsv>
                <ExportPrint render={<MenuItem />}>Print</ExportPrint>
            </Menu>
        </>
    )
}

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        rowSelectionModel: GridRowSelectionModel
        tableName: string
        onDeleteSuccess: () => void
    }
}

interface ToolbarProps {
    rowSelectionModel: GridRowSelectionModel
    tableName: string
    onDeleteSuccess: () => void
}

interface DeleteConfirmProps {
    rowSelectionModel: GridRowSelectionModel
    tableName: string
    onDeleteSuccess: () => void
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ rowSelectionModel, tableName, onDeleteSuccess }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const deleteRows = async () => {
        const ids = [... rowSelectionModel.ids]
        // TODO: delete rows
        await Promise.all(
            ids.map(id =>
                fetch(`http://localhost:3000/${tableName}/${id}`, { method: "DELETE" })
                .then(res => {
                    console.log(`DELETE: $ {tableName}/{id} status:`, res.status)
                    return res
                })
            )
        )

        onDeleteSuccess()
    }

    const open = !!anchorEl
    const id = open ? 'delete-popover' : undefined

    return (
        <>
            <Tooltip title="Delete">
                <ToolbarButton onClick={handleClick}>
                    <IconTrash />
                </ToolbarButton>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Stack gap={1} sx={{ padding: '0.5rem' }}>
                    <Typography>
                        Are you sure?
                    </Typography>
                    <Button color="error" variant="contained" onClick={deleteRows}>
                        Confirm
                    </Button>
                </Stack>
            </Popover>
        </>
    )
}

const CustomToolbar: React.FC<ToolbarProps> = ({ rowSelectionModel, tableName, onDeleteSuccess }) => {
    const grid = useGridApiContext()
    return (
        <Toolbar>
            <ToolbarButton>
                <Add />
            </ToolbarButton>
            {rowSelectionModel?.ids.size > 0 && (
                <DeleteConfirm 
                    rowSelectionModel={rowSelectionModel} 
                    tableName={tableName} 
                    onDeleteSuccess={onDeleteSuccess}
                />
            )}
            <ColumnsPanelTrigger render={<ToolbarButton />}>
                <GridViewColumnIcon fontSize="small" />
            </ColumnsPanelTrigger>
            <FilterPanelTrigger render={<ToolbarButton />}>
                <GridFilterListIcon fontSize="small" />
            </FilterPanelTrigger>
            <ExportMenu />
            <StyledQuickFilter>
                <QuickFilterTrigger render={(triggerProps, state) => (
                    <Tooltip title="Search" enterDelay={0}>
                        {/* ownerState={{ expanded: state.expanded }} */}
                        <StyledToolbarButton
                            {...triggerProps}
                            ownerState={{ expanded: state.expanded }}
                            color="default"
                            aria-disabled={state.expanded}
                        >
                            <GridSearchIcon fontSize="small" />
                        </StyledToolbarButton>
                    </Tooltip>
                )} />
                <QuickFilterControl
                    render={({ ref, ...controlProps }, state) => (
                        <StyledTextField
                            {...controlProps}
                            ownerState={{ expanded: state.expanded }}
                            inputRef={ref}
                            aria-label="Search"
                            placeholder="Search..."
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <GridSearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: state.value ? (
                                        <InputAdornment position="end">
                                            <QuickFilterClear
                                                edge="end"
                                                size="small"
                                                aria-label="Clear search"
                                                material={{ sx: { marginRight: -0.75 } }}
                                            >
                                                <CancelIcon fontSize="small" />
                                            </QuickFilterClear>
                                        </InputAdornment>
                                    ) : null,
                                    ...controlProps.slotProps?.input,
                                },
                                ...controlProps.slotProps
                            }}
                        />
                    )} />
            </StyledQuickFilter>
        </Toolbar>
    )
}

export default CustomToolbar
