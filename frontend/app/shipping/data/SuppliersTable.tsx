import React from "react";
import { Button, Card, CardContent, CardActions, Grid, Stack, Typography, TextField } from "@mui/material"
import { useCallback } from "react"
import { type GridColDef } from "@mui/x-data-grid"
import CustomTable, { AddCardProps } from "../CustomTable"
import { ErrorMessage } from "@hookform/error-message"
import { useForm, Controller } from "react-hook-form"
import { ErrorOutline } from "@mui/icons-material"

const localHost = `http://localhost:3000`

const columns: GridColDef[] = [
    { field: "name",          headerName: "Name",          editable: true, flex: 1 },
    { field: "url",           headerName: "URL",           editable: true, flex: 2 },
    { field: "country",       headerName: "Country",       editable: true, flex: 1 },
    { field: "contact_email", headerName: "Contact Email", editable: true, flex: 2 },
]

const AddCard: React.FC<AddCardProps> = ({ label, setModalOpen, handleAdd }) => {
    const { handleSubmit, register, control, formState: { errors } } = useForm();

    
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
        fetch(`${localHost}/shipping/supplier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (Math.floor(res.status / 100) === 2) {
                setModalOpen(false)
                handleAdd(data)
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
                            <TextField {...register('name', { required: 'Name is required' })} sx={{ width: '100%' }} label="Name" variant="outlined" />
                            <TextField {...register('url', { required: 'URL is required' })} sx={{ width: '100%' }} label="URL" variant="outlined" />
                        </Stack>    
                        <TextField {...register('country', { required: 'Country is required' })} sx={{ width: '100%' }} label="Country" variant="outlined" />
                        <TextField {...register('contact_email')} sx={{ width: '100%' }} label="Country" variant="outlined" />
                    </Stack>
                    <Grid container sx={{ mt: 1 }}>
                        {['name', 'url', 'country', 'contact_email'].map(generateErrorMessage)}
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

const SuppliersTable: React.FC = () => {
    const getData = useCallback(async () => {
        return await fetch(`${localHost}/shipping/supplier`)
            .then(res => res.json())
            .then(json => json.map((j, i) => ({ id: i, ...j })))
    }, [])

    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`${localHost}/shipping/supplier/${oldRow.name}`)
        return row
    }, [])

    return (
        <Stack direction="column" sx={{ width: '100%' }}>
            <Typography component="h2" variant="h6">
                Suppliers
            </Typography>
            <CustomTable
                label="Suppliers"
                getData={getData}
                columns={columns}
                AddCard={AddCard}
                mutateRow={mutateRow}
            />
        </Stack>
    )
}

export default SuppliersTable
