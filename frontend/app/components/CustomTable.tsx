import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useEffect, useState } from "react"
import CustomToolbar from "./data/CustomToolbar"
import { Modal, Stack } from "@mui/material"

interface CustomTableProps {
    label: string
    getData: () => Promise<readonly any[] | undefined>
    columns: GridColDef[]
    AddCard: React.FC<AddCardProps>
}

export interface AddCardProps {
    label: string
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CustomTable: React.FC<CustomTableProps> = ({ label, getData, columns, AddCard }) => {
    const [vals, setVals] = useState<readonly any[] | undefined>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        getData().then(setVals)
    }, [])

    const handleModalClose = () => {
    }

    return (
        <>
            <Modal open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby=""
                aria-describedby="">
                <Stack justifyContent="center" alignItems="center" height="100%" width="100%">
                    <AddCard label={label} setModalOpen={setModalOpen} />
                </Stack>
            </Modal>
            <DataGrid
                label={label}
                checkboxSelection
                rows={vals}
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
