import type React from "react"
import Locations from "../components/data/Locations"
import { useEffect, useState } from "react"
import { alpha, Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from "@mui/material/Button";
import { Box, Chip, Divider, Slide, Snackbar, TextField } from "@mui/material";
import DisplayTable from "../components/DisplayTable";
import Toast, { ToastInput, ToastStyle } from "../components/Toast";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const columns = [
    'part_num',
    'price',
    'name',
    'package',
    'tolerance',
    'quantity',
    'voltage_rating',
    'additional',
    'supplier_name',
    'storage_name',
    'position',
    'facility',
];

const operators = [
    {display: "=", value: "e"},
    {display: "<", value: "lt"},
    {display: "≤", value: "lte"},
    {display: ">", value: "gt"},
    {display: "≥", value: "gte"},
    {display: "≠", value: "ne"},
];

const attributes = [
    'price',
    'tolerance',
    'quantity',
    'voltage_rating'
]

export function formatString(str : string) {
    str = str.replace("_", " ");
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}
        
const LocationsPage: React.FC = () => {
    const theme = useTheme();
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<string>("");
    const [selectedAttribute, setSelectedAttribute] = useState<string>("");
    const [queriedValue, setQueriedValue] = useState<number>(0);

    const [toastContent, setToastContent] = useState<ToastInput>();
    const [toastOpen, setToastOpen] = useState<boolean>(false);
    const [invalidFields, setInvalidFields] = useState<boolean[]>([false, false, false]);

    const [returned, setReturned] = useState<object[]>([]);

    useEffect(() => {
        if (!returned.length) {
            return;
        };
    }, [returned]);

    function request() {
        if (!selectedAttribute || !selectedOperator || selectedColumns.length <= 0) {
            setToastContent({display: "Missing required fields!", level: ToastStyle.ERROR});
            setToastOpen(true);
            setInvalidFields([
                !selectedAttribute,
                !selectedOperator,
                selectedColumns.length <= 0
            ]);
            return;
        };

        setInvalidFields([false, false, false]);

        const queryParams = `?fields=${selectedColumns.join(',')}&atr=${selectedAttribute}&op=${selectedOperator}&val=${queriedValue}`;
        fetch(`http://localhost:3000/location${queryParams}`)
            .then(res => res.json())
            .then(data => {
                setReturned(data);
                if (!data.length) {
                    setToastContent({display: "No results found with these restrictions!", level: ToastStyle.ERROR});
                    setToastOpen(true);
                }
            })
            .catch(err => console.error(err));
    }

    const handleColumnSelect = (event: SelectChangeEvent<typeof selectedColumns>) => {
        const {
        target: { value },
        } = event;

        setSelectedColumns(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <div className="flex flex-col space-y-6 w-full">
            <Toast open={toastOpen} setOpen={setToastOpen} content={toastContent} />
            <Locations />

            <Divider sx={{ my: 3 }}/>

            <p>
                Find the location of my components where
            </p>

            <div>
                <FormControl>
                    <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedAttribute}
                        label="Attribute"
                        onChange={e => setSelectedAttribute(e.target.value)}
                        sx={{ width: 200, mr: 2 }}
                        error={invalidFields[0]}
                    >
                        {attributes.map(atr => <MenuItem key={atr} value={atr}>{formatString(atr)}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl >
                    <InputLabel id="demo-simple-select-label">Operator</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedOperator}
                        label="Operator"
                        onChange={e => setSelectedOperator(e.target.value)}
                        sx={{ width: 115, mr: 2 }}
                        error={invalidFields[1]}
                    >
                        {operators.map(op => <MenuItem key={op.value} value={op.value}>{op.display}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl>
                    <TextField
                        id="outlined-basic"
                        label="Value"
                        variant="outlined"
                        type="number"
                        onChange={e => setQueriedValue(e.target.value as any)}
                        value={queriedValue}
                        sx={{ width: 200, mt: {xs: 2, sm: 0} }}
                    />
                </FormControl>
            </div>

            <p className="-mt-1">
                and only show
            </p>

            <FormControl sx={{ mb: 3, width: {xs: 325, sm: 550}  }}>
                <InputLabel id="demo-multiple-name-label">Columns</InputLabel>
                <Select
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    multiple
                    value={selectedColumns}
                    onChange={handleColumnSelect}
                    input={<OutlinedInput label="Columns" />}
                    error={invalidFields[2]}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={formatString(value)} />
                        ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                {columns.map((name) => (
                    <MenuItem
                        key={name}
                        value={name}
                        style={getStyles(name, selectedColumns, theme)}
                    >
                    {formatString(name)}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

            <Button onClick={request} sx={{ justifySelf: "left", width: 200, border: 1, mb: 1}}>Find my parts!</Button>

            {returned.length > 0 &&
                <DisplayTable label={"Locations"} data={returned}/>
            }
        </div>
    )
}

export default LocationsPage
