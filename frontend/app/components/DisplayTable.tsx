import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel, Toolbar, ToolbarProps } from "@mui/x-data-grid"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { formatString } from "../routes/locations"

interface DisplayTableProps {
    label: string
    data: object[]
}

const DisplayTable: React.FC<DisplayTableProps> = ({ label, data }) => {
    if (!data.length) return <></>;

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>()
    const columns: GridColDef[] = Object.keys(data[0]).map((col) => {return {field: col, headerName: formatString(col), editable: false, flex: 1  }});
    const rows = data.map((row, index) => ({id: index, ...row}));

    return (
        <DataGrid
            label={label}
            sx={{mt:3}}
            checkboxSelection
            rows={rows}
            columns={columns}
            disableColumnResize
            density="compact"
            showToolbar
            slots={{
                toolbar: () => <Toolbar/>
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={setRowSelectionModel}
        />
    )
}

export default DisplayTable
