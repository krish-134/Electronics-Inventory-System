import { Avatar, Button, Popover, Stack, Typography } from "@mui/material"
import { type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitCapacitor, IconCircuitDiode, IconCircuitResistor } from '@tabler/icons-react'
import CustomTable from "../CustomTable"
import { Link } from "react-router"
import { RichTreeView, TreeViewBaseItem } from '@mui/x-tree-view'
import { useState } from "react"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", renderCell: (params) => {
            let icon: React.ReactNode = null;

            switch (params.row.component_type) {
                case "Diode":
                    icon = (<IconCircuitDiode size="18" color="white" />)
                    break;
                case "Resistor":
                    icon = (<IconCircuitResistor size="18" color="white" />)
                    break;
                case "Capacitor":
                    icon = (<IconCircuitCapacitor size="18" color="white" />);
                    break;
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
        "field": "additional", headerName: "Additional Data", width: 150, renderCell: (params) => {
            type Entry = {
                id: string
                label: string
                value: any
            }
            const intoTreeEntry = (entry: Entry) => {
                const { id, label, value } = entry;
                if (Array.isArray(value)) {
                    return { id, label, children: value.map((v, i) => intoTreeEntry({
                        id: `${id}-${i}`,
                        label: `${i}`,
                        value: v
                    })) }
                } else if (typeof value === "object") {
                    return { id, label, children: Object.entries(value).map(([k, v], _) => intoTreeEntry({
                        id: `${id}-${k}`,
                        label: `${k}`,
                        value: v
                    })) }
                } else {
                    return { id, label: `${label}: ${value}` }
                }
            }

            const items = Object.entries(params.formattedValue).map(([k, v], _) => intoTreeEntry({
                id: `${k}`,
                label: `${k}`,
                value: v
            }))

            const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

            const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                setAnchorEl(event.currentTarget)
            }

            const handleClose = () => {
                setAnchorEl(null)
            }

            const open = !!anchorEl
            const id = open ? 'delete-popover' : undefined
            return Object.entries(params.formattedValue).length ? (
                <>
                    <Button onClick={handleClick} sx={{ height: '1.75rem' }} variant="outlined">
                        Show
                    </Button>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <RichTreeView items={items} />
                    </Popover>
                </>
            ) : (
                <></>
            )
        }
    },
    {
        "field": "storage_name", headerName: "Storage", renderCell: (params) => (
            <Link to={`/locations#${params.value}`}>
                {params.formattedValue}
            </Link>
        )
    },
    {
        "field": "supplier_name", headerName: "Supplier", renderCell: (params) => (
            <Link to={`/shipping#supplier-${params.value}`}>
                {params.formattedValue}
            </Link>
        )
    },
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
