import type React from "react"
import { Grid, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { BarChart } from "@mui/x-charts/BarChart"
import { PropsWithChildren, useEffect, useState } from "react"

interface StorageValue {
    fname: string
    price: number
}

interface SupplierValue {
    supplier: string
    price: number
}

interface ExpensiveProject {
    name: string
    total_cost: number
}

const ChartCell: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <Grid sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={4}>
            {children}
        </Grid>
    )
}

const Home: React.FC = () => {
    const [storageValue, setStorageValue] = useState<StorageValue[]>([])
    const [supplierValue, setSupplierValue] = useState<SupplierValue[]>([])
    const [totalCost, setTotalCost] = useState<number | undefined>()
    const [expensiveProjects, setExpensiveProjects] = useState<ExpensiveProject[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const [storageValueJson, supplierValueJson] = await Promise.all([
                fetch('http://localhost:3000/insights/storage-value').then(res => res.json()),
                fetch('http://localhost:3000/insights/supplier-value').then(res => res.json()),
            ])
            setStorageValue(storageValueJson)
            setSupplierValue(supplierValueJson)
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (totalCost === undefined) {
            setExpensiveProjects([])
            return
        }
        fetch(`http://localhost:3000/insights/expensive-projects?cost=${totalCost}`)
            .then(res => res.json())
            .then(setExpensiveProjects)
    }, [totalCost])

    return (
        <>
            <Stack direction="column" gap={1} sx={{width:'100%'}}>
                <Typography component="h2" variant="h6">Insights</Typography>
                <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                    <ChartCell>
                        <BarChart
                            series={[
                                { data: storageValue.map(v => v.price), label: 'Price ($)', id: 'priceId' }
                            ]}
                            xAxis={[{ data: storageValue.map(v => v.fname), label: 'Facility', id: 'facilityId', height: 28 }]}
                            yAxis={[{ width: 30 }]}
                        />
                    </ChartCell>
                    <ChartCell>
                        <BarChart
                            series={[
                                { data: supplierValue.map(v => v.price), label: 'Price ($)', id: 'priceId' }
                            ]}
                            xAxis={[{ data: supplierValue.map(v => v.supplier), label: 'Supplier', id: 'supplierId', height: 28 }]}
                            yAxis={[{ width: 30 }]}
                        />
                    </ChartCell>
                    <Grid sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={8}>
                        <Stack direction="column" gap={1}>
                            <Stack direction="row" gap={1} sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography>Expensive Projects</Typography>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    label="Minimum Cost"
                                    placeholder="e.g. 1000"
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        },
                                    }}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value)
                                        setTotalCost(isNaN(val) ? undefined : val)
                                    }}
                                />
                            </Stack>
                            {totalCost === undefined ? (
                                <Typography color="text.secondary" variant="body2">Enter a minimum cost to find projects above that budget.</Typography>
                            ) : expensiveProjects.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Project</TableCell>
                                                <TableCell align="right">Total Cost</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expensiveProjects.map(p => (
                                                <TableRow key={p.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell align="right">${p.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="text.secondary" variant="body2">No projects found above ${totalCost.toLocaleString()}.</Typography>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </>
    )
}

export default Home
