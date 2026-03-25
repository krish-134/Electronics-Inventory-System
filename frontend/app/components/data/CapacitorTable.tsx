import { Avatar, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitCapacitor } from '@tabler/icons-react'
import CustomTable from "../CustomTable"
import { useCallback } from "react"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", editable: true, renderCell: (params) => (
            <Stack direction="row" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: "background.paper", border: "2px dashed", borderColor: "divider", height: "1.5rem", width: "1.5rem" }}><IconCircuitCapacitor size="18" color="white" /></Avatar>
                {params.formattedValue}
            </Stack>
        )
    },
    { "field": "capacitance", headerName: "Capacitance", editable: true, type: "number" },
    { "field": "type", headerName: "Type", editable: true },
    { "field": "temp_coeff", headerName: "Temperature Coefficient", editable: true, type: "number" },
]

const CapacitorTable: React.FC = () => {
    const getData = useCallback(async () => {
        return await fetch(`http://localhost:3000/component?type=capacitor`)
            .then(res => res.json())
            .then(json => {
                return json.map((j, i) => ({ id: i, ...j }))
            })
    }, [])

    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`http://localhost:3000/component/${oldRow.part_num}`, { method: "PUT", body: JSON.stringify(row) });
        return row
    }, [])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Capacitors
            </Typography>
            <CustomTable
                label="Capacitors"
                getData={getData}
                columns={columns}
                mutateRow={mutateRow}
            />
        </Stack>
    )
}

export default CapacitorTable
