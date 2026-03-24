import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent, selectClasses } from '@mui/material/Select';
import Button from "@mui/material/Button";
import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";

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
    'type',
    'label',
    'last_updated'
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

function formatString(str : string) {
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

const Locations: React.FC = () => {
    const theme = useTheme();
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<string>("");
    const [selectedAttribute, setSelectedAttribute] = useState<string>("");
    const [queriedValue, setQueriedValue] = useState<number>();

    const [returned, setReturned] = useState<object[]>([]);
    const [tableKeys, setTableKeys] = useState<string[]>([]);

    useEffect(() => {
        if (returned.length < 1) return;
        setTableKeys(Object.keys(returned[0]));
    }, [returned]);

    function request() {
        if (!selectedAttribute || !selectedOperator || selectedColumns.length <= 0) return;

        const queryParams = `?fields=${selectedColumns.join(',')}&atr=${selectedAttribute}&op=${selectedOperator}&val=${queriedValue}`;
        fetch(`http://localhost:3000/location${queryParams}`)
            .then(res => res.json())
            .then(data => setReturned(data))
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
        <>
            <div className="flex flex-col my-3 space-y-6 w-1/2 pt-9">
                <p>
                    Use this page to find the locations of your components, as well as extra details about it and its placement.
                </p>
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
                        >
                            {attributes.map(atr => <MenuItem value={atr}>{formatString(atr)}</MenuItem>)}
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
                        >
                            {operators.map(op => <MenuItem value={op.value}>{op.display}</MenuItem>)}
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
                        />
                    </FormControl>
                </div>

                <p>
                    and only show
                </p>

                <FormControl sx={{ mb: 3, width: 400 }}>
                    <InputLabel id="demo-multiple-name-label">Columns</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={selectedColumns}
                        onChange={handleColumnSelect}
                        input={<OutlinedInput label="Columns" />}
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
                
                <Button onClick={request} sx={{ justifySelf: "left", width: 200, border: 1}}>Find my parts!</Button>
            </div>
            <div className="w-3/4">
                {returned.length > 0 &&
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                {tableKeys.map(tk => <TableCell>{formatString(tk)}</TableCell>)}
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {returned.map((tup) => (
                                    <TableRow
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >   
                                        {Object.values(tup).map(val => <TableCell>{val}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
            </div>
        </>
    )
}


export default Locations
