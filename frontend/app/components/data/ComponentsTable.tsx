import { Avatar, Badge, Box, Chip, Stack, Typography } from "@mui/material"
import { DataGrid, GridRowSelectionModel, type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { useState, useEffect } from "react"
import { IconCircuitCapacitor, IconCircuitDiode, IconCircuitResistor } from '@tabler/icons-react'
import CustomToolbar from "./CustomToolbar"
import CustomTable from "../CustomTable"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", renderCell: (params) => {
            console.log(params.row)
            // TODO: change this to be table-based
            let icon = null;

            const name = (params.value ?? "").toUpperCase();

            if (name.startsWith("DIO")) {
                icon = (<IconCircuitDiode size="18" color="white" />)
            } else if (name.startsWith("RES")) {
                icon = (<IconCircuitResistor size="18" color="white" />)
            } else if (name.startsWith("CAP")) {
                icon = (<IconCircuitCapacitor size="18" color="white" />);
            }

            return (
                <Stack direction="row" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: "background.paper", border: "2px dashed", borderColor: "divider", height: "1.5rem", width: "1.5rem" }}>{icon}</Avatar>
                    {params.formattedValue}
                </Stack>
            )
        }
    },
    { "field": "price", headerName: "Price" },
    { "field": "name", headerName: "Name" },
    { "field": "package", headerName: "Package" },
    { "field": "tolerance", headerName: "Tolerance" },
    { "field": "quantity", headerName: "Quantity" },
    { "field": "voltage_rating", headerName: "Voltage Rating" },
    {
        "field": "additional", headerName: "Additional Data", renderCell: (params) => {
            return JSON.stringify(params.field)
        }
    },
    { "field": "storage_name", headerName: "Storage" },
    { "field": "supplier_name", headerName: "Supplier" },
]

const ComponentsTable: React.FC = () => {
    const getData = async () => {
        return await fetch(`http://localhost:3000/components`)
            .then(res => res.json())
            .then(json => {
                return json.map((j, i) => ({ id: i, ...j }))
            })
    }

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Components
            </Typography>
            <CustomTable label="Components" getData={getData} columns={columns} />
        </Stack>
    )
}

export default ComponentsTable
