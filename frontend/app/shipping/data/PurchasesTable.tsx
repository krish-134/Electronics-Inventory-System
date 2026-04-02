import { Button, IconButton, Card, CardContent, CardActions, Grid, Select, Stack, Typography, TextField, InputAdornment, FormControl, InputLabel, MenuItem } from "@mui/material"
import { useCallback, useState, useEffect, } from "react"
import { type GridColDef } from "@mui/x-data-grid"
import { Link } from "react-router"
import CustomTable, { AddCardProps } from "../CustomTable"
import { ErrorMessage } from "@hookform/error-message"
import { useForm, Controller } from "react-hook-form"
import { ErrorOutline, Store, LocalShipping, Clear } from "@mui/icons-material"
import { Supplier, Courier } from "../../types"

const localHost = `http://localhost:3000`

const columns: GridColDef[] = [
    { field: "order_number",  headerName: "Order #",       editable: true, flex: 0.5 },
    { field: "price",         headerName: "Price",         editable: true, flex: 0.5 },
    { field: "tracking_code", headerName: "Tracking Code", editable: true, flex: 0.6 },
    { field: "date_placed",   headerName: "Date Placed",   editable: true, flex: 1 },
    { field: "delivery_date", headerName: "Delivery Date", editable: true, flex: 1 },   
    {  
        field: "supplier", headerName: "Supplier", editable: true,
        renderCell: (params) => (
            <Link to={`/shipping#supplier-${params.value}`}>{params.formattedValue}</Link>
        )
    },
    {
        field: "courier", headerName: "Courier", editable: true, flex: 1,
        renderCell: (params) => (
            <Link to={`/shipping#courier-${params.value}`}>{params.formattedValue}</Link>
        )
    },
]


