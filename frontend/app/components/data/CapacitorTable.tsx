import { Avatar, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitCapacitor } from '@tabler/icons-react'
import CustomTable, { CustomTableProps } from "../CustomTable"
import { useCallback, useState } from "react"
import Toast, { ToastInput, ToastStyle } from "../Toast"

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

const CapacitorTable: React.FC<Pick<CustomTableProps, "getData">> = ({ getData }) => {
    const [toastContent, setToastContent] = useState<ToastInput>();
    const [toastOpen, setToastOpen] = useState<boolean>(false);

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
            setToastContent({display:failed.map(f => f.body.error).join('\n'), level: ToastStyle.ERROR});
            setToastOpen(true);
        }
    }

    return (
        <Stack direction="column">
            <Toast open={toastOpen} setOpen={setToastOpen} content={toastContent} />
            <Typography component="h2" variant="h6">
                Capacitors
            </Typography>
            <CustomTable
                label="Capacitors"
                getData={getData}
                columns={columns}
                mutateRow={mutateRow}
                handleDelete={handleDelete}
            />
        </Stack>
    )
}

export default CapacitorTable
