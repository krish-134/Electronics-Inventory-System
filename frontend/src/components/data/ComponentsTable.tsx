import { Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
    { field: 'part_num', headerName: 'Part #', description: 'Part Number' },
    { field: 'name', headerName: 'Name', description: 'Part Name' },
    { field: 'price', headerName: 'Price' },
    { field: 'quantity', headerName: 'Quantity' },
    { field: 'package', headerName: 'Package' },
    { field: 'tolerance', headerName: 'Tolerance' },
    { field: 'voltage_rating', headerName: 'Voltage Rating' },
    { field: 'additional', headerName: 'Additional', description: 'Additional Data' },
    { field: 'storage', headerName: 'Storage', description: 'Storage Location' }
];

const ComponentsTable: React.FC = () => {
    const [vals, setVals] = useState<object[]>([])

    useEffect(() => {
        fetch(`http://localhost:3000/components/all`)
            .then(res => res.json())
            .then(json => {
                setVals(json.map((j, i) => ({ id: i, ...j })))
            })
    }, [])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Components
            </Typography>
            <DataGrid
                label="Components"
                checkboxSelection
                rows={vals}
                columns={columns}
                disableColumnResize
                density="compact"
                slotProps={{
                    loadingOverlay: {
                        variant: 'skeleton',
                        noRowsVariant: 'skeleton'
                    }
                }}
            />
        </Stack>
    )
}

export default ComponentsTable
