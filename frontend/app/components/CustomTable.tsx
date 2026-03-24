import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import CustomToolbar from "./data/CustomToolbar"
import { Modal, Stack } from "@mui/material"

type Rows = readonly any[]

interface CustomTableProps {
    label: string
    getData: () => Promise<readonly any[] | undefined>
    columns: GridColDef[]
    AddCard?: React.FC<AddCardProps>
    mutateRow: (row: any, oldRow: any) => any // TODO: figure out types
}

export interface AddCardProps {
    label: string
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    handleAdd: (r: Rows) => void
}

const CustomTable: React.FC<CustomTableProps> = ({ label, getData, columns, AddCard, mutateRow }) => {
    const [rows, setRows] = useState<Rows | undefined>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        getData().then(setRows)
    }, [])

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
                        allowAdd: !!AddCard
                    }
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
