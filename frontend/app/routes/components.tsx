import type React from "react"
import ComponentsTable from "../components/data/ComponentsTable"
import { alpha, Box, Button, Chip, Divider, FormControl, InputLabel, Menu, MenuItem, OutlinedInput, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import ResistorTable from "../components/data/ResistorTable"
import CapacitorTable from "../components/data/CapacitorTable"
import DiodeTable from "../components/data/DiodeTable"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Component } from "../types"
import { formatString } from "./locations"
import DisplayTable from "../components/DisplayTable"
import Toast, { ToastInput, ToastStyle } from "../components/Toast"

const columns = [
    'part_num',
    'price',
    'name',
    'tolerance',
    'quantity',
    'voltage_rating'
];

const operators = [
    {display: "=", value: "="},
    {display: "<", value: "<"},
    {display: "≤", value: "<="},
    {display: ">", value: ">"},
    {display: "≥", value: ">="},
    {display: "≠", value: "!="},
];

const Components: React.FC = () => {
    const [data, setData] = useState<(Component & { component_type: string })[]>();

    useEffect(() => {
        fetch(`http://localhost:3000/component`)
            .then(res => res.json())
            .then(json => {
                setData(json.map((j: any, i: any) => ({ id: j.part_num ?? i, ...j })))
            })
    }, [])

    const getData = useCallback(async () => data, [data])
    const getResistors = useCallback(async () => data?.filter(d => d.component_type == "resistor"), [data])
    const getCapacitors = useCallback(async () => data?.filter(d => d.component_type == "capacitor"), [data])
    const getDiodes = useCallback(async () => data?.filter(d => d.component_type == "diode"), [data])

    const [toastContent, setToastContent] = useState<ToastInput>();
    const [toastOpen, setToastOpen] = useState<boolean>(false);

    // was triggering on every refresh, so memoize it
    const memoizedTables = useMemo(() => {
        if (!data) return null;
        return (
            <>
                <ComponentsTable getData={getData} />
                <ResistorTable getData={getResistors} />
                <CapacitorTable getData={getCapacitors} />
                <DiodeTable getData={getDiodes} />
            </>
        );
    }, [data, getData, getResistors, getCapacitors, getDiodes]);

    ////////// selection logic /////////
    const [selectionReturned, setSelectionReturned] = useState<object[]>([]);
    const [filters, setFilters] = useState([{ id: Date.now(), connector: 'AND', field: '', operator: '', value: '' }]);

    const addFilter = () => setFilters([...filters, { id: Date.now(), connector: 'AND', field: '', operator: '', value: '' }]);
    const updateFilter = (id: number, key: string, val: string) => setFilters(filters.map(f => f.id === id ? { ...f, [key]: val } : f));
    const removeFilter = (id: number) => setFilters(filters.filter(f => f.id !== id));

    function request() {
        if (filters.some(f => f.field === '' || f.operator === '' || f.value.trim() === '')) {
            setToastContent({display: "Please fill out all filter fields before searching", level: ToastStyle.ERROR});
            setToastOpen(true);
            return;
        }
        
        const validFilters = filters.filter(f => f.value.trim() !== '');
        const queryParams = new URLSearchParams();
        
        if (validFilters.length > 0) {
            queryParams.set('filters', JSON.stringify(validFilters));
        }
        
        fetch(`http://localhost:3000/component?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                setSelectionReturned(data);
                if (!data.length) {
                    setToastContent({display: "No results found with these restrictions!", level: ToastStyle.ERROR});
                    setToastOpen(true);
                }
            });
    }
    ////////////////////////////////////

    return (
        <Stack direction="column" gap={2}>
            <Toast open={toastOpen} setOpen={setToastOpen} content={toastContent} />
            
            {memoizedTables}
             
            <Divider sx={{my: 3}}/>

            <p className="-mt-1">
                Find my parts where 
            </p>

            <FormControl>
                {filters.map((f, index) => (
                    <Stack direction="row" gap={1} alignItems="center" key={f.id} sx={{ mb: 1 }}>
                        <Select size="small" value={f.field} onChange={(e) => updateFilter(f.id, 'field', e.target.value)} sx={{width: 150}}>
                            {columns.map((col)=><MenuItem value={col}>{formatString(col)}</MenuItem>)}
                        </Select>
                        <Select size="small" value={f.operator} onChange={(e) => updateFilter(f.id, 'operator', e.target.value)} sx={{width: 60}}>
                            {operators.map((op)=><MenuItem value={op.value}>{op.display}</MenuItem>)}
                        </Select>
                        <TextField size="small" value={f.value} onChange={(e) => updateFilter(f.id, 'value', e.target.value)} placeholder="Value" sx={{width: 120}}/>
                        {index != filters.length - 1 ?
                            <ToggleButtonGroup
                                value={f.connector}
                                exclusive
                                onChange={(e, val) => val && updateFilter(f.id, 'connector', val)}
                                size="small"
                            >
                                <ToggleButton value="AND">AND</ToggleButton>
                                <ToggleButton value="OR">OR</ToggleButton>
                            </ToggleButtonGroup>
                                :
                            <Button variant="outlined" onClick={addFilter} sx={{width: '6.5%'}}>+</Button>
                        }
                        {filters.length > 1 && index === filters.length - 1 && (
                            <Button color="error" onClick={() => removeFilter(f.id)} sx={{border:1, borderColor: alpha('#aa0000', 0.6)}}>X</Button>
                        )}
                    </Stack>
                ))}
            </FormControl>

            <Button onClick={request} sx={{ justifySelf: "left", width: 200, border: 1, mb: -1.5}}>Find my parts!</Button>

            {selectionReturned.length > 0 &&
                <DisplayTable label={"Locations"} data={selectionReturned}/>
            }
        </Stack>
    )
}

export default Components
