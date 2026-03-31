import { Avatar, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitDiode } from '@tabler/icons-react'
import CustomTable, { CustomTableProps } from "../CustomTable"
import { useCallback } from "react"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", editable: true, renderCell: (params) => (
            <Stack direction="row" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: "background.paper", border: "2px dashed", borderColor: "divider", height: "1.5rem", width: "1.5rem" }}><IconCircuitDiode size="18" color="white" /></Avatar>
                {params.formattedValue}
            </Stack>
        )
    },
    { "field": "vforward", headerName: "Forward Voltage", editable: true, type: "number" },
    { "field": "vreverse", headerName: "Reverse Voltage", editable: true, type: "number" },
    { "field": "dcapacitance", headerName: "Capacitance", editable: true },
]

const DiodeTable: React.FC<Pick<CustomTableProps, "getData">> = ({ getData }) => {
    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`http://localhost:3000/component/${oldRow.part_num}`, { method: "PUT", body: JSON.stringify(row) });
        return row
    }, [])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Diodes
            </Typography>
            <CustomTable
                label="Diodes"
                getData={getData}
                columns={columns}
                mutateRow={mutateRow}
                tableName="component"
            />
        </Stack>
    )
}

export default DiodeTable
