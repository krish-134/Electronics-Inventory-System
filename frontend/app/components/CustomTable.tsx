import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useEffect, useState } from "react"
import CustomToolbar from "./data/CustomToolbar"
import { Modal, Stack } from "@mui/material"

type Row = readonly any[]

interface CustomTableProps {
    label: string
    getData: () => Promise<readonly any[] | undefined>
    columns: GridColDef[]
    AddCard: React.FC<AddCardProps>
}

export interface AddCardProps {
    label: string
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    handleAdd: (r: Row) => void
}

const CustomTable: React.FC<CustomTableProps> = ({ label, getData, columns, AddCard }) => {
    const [rows, setRows] = useState<Row | undefined>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        getData().then(setRows)
    }, [])

    const handleModalClose = () => {
    }

    const handleAdd = (r: Row) => {
        setRows(oldRows => [...(oldRows ?? []), { id: rows?.length, ...r }])
    }

    return (
        <>
            <Modal open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby=""
                aria-describedby="">
                <Stack justifyContent="center" alignItems="center" height="100%" width="100%">
                    <AddCard label={label} setModalOpen={setModalOpen} handleAdd={handleAdd} />
                </Stack>
            </Modal>
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
                        setModalOpen
                    }
                }}
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={setRowSelectionModel}
            />
        </>
    )
}

export default CustomTable
