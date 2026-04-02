import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import CustomToolbar from "./data/CustomToolbar"
import { GlobalStyles, Modal, Stack } from "@mui/material"
import Toast, { ToastInput, ToastStyle } from "./Toast"

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

    const [toastContent, setToastContent] = useState<ToastInput>();
    const [toastOpen, setToastOpen] = useState<boolean>(false);

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
        setRows(oldRows => [...(oldRows ?? []), { id: rows?.length, ...r }]);
        setToastContent({ display: "Successfully added item!", level: ToastStyle.SUCCESS });
        setToastOpen(true);
    };

    const processUpdate = useCallback(async (newRow: any, oldRow: any) => {
        const response = await mutateRow(newRow, oldRow);
        if (JSON.stringify(oldRow) !== JSON.stringify(newRow)){
            setToastContent({ display: "Successfully updated item!", level: ToastStyle.SUCCESS });
            setToastOpen(true);
        }
        return response;
    }, [mutateRow])

    const handleProcessRowUpdateError = useCallback((err: any) => {
        setToastContent({ display: err.message, level: ToastStyle.ERROR });
        setToastOpen(true);
    }, []);

    return (
        <>
            <Toast open={toastOpen} setOpen={setToastOpen} content={toastContent} />
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
