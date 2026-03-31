import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import CustomToolbar from "./CustomToolbar"
import { GlobalStyles, Modal, Stack } from "@mui/material"

type Rows = readonly any[]

export interface CustomTableProps {
    label: string
    getData: () => Promise<readonly any[] | undefined>
    columns: GridColDef[]
    AddCard?: React.FC<AddCardProps>
    mutateRow: (row: any, oldRow: any) => any // TODO: figure out types
    handleDelete?: (ids: any[]) => Promise<void>
}

export interface AddCardProps {
    label: string
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    handleAdd: (r: Rows) => void
}

const CustomTable: React.FC<CustomTableProps> = ({ label, getData, columns, AddCard, mutateRow, handleDelete }) => {
    const [rows, setRows] = useState<Rows | undefined>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()
    const [modalOpen, setModalOpen] = useState(false)
    const location = useLocation()
    const hasScrolled = useRef(false)

    useEffect(() => {
        getData().then(setRows)
    }, [])

    useEffect(() => {
        if (!location.hash || !rows?.length || hasScrolled.current) return;
        const id = decodeURIComponent(location.hash.slice(1));
        requestAnimationFrame(() => {
            const el = document.querySelector(`div[data-id="${CSS.escape(id)}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('row-highlight');
                el.addEventListener('animationend', () => el.classList.remove('row-highlight'), { once: true });
                hasScrolled.current = true;
            }
        });
    }, [rows, location.hash])

    const handleModalClose = () => {
    }

    const handleAdd = (r: Rows) => {
        setRows(oldRows => [...(oldRows ?? []), { id: rows?.length, ...r }])
    }

    const processUpdate = useCallback(async (newRow: any, oldRow: any) => {
        const response = await mutateRow(newRow, oldRow);
        // TODO: better feedback
        return response;
    }, [mutateRow])

    const handleProcessRowUpdateError = useCallback(err => {
        // TODO: better feedback
        // alert(err)
        console.error(err)
    }, []);

    return (
        <>
            <GlobalStyles styles={{
                '@keyframes row-flash': {
                    '0%': { backgroundColor: 'transparent' },
                    '30%': { backgroundColor: 'rgba(25, 118, 210, 0.15)' },
                    '100%': { backgroundColor: 'transparent' },
                },
                '.row-highlight': {
                    animation: 'row-flash 3s ease',
                },
            }} />
            {AddCard && (
                <Modal open={modalOpen}
                    onClose={handleModalClose}
                    aria-labelledby=""
                    aria-describedby="">
                    <Stack justifyContent="center" alignItems="center" height="100%" width="100%">
                        <AddCard label={label} setModalOpen={setModalOpen} handleAdd={handleAdd} />
                    </Stack>
                </Modal>
            )}
            <DataGrid
                label={label}
                checkboxSelection
                rows={rows}
                columns={columns}
                disableColumnResize
                density="compact"
                showToolbar
                slots={{
                    toolbar: CustomToolbar
                }}
                slotProps={{
                    loadingOverlay: {
                        variant: 'skeleton',
                        noRowsVariant: 'skeleton'
                    },
                    toolbar: {
                        rowSelectionModel,
                        setModalOpen,
                        allowAdd: !!AddCard,
                        onDelete: handleDelete,
                        onDeleteSuccess: () => getData().then(setRows)
                    },
                }}
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={setRowSelectionModel}
                processRowUpdate={processUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
            />
        </>
    )
}

export default CustomTable
