import type React from "react"
import { useEffect, useState } from "react"
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from "@mui/material/Button";
import { Box, Chip } from "@mui/material";

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
    'storage_name',
    'position',
    'facility',
    'type',
    'label',
    'last_updated'
];

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
    const [selected, setSelected] = useState<string[]>([]);
    const [returned, setReturned] = useState<{}>({});

    function request() {
        const queryParams = selected.length > 0 ? `?fields=${selected.join(',')}` : '';
        fetch(`http://localhost:3000/location${queryParams}`)
            .then(res => res.json())
            .then(data => setReturned(data))
            .catch(err => console.error(err));
    }

    const handleChange = (event: SelectChangeEvent<typeof selected>) => {
        const {
        target: { value },
        } = event;
        console.log(value);
        setSelected(
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    
    return (
        <div className="flex flex-col my-3">
            <FormControl sx={{ m: 1, width: 400 }}>
                <InputLabel id="demo-multiple-name-label">Columns</InputLabel>
                <Select
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    multiple
                    value={selected}
                    onChange={handleChange}
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
                        style={getStyles(name, selected, theme)}
                    >
                    {formatString(name)}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <Button onClick={request}>hello</Button>
            {returned && <div className="w-32 text-ellipsis">{JSON.stringify(returned)}</div>}
        </div>
    )
}


export default Locations
