import { Avatar, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitDiode } from '@tabler/icons-react'
import CustomTable, { CustomTableProps } from "../CustomTable"
import { useCallback, useState } from "react"
import Toast, { ToastInput, ToastStyle } from "../Toast"
import { useToast } from "../../ToastProvider"

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
    const { showToast } = useToast();

    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`http://localhost:3000/component/${oldRow.part_num}`, { method: "PUT", body: JSON.stringify(row) });
        return row
    }, [])

    
    const handleDelete = async (ids: string[]) => {
        const results = await Promise.all(
            ids.map((id: any) =>
                fetch(`http://localhost:3000/component/${id}`, { method: "DELETE" })
                .then(async res => ({ id, ok: res.ok, body: await res.json() }))
            )
        )

        const failed = results.filter(r => !r.ok)
        if (failed.length > 0) {
            showToast({display:failed.map(f => f.body.error).join('\n'), level: ToastStyle.ERROR});
        }
    }

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
                handleDelete={handleDelete}
            />
        </Stack>
    )
}

export default DiodeTable