const AddCard: React.FC<AddCardProps> = ({ label, setModalOpen, handleAdd }) => {
    const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
    const [courierOptions, setCourierOptions] = useState<Courier[]>([])
    const { handleSubmit, register, control, formState: { errors } } = useForm();

    useEffect(() => {
        fetch(`${localHost}/shipping/supplier`).then(r => r.json()).then(setSupplierOptions)
        fetch(`${localHost}/shipping/courier`).then(r => r.json()).then(setCourierOptions)
    }, [] )

    const generateErrorMessage = (name: string) => (
        <ErrorMessage errors={errors} name={name} render={({ message }) => (
            <Grid size={4}>
                <Stack direction="row" alignItems="center" gap={0.25} sx={{ m: "0.1rem" }}>
                    <ErrorOutline fontSize="small" color="error" />
                    <Typography color="error">{message}</Typography>
                </Stack>
            </Grid>
        )} />
    )

    const onSubmit = (data) => {
        const newRow = {
            ...data,
            supplier: JSON.parse(data.supplier).name,
            courier: data.courier ? JSON.parse(data.courier).name : null,
        }
        fetch(`${localHost}/shipping/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRow)
        }).then(res => {
            if (Math.floor(res.status / 100) === 2) {
                setModalOpen(false)
                handleAdd(newRow)
            }
        })
    }

    return (
        <Card variant="outlined" sx={{ bgcolor: 'background.paper', width: '50%', minWidth: '600px', maxWidth: '1000px' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    <Typography variant="h3">{label}</Typography>
                    <Stack direction="column" gap={2} sx={{ pt: 1 }}>
                        <Stack direction="row" gap={1}>
                            <TextField {...register('order_number', { required: 'Order number is required' })} sx={{ width: '100%' }} label="Order #" variant="outlined" />
                            <TextField {...register('price', { required: 'Price is required' })} sx={{ width: '100%' }} label="Price" variant="outlined" 
                                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
                        </Stack>
                        <Stack direction="row" gap={1}>
                            <TextField 
                                {...register('date_placed', { required: 'Date placed is required' })} 
                                sx={{ width: '100%' }} 
                                label="Date Placed" 
                                type="date"
                                variant="outlined" 
                                slotProps={ { inputLabel: { shrink: true } } }
                            />
                            <TextField 
                                {...register('delivery_date')} 
                                sx={{ width: '100%' }} label="Delivery Date"
                                type="date" 
                                variant="outlined" 
                                slotProps={ { inputLabel: { shrink: true } } } 
                            />                       
                        </Stack>
                        <TextField { ...register('tracking_code')} sx={{ width: '100%' }} label="Tracking Code" variant="outlined" />
                        <Stack direction="row" gap={1}>
                            <FormControl fullWidth>
                                <InputLabel id="supplier-label">Supplier</InputLabel>
                                <Controller name="supplier" control={control} rules={{ required: 'Supplier is required' }} render={({ field }) => (
                                    <Select {...field} label="Supplier" labelId="supplier-label" defaultValue=""
                                        startAdornment={<Store sx={{ color: "divider" }} fontSize="small" />}>
                                        {supplierOptions.map(s => (
                                            <MenuItem key={s.name} value={JSON.stringify(s)}>{s.name}</MenuItem>
                                        ))}
                                    </Select>
                                )} />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="courier-label">Courier</InputLabel>
                                <Controller name="courier" control={control} render={({ field }) => (
                                    <Select {...field} label="Courier" labelId="courier-label" defaultValue=""
                                        startAdornment={<LocalShipping sx={{ color: "divider" }} fontSize="small" />}>
                                        {courierOptions.map(c => (
                                            <MenuItem key={c.name} value={JSON.stringify(c)}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                )} />
                            </FormControl>
                        </Stack>
                    </Stack>
                    <Grid container sx={{ mt: 1 }}>
                        {['order_number', 'price', 'date_placed', 'tracking_code'].map(generateErrorMessage)}
                        {generateErrorMessage('supplier')}
                    </Grid>
                </CardContent>
                <CardActions sx={{ pt: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button size="small" variant="outlined" type="submit">Create</Button>
                </CardActions>
            </form>
        </Card>
    )
}


const PurchasesTable: React.FC = () => {
    const [budget, setBudget] = useState<string>("")
    const [filterBudget, setFilterBudget] = useState<number | null>(null)

    const getData = useCallback(async () => {
        const url = filterBudget !== null
            ? `${localHost}/shipping/purchase?budget=${filterBudget}`
            : `${localHost}/shipping/purchase`
        return await fetch(url)
            .then(res => res.json())
            .then(json => json.map((j, i) => ({ id: j.order_number ?? i, ...j })))
    }, [filterBudget])
    
    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`${localHost}/shipping/purchase/${oldRow.order_num}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
        })
        return row
    }, [])

    const handleDelete = async (ids: string[]) => {
        const results = await Promise.all(
            ids.map((id: any) =>
                fetch(`http://localhost:3000/shipping/purchase/${id}`, { method: "DELETE" })
                .then(async res => ({ id, ok: res.ok, body: await res.json() }))
            )
        )

        const failed = results.filter(r => !r.ok)
        if (failed.length > 0) {
            alert(failed.map(f => f.body.error).join('\n'))
        }
    }

    const handleFilter = (value: string) => {
        const parsed = parseFloat(budget)
        setFilterBudget(isNaN(parsed) || value === "" ? null : parsed)
    }

    const handleClear = () => {
        setBudget("")
        setFilterBudget(null)
    }

    return (
        <Stack direction="column" sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">

                <Typography component="h2" variant="h6">
                    Purchases
                </Typography>

                <Stack direction="row" gap={1}  alignItems="center" sx={{ mb: 1 }}>
                    
                    {filterBudget !== null && (
                        <Typography variant="body2" color="text.secondary">
                            Showing purchases with component cost under ${filterBudget}
                        </Typography>
                    )}
                    {/* {filterBudget !== null && (
                        <Button variant="outlined" size="small" color="warning" onClick={handleClear}>
                            Clear
                        </Button>
                    )}
                    <Button variant="outlined" size="small" onClick={handleFilter}>
                        Filter
                    </Button> */}
                    <TextField
                        // onBlur={}
                        label="Budget (component cost)"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        onBlur={e => handleFilter(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleFilter(budget) }}
                        size="small"
                        type="number"
                        slotProps={{
                            input: { 
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                endAdornment: budget ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleClear} edge="end">
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            } 
                        }}
                    />
                </Stack>
            </Stack>
            
            <CustomTable
                label="Purchases"
                getData={getData}
                columns={columns}
                AddCard={AddCard}
                mutateRow={mutateRow}
                handleDelete={handleDelete}
            />
        </Stack>
    )
}

export default PurchasesTable