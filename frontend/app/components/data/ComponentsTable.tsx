import { Avatar, Button, Card, CardActions, CardContent, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Stack, TextField, Typography } from "@mui/material"
import { GridEditLongTextCell, GridRenderEditCellParams, type GridColDef } from "@mui/x-data-grid"
import type React from "react"
import { IconCircuitCapacitor, IconCircuitDiode, IconCircuitResistor } from '@tabler/icons-react'
import CustomTable, { AddCardProps } from "../CustomTable"
import { Link } from "react-router"
import { RichTreeView } from '@mui/x-tree-view'
import { useCallback, useEffect, useMemo, useState } from "react"
import { Location, Supplier } from "../../types"
import JsonEditComponent from "../JsonEditComponent"
import JsonViewComponent from "../JsonViewComponent"

const columns: GridColDef[] = [
    {
        "field": "part_num", headerName: "Part #", editable: true, renderCell: (params) => {
            let icon: React.ReactNode = null;

            switch (params.row.component_type.toLowerCase()) {
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
        "field": "storage_name", headerName: "Storage", editable: true, renderCell: (params) => (
            <Link to={`/locations#${params.value}`}>
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

    const [componentType, setComponentType] = useState<string>("")
    const [partNum, setPartNum] = useState<string>("")
    const [price, setPrice] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [pkg, setPkg] = useState<string>("")
    const [tolerance, setTolerance] = useState<string>("")
    const [quantity, setQuantity] = useState<string>("")
    const [voltageRating, setVoltageRating] = useState<string>("")
    const [additional, setAdditional] = useState<string>("{}")
    const [storage, setStorage] = useState<Location>()
    const [supplier, setSupplier] = useState<Supplier>()

    // resistor
    const [resistance, setResistance] = useState<number>()
    const [power, setPower] = useState<string>()
    const [composition, setComposition] = useState<string>()

    // capacitor
    const [capacitance, setCapacitance] = useState<number>()
    const [capType, setCapType] = useState<string>()
    const [tempCoeff, setTempCoeff] = useState<string>()

    // diode
    const [vforward, setVForward] = useState<number>()
    const [vreverse, setVReverse] = useState<number>()
    const [dCapacitance, setDCapacitance] = useState<number>()

    useEffect(() => {
        fetch('http://localhost:3000/location/all')
            .then(res => res.json())
            .then(json => {
                setStorageOptions(json)
            })
    }, [])

    useEffect(() => {
        fetch('http://localhost:3000/supplier/all')
            .then(res => res.json())
            .then(json => {
                setSupplierOptions(json)
            })
    }, [storageOptions])

    let additionalOpts

    switch (componentType) {
        case "resistor":
            additionalOpts = { resistance, power, composition }
            break
        case "capacitor":
            additionalOpts = { capacitance, type: capType, temp_coeff: tempCoeff }
            break
        case "diode":
            additionalOpts = { vforward, vreverse, capacitance: dCapacitance }
            break
    }

    const newRow = useMemo(() => ({
        part_num: partNum,
        price,
        name,
        package: pkg,
        tolerance,
        quantity,
        voltage_rating: voltageRating,
        additional: JSON.parse(additional), // TODO: error checking
        storage_name: storage?.storage_name,
        facility: storage?.facility,
        position: storage?.position,
        supplier_name: supplier?.name,
        component_type: componentType,
        ...additionalOpts
    }), [partNum, price, name, pkg, tolerance, quantity, voltageRating, additional, storage, supplier, additionalOpts])

    const handleCreate = () => {
        fetch(`http://localhost:3000/component/${componentType}`, {
            method: 'POST',
            body: JSON.stringify(newRow)
        }).then(res => {
            if (Math.floor(res.status / 100) == 2) {
                setModalOpen(false)
                handleAdd(newRow)
            }
        })
    }

    return (
        <Card variant="outlined" sx={{ bgcolor: 'background.paper', width: '50%', minWidth: '600px', maxWidth: '1000px' }}>
            <CardContent>
                <Typography variant="h3">{label}</Typography>
                <Stack direction="column" gap={2} sx={{ pt: 1 }}>
                    <Stack direction="row" gap={1}>
                        <TextField required sx={{ width: '100%' }} label="Part #" key="part_num" variant="outlined" value={partNum} onChange={(event) => setPartNum(event.target.value)} />
                        <TextField required sx={{ width: '100%' }} label="Name" key="name" variant="outlined" value={name} onChange={(event) => setName(event.target.value)} />
                    </Stack>
                    <FormControl fullWidth>
                        <InputLabel id="component-type-label">Component Type</InputLabel>
                        <Select label="Component Type" labelId="component-type-label" value={componentType} onChange={(event) => setComponentType(event.target.value)}>
                            <MenuItem value="resistor">Resistor</MenuItem>
                            <MenuItem value="capacitor">Capacitor</MenuItem>
                            <MenuItem value="diode">Diode</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <Stack direction="row" gap={1}>
                        <TextField required sx={{ width: '100%' }} type="number" label="Price" key="price" variant="outlined" value={price} onChange={(event) => setPrice(event.target.value)} />
                        <TextField required sx={{ width: '100%' }} type="number" label="Quantity" key="quantity" variant="outlined" value={quantity} onChange={event => setQuantity(event.target.value)} />
                    </Stack>
                    <Stack direction="row" gap={1} sx={{ width: '100%' }}>
                        <TextField required sx={{ width: '100%' }} label="Package" key="package" variant="outlined" value={pkg} onChange={(event) => setPkg(event.target.value)} />
                        <TextField required sx={{ width: '100%' }} label="Tolerance" key="tolerance" variant="outlined" value={tolerance} onChange={event => setTolerance(event.target.value)} />
                        <TextField required sx={{ width: '100%' }} label="Voltage Rating" key="voltage_rating" variant="outlined" value={voltageRating} onChange={event => setVoltageRating(event.target.value)} />
                    </Stack>
                    <Stack direction="row" gap={1}>
                        <FormControl fullWidth>
                            <InputLabel id="storage-select-label">Storage</InputLabel>
                            <Select label="Storage" labelId="storage-select-label" value={storage} onChange={event => setStorage(event.target.value as Location)}>
                                {storageOptions.map(opt => {
                                    const id = `${opt.facility}-${opt.storage_name}-${opt.position}`
                                    return (
                                        <MenuItem key={id} value={opt}>{opt.label ?? id}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="supplier-select-label">Supplier</InputLabel>
                            <Select label="Supplier" labelId="supplier-select-label" value={supplier} onChange={event => setSupplier(event.target.value)}>
                                {supplierOptions.map(opt => {
                                    return (
                                        <MenuItem key={opt.name} value={opt}>{opt.name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Stack>
                    <TextField required label="Additional Data" key="additional" variant="outlined" value={additional} onChange={event => setAdditional(event.target.value)} multiline rows={4} />
                    {(componentType === "resistor" || componentType === "capacitor" || componentType === "diode") && (
                        <>
                            <Divider />
                            <Typography variant="h5">{componentType[0].toUpperCase()}{componentType.substring(1).toLowerCase()} Properties</Typography>
                        </>
                    )}
                    {componentType === "resistor" && (
                        <Stack direction="row" gap={1}>
                            <TextField required type="number" sx={{ width: '100%' }} label="Resistance" value={resistance} onChange={event => setResistance(event.target.value)} />
                            <TextField required sx={{ width: '100%' }} label="Power" value={power} onChange={event => setPower(event.target.value)} />
                            <TextField required sx={{ width: '100%' }} label="Composition" value={composition} onChange={event => setComposition(event.target.value)} />
                        </Stack>
                    )}
                    {componentType === "capacitor" && (
                        <Stack direction="row" gap={1}>
                            <TextField required type="number" sx={{ width: '100%' }} label="Capacitance" value={capacitance} onChange={event => setCapacitance(event.target.value)} />
                            <TextField required sx={{ width: '100%' }} label="Capacitor Type" value={capType} onChange={event => setCapType(event.target.value)} />
                            <TextField required sx={{ width: '100%' }} label="Temperature Coefficient" value={tempCoeff} onChange={event => setTempCoeff(event.target.value)} />
                        </Stack>
                    )}
                    {componentType === "diode" && (
                        <Stack direction="row" gap={1}>
                            <TextField required type="number" sx={{ width: '100%' }} label="Forward Voltage" value={vforward} onChange={event => setVForward(event.target.value)} />
                            <TextField required type="number" sx={{ width: '100%' }} label="Reverse Voltage" value={vreverse} onChange={event => setVReverse(event.target.value)} />
                            <TextField required sx={{ width: '100%' }} label="Capacitance" value={capacitance} onChange={event => setDCapacitance(event.target.value)} />
                        </Stack>
                    )}
                </Stack>
            </CardContent>
            <CardActions sx={{ pt: 2 }}>
                <Button size="small" variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button size="small" variant="outlined" onClick={handleCreate}>Create</Button>
            </CardActions>
        </Card>
    )
}

const ComponentsTable: React.FC = () => {
    const getData = useCallback(async () => {
        return await fetch(`http://localhost:3000/component`)
            .then(res => res.json())
            .then(json => {
                return json.map((j, i) => ({ id: i, ...j }))
            })
    }, [])

    const mutateRow = useCallback(async (row, oldRow) => {
        // TODO: persist in DB
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
            />
        </Stack>
    )
}

export default ComponentsTable
