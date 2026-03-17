import type React from "react"
import { useEffect, useState } from "react"
import { TableContainer, Paper, Table, TableCell, TableHead, TableBody, TableRow, Typography, Button } from "@mui/material"
// import { DeleteIcon } from "@mui/icons-material"

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
                            {onDelete && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vals.map((row, i) => {
                            const keyValue = keyColumn ?  String(row[keyColumn]) : undefined
                            return (
                                <TableRow key = {keyValue ?? i}>
                                    {Object.values(row).map((col, cell) => (
                                        <TableCell key={cell}>{JSON.stringify(col)}</TableCell>
                                    ))}
                                    {onDelete && keyValue && (
                                        <TableCell>
                                        <Button
                                            variant="contained"
                                            // startIcon={<DeleteIcon />}
                                            color="error"
                                            size="medium"
                                            onClick={() => onDelete(keyValue)}
                                            >
                                                Delete
                                            </Button>
                                    </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default DBTable
