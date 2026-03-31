import { Avatar, Button, Card, CardActions, CardContent, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { GridRenderEditCellParams, type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitCapacitor, IconCircuitDiode, IconCircuitResistor } from '@tabler/icons-react'
import CustomTable, { AddCardProps, CustomTableProps } from "../../shared/CustomTable"
import { Link } from "react-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Location, Supplier } from "../../types"
import JsonEditComponent from "../JsonEditComponent"
import JsonViewComponent from "../JsonViewComponent"
import { ErrorOutline, Inventory, Store } from "@mui/icons-material"
import { useForm, Controller } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", editable: true, renderCell: (params) => {
            let icon: React.ReactNode = null;

            switch (params.row.component_type?.toLowerCase()) {
                case "diode":
                    icon = (<IconCircuitDiode size="18" color="white" />)
                    break;
                case "resistor":
                    icon = (<IconCircuitResistor size="18" color="white" />)
                    break;
                case "capacitor":
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
    { "field": "price", headerName: "Price", editable: true, type: "number" },
    { "field": "name", headerName: "Name", editable: true },
    { "field": "package", headerName: "Package", editable: true },
    { "field": "tolerance", headerName: "Tolerance", editable: true, type: "number", valueFormatter: (v) => parseFloat(v).toFixed(3) },
    { "field": "quantity", headerName: "Quantity", editable: true, type: "number" },
    { "field": "voltage_rating", headerName: "Voltage Rating", editable: true, type: "number", valueFormatter: (v) => parseFloat(v).toFixed(2) },
    {
        "field": "additional", headerName: "Additional Data", type: "longText", editable: true, width: 150, sortable: false, filterable: false, renderCell: (params) => (
            <JsonViewComponent {...params} />
        ),
        renderEditCell: (params: GridRenderEditCellParams) => (
            <JsonEditComponent {...params} />
        )
    },
    {
        "field": "position", headerName: "Location", editable: false, width: 200,
        valueGetter: (_value, row) => {
            if (!row.facility) return 'Unplaced';
            return `${row.facility} > ${row.storage_name} > ${row.position_name}`;
        },
        renderCell: (params) => (
            <Link to={`/locations`}>
                {params.formattedValue}
            </Link>
        )
    },
    {
        "field": "supplier_name", headerName: "Supplier", editable: true, renderCell: (params) => (
            <Link to={`/shipping#supplier-${params.value}`}>
                {params.formattedValue}
            </Link>
        )
    },
]

const AddCard: React.FC<AddCardProps> = ({ label, setModalOpen, handleAdd }) => {
    const [storageOptions, setStorageOptions] = useState<Location[]>([])
    const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
    const [componentType, setComponentType] = useState<string>("");

    // TODO: error handling
    const { handleSubmit, control, register, formState: { errors } } = useForm()

    useEffect(() => {
        fetch('http://localhost:3000/location')
            .then(res => res.json())
            .then(json => {
                setStorageOptions(json)
            })
    }, [])

    useEffect(() => {
        fetch('http://localhost:3000/shipping/supplier')
            .then(res => res.json())
            .then(json => {
                setSupplierOptions(json)
            })
    }, [storageOptions])

    const onSubmit = (data) => {
        console.log('submitting', data)

        const {
            part_num: partNum,
            price,
            name,
            package: pkg,
            tolerance,
            quantity,
            voltage_rating: voltageRating,
            additional,
            storage,
            supplier,
            resistance, power, composition,
            capacitance, type: capType, temp_coeff,
            vforward, vreverse, dcapacitance
        } = data;

        let position = storage ? JSON.parse(storage).position_id : null;
        let supplier_name = JSON.parse(supplier).name
        let additional_json = null;
        
        const newRow = {
            part_num: partNum,
            price,
            name,
            package: pkg,
            tolerance,
            quantity,
            voltage_rating: voltageRating,
            additional: additional_json,
            position,
            supplier_name,
            componentType,
            resistance, power, composition,
            capacitance, type: capType, temp_coeff,
            vforward, vreverse, dcapacitance
        }
        fetch(`http://localhost:3000/component/${componentType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify(newRow)
        }).then(res => {
            if (Math.floor(res.status / 100) == 2) {
                setModalOpen(false)
                handleAdd(newRow)
            }
        })
    }

    const generateErrorMessage = (name: string) => {
        return (
            <ErrorMessage
                errors={errors}
                name={name}
                render={(err) => {
                    return (
                        <Grid size={4}>
                            <Stack direction="row" alignItems="center" gap={0.25} sx={{ m: "0.125rem" }}>
                                <ErrorOutline fontSize="small" color="error" />
                                <Typography color="error">
                                    {err.message}
                                </Typography>
                            </Stack>
                        </Grid>
                    )
                }}
            />
        )
    }

    return (
        <Card variant="outlined" sx={{ bgcolor: 'background.paper', width: '50%', minWidth: '600px', maxWidth: '1000px' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    <Typography variant="h3">{label}</Typography>
                    <Stack direction="column" gap={2} sx={{ pt: 1 }}>
                        <Stack direction="row" gap={1}>
                            <TextField {...register('part_num', { required: 'Part Number is required' })} sx={{ width: '100%' }} label="Part #" variant="outlined" />
                            <TextField {...register('name', { required: 'Name is required' })} sx={{ width: '100%' }} label="Name" variant="outlined" />
                        </Stack>
                        <FormControl fullWidth>
                            <InputLabel id="component-type-label">Component Type</InputLabel>
                            <Controller name="component_type" control={control} rules={{ required: 'Component Type is required' }} render={(props) => (
                                <Select {...props.field} label="Component Type" labelId="component-type-label" defaultValue="" onChange={(event) => {
                                    props.field.onChange(event.target.value);
                                    setComponentType(event.target.value);
                                }}>
                                    <MenuItem value="resistor">Resistor</MenuItem>
                                    <MenuItem value="capacitor">Capacitor</MenuItem>
                                    <MenuItem value="diode">Diode</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            )} />
                        </FormControl>
                        <Stack direction="row" gap={1}>
                            <TextField {...register('price', { required: 'Price is required' })} sx={{ width: '100%' }} type="number" label="Price" variant="outlined" slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }
                            }} />
                            <TextField {...register('quantity', { required: 'Quantity is required' })} sx={{ width: '100%' }} type="number" label="Quantity" variant="outlined" />
                        </Stack>
                        <Stack direction="row" gap={1} sx={{ width: '100%' }}>
                            <TextField {...register('package', { required: 'Package is required' })} sx={{ width: '100%' }} label="Package" variant="outlined" />
                            <TextField {...register('tolerance', { required: 'Tolerance is required', pattern: { value: /^0(\.[0-9]*)?$/, message: "Tolerance must be between 0 and 1" } })} sx={{ width: '100%' }} label="Tolerance" variant="outlined" type="number" />
                            <TextField {...register('voltage_rating', { required: 'Voltage Rating is required' })} sx={{ width: '100%' }} label="Voltage Rating" variant="outlined" slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">V</InputAdornment>
                                }
                            }} />
                        </Stack>
                        <Stack direction="row" gap={1}>
                            <FormControl fullWidth>
                                <InputLabel id="storage-select-label">Storage</InputLabel>
                                <Controller name="storage" control={control} rules={{ required: false }} render={({ field }) => (
                                    <Select {...field} label="Storage" labelId="storage-select-label" defaultValue="" startAdornment={<Inventory sx={{ color: "divider" }} fontSize="small" />}>
                                        {storageOptions.filter(opt => opt.position).map(opt => (
                                            <MenuItem key={opt.position_id} value={JSON.stringify(opt)}>
                                                {opt.facility} &gt; {opt.storage_name} &gt; {opt.position}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )} />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="supplier-select-label">Supplier</InputLabel>
                                <Controller name="supplier" control={control} rules={{ required: 'Supplier is required' }} render={({ field }) => (
                                    <Select {...field} label="Supplier" labelId="supplier-select-label" startAdornment={<Store sx={{ color: "divider" }} fontSize="small" />}>
                                        {supplierOptions.map(opt => {
                                            return (
                                                <MenuItem key={opt.name} value={JSON.stringify(opt)}>{opt.name}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                )} />
                            </FormControl>
                        </Stack>
                        <TextField {...register('additional', { required: 'Additional Data is required' })} label="Additional Data" variant="outlined" multiline rows={4} />
                        {(componentType === "resistor" || componentType === "capacitor" || componentType === "diode") && (
                            <>
                                <Divider />
                                <Typography variant="h5">{componentType[0].toUpperCase()}{componentType.substring(1).toLowerCase()} Properties</Typography>
                            </>
                        )}
                        {componentType === "resistor" && (
                            <Stack direction="row" gap={1}>
                                <TextField {...register('resistance', { required: 'Resistance is required' })} type="number" sx={{ width: '100%' }} label="Resistance" />
                                <TextField {...register('power', { required: 'Power is required' })} sx={{ width: '100%' }} label="Power" />
                                <TextField {...register('composition', { required: 'Composition is required' })} sx={{ width: '100%' }} label="Composition" />
                            </Stack>
                        )}
                        {componentType === "capacitor" && (
                            <Stack direction="row" gap={1}>
                                <TextField {...register('capacitance', { required: 'Capacitance is required' })} type="number" sx={{ width: '100%' }} label="Capacitance" />
                                <TextField {...register('capacitor_type', { required: 'Capacitor Type is required' })} sx={{ width: '100%' }} label="Capacitor Type" />
                                <TextField {...register('temp_coeff', { required: 'Temperature Coefficient is required' })} sx={{ width: '100%' }} label="Temperature Coefficient" />
                            </Stack>
                        )}
                        {componentType === "diode" && (
                            <Stack direction="row" gap={1}>
                                <TextField {...register('vforward', { required: 'Forward Voltage is required' })} type="number" sx={{ width: '100%' }} label="Forward Voltage" />
                                <TextField {...register('vreverse', { required: 'Reverse Voltage is required' })} type="number" sx={{ width: '100%' }} label="Reverse Voltage" />
                                <TextField {...register('dcapacitance', { required: 'Diode Capacitance is required' })} sx={{ width: '100%' }} label="Diode Capacitance" />
                            </Stack>
                        )}
                    </Stack>
                    <Grid container sx={{ mt: 1 }}>
                        {columns.map(c => generateErrorMessage(c.field))}
                        {generateErrorMessage("component_type")}
                        {generateErrorMessage("storage")}
                        {generateErrorMessage("supplier")}
                        {componentType === "resistor" && ['resistance', 'power', 'composition'].map(generateErrorMessage)}
                        {componentType === "capacitor" && ['capacitance', 'capacitor_type', 'temp_coeff'].map(generateErrorMessage)}
                        {componentType === "diode" && ['vforward', 'vreverse', 'dcapacitance'].map(generateErrorMessage)}
                    </Grid>
                </CardContent>
                <CardActions sx={{ pt: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button size="small" variant="outlined" type="submit">Create</Button>
                </CardActions>
            </form>
        </Card >
    )
}

const ComponentsTable: React.FC<Pick<CustomTableProps, "getData">> = ({ getData }) => {
    const mutateRow = useCallback(async (row, oldRow) => {
        await fetch(`http://localhost:3000/component/${oldRow.part_num}`, { method: "PUT", body: JSON.stringify(row) });
        return row
    }, [])

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                Components
            </Typography>
            <CustomTable
                label="Components"
                getData={getData}
                columns={columns}
                AddCard={AddCard}
                mutateRow={mutateRow}
                tableName="component"
            />
        </Stack>
    )
}

export default ComponentsTable
