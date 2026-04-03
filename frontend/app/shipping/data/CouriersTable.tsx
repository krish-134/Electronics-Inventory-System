import React, { useState } from "react";
import { Button, Card, CardContent, CardActions, Grid, Select, Stack, Typography, TextField, InputAdornment, FormControl, InputLabel, MenuItem } from "@mui/material"
import { useCallback } from "react"
import { type GridColDef } from "@mui/x-data-grid"
import CustomTable, { AddCardProps } from "../CustomTable"
import { ErrorMessage } from "@hookform/error-message"
import { useForm, Controller } from "react-hook-form"
import { ErrorOutline } from "@mui/icons-material"
import { rowSelectionStateInitializer } from "@mui/x-data-grid/internals";
import Toast, { ToastInput, ToastStyle } from "../../components/Toast";
import { useToast } from "../../ToastProvider";

const localHost = `http://localhost:3000`

const columns: GridColDef[] = [
    { field: "name",          headerName: "Name",          editable: true,  flex: 1 },
    { field: "code_format",   headerName: "Code Format",   editable: true,  flex: 1 },
    { field: "website",       headerName: "Website",       editable: true,  flex: 2 },
    { field: "contact_email", headerName: "Contact Email", editable: true,  flex: 2 }
]

const AddCard: React.FC<AddCardProps> = ({ label, setModalOpen, handleAdd }) => {
    const { showToast } = useToast();

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
        fetch(`${localHost}/shipping/courier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (Math.floor(res.status / 100) === 2) {
                showToast({display: "Successfully created a new courier!", level: ToastStyle.SUCCESS});
                setModalOpen(false)
                handleAdd(data)
            } else if (res.status == 409) {
                showToast({display: "A courier with this name already exists", level: ToastStyle.ERROR});
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
                            <TextField {...register('code_format')} sx={{ width: '100%' }} label="Code Format" variant="outlined" />
                        </Stack>    
                        <TextField {...register('website', { required: 'Website is required',
                                            validate: (value) => {
                                                try {
                                                    new URL(value)
                                                    return true
                                                } catch {
                                                    return 'Invalid URL'
                                                }
                                            }
                                        })} sx={{ width: '100%' }} label="Website" variant="outlined" />
                        <TextField {...register('contact_email', { 
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                            })} sx={{ width: '100%' }} label="Contact Email" variant="outlined" />
                    </Stack>
                    <Grid container sx={{ mt: 1 }}>
                        {['name', 'code_format', 'website', 'contact_email'].map(generateErrorMessage)}
                        {generateErrorMessage('courier')}
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

const CouriersTable: React.FC = () => {
    const { showToast } = useToast();

    const getData = useCallback(async () => {
        return await fetch(`${localHost}/shipping/courier`)
            .then(res => res.json())
            .then(json => json.map((j, i) => ({ id: j.name ?? i, ...j })))
    }, [])


    const mutateRow = useCallback(async (row, oldRow) => {
        const res = await fetch(`${localHost}/shipping/courier/${oldRow.name}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
        })

        if (JSON.stringify(row) !== JSON.stringify(oldRow)) {
            if (!res.ok) {
                showToast({display: "Input is invalid!", level: ToastStyle.ERROR});
                return oldRow;
            } else {
                showToast({display: "Successfully edited item!", level: ToastStyle.SUCCESS});
            }
        }

        return row
    }, [])          

    
    const handleDelete = async (ids: string[]) => {
        const results = await Promise.all(
            ids.map((id: any) =>
                fetch(`http://localhost:3000/shipping/courier/${id}`, { method: "DELETE" })
                .then(async res => ({ id, ok: res.ok, body: await res.json() }))
            )
        )

        const failed = results.filter(r => !r.ok)
        if (failed.length > 0) {
            showToast({display:failed.map(f => f.body.error).join('\n'), level: ToastStyle.ERROR});
        } else {
            showToast({display:"Successfully deleted item(s)!", level: ToastStyle.SUCCESS});
        }
    }


    return (
        <Stack direction="column" sx={{ width: '100%' }}>
             
            <Typography component="h2" variant="h6">
                Couriers
            </Typography>
            <CustomTable
                label="Courier"
                getData={getData}
                columns={columns}
                AddCard={AddCard}
                mutateRow={mutateRow}
                handleDelete={handleDelete}
            />
        </Stack>
    )
}

export default CouriersTable