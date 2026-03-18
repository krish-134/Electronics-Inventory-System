import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { DataGrid } from '@mui/x-data-grid'
import { Stack, Typography } from "@mui/material"

interface DBTableParams {
    tableName: string
}

const DBTable: React.FC<DBTableParams> = ({ tableName }) => {
    const [vals, setVals] = useState<object[]>([])

    useEffect(() => {
        fetch(`http://localhost:3000/${tableName}/all`)
            .then(res => res.json())
            .then(json => {
                setVals(json.map((j, i) => ({ id: i, ...j })))
            })
    }, [])

    const columns = useMemo(() => {
        if (vals.length == 0) return [];
        return Object.keys(vals[0]).map(k => ({
            field: k,
            headerName: k,
        }))
    }, [vals])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                {tableName}
            </Typography>
            <DataGrid
                label={tableName}
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

export default DBTable
