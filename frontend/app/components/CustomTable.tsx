import { DataGrid, GridColDef, GridRowEntry, GridRowSelectionModel } from "@mui/x-data-grid"
import type React from "react"
import { useEffect, useState } from "react"
import CustomToolbar from "./data/CustomToolbar"

interface CustomTableProps {
    label: string
    getData: () => Promise<readonly any[] | undefined>
    columns: GridColDef[]
}

const CustomTable: React.FC<CustomTableProps> = ({ label, getData, columns }) => {
    const [vals, setVals] = useState<readonly any[] | undefined>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()

    useEffect(() => {
        getData().then(setVals)
    }, [])

    return (
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
                    rowSelectionModel
                }
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={setRowSelectionModel}
        />
    )
}

export default CustomTable
