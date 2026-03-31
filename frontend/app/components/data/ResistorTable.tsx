import { Avatar, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitResistor } from '@tabler/icons-react'
import CustomTable, { CustomTableProps } from "../../shared/CustomTable"
import { useCallback } from "react"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", editable: true, renderCell: (params) => (
            <Stack direction="row" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: "background.paper", border: "2px dashed", borderColor: "divider", height: "1.5rem", width: "1.5rem" }}><IconCircuitResistor size="18" color="white" /></Avatar>
                {params.formattedValue}
            </Stack>
        )
    },
    { "field": "resistance", headerName: "Resistance", editable: true, type: "number" },
    { "field": "power", headerName: "Power", editable: true, type: "number" },
    { "field": "composition", headerName: "Composition", editable: true },
]

const ResistorTable: React.FC<Pick<CustomTableProps, "getData">> = ({ getData }) => {
    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`http://localhost:3000/component/${oldRow.part_num}`, { method: "PUT", body: JSON.stringify(row) });
        return row
    }, [])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Resistors
            </Typography>
            <CustomTable
                label="Resistors"
                getData={getData}
                columns={columns}
                mutateRow={mutateRow}
                tableName="component"
            />
        </Stack>
    )
}

export default ResistorTable
