import type React from "react"
import { useEffect, useState } from "react"
import { TableContainer, Paper, Table, TableCell, TableHead, TableBody, TableRow, Typography } from "@mui/material"

interface DBTableParams {
    tableName: string
    keyColumn?: string
    onDelete?: (keyValue: string) => void
}

const DBTable: React.FC<DBTableParams> = ({ tableName, keyColumn, onDelete}) => {
    const [vals, setVals] = useState<Record<string, unknown>[]>([])


    useEffect(() => {
        fetch(`http://localhost:3000/${tableName}/all`)
            .then(res => res.json())
            .then(json => {
                setVals(json)
            })
    }, [])

    const keys = Object.keys(vals[0] || {})

    return (
        <>
            <Typography variant="h4">{tableName}</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label={`${tableName} table`}>
                    <TableHead>
                        <TableRow>
                            {keys.map(k => (
                                <TableCell>{k}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vals && vals.map(
                            v => (
                                <TableRow>
                                    {Object.values(v).map(c => (<TableCell>{JSON.stringify(c)}</TableCell>))}
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default DBTable
