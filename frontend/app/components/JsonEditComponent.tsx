import * as React from 'react';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { TextField } from '@mui/material';

const JsonEditComponent: React.FC<GridRenderEditCellParams> = (props: GridRenderEditCellParams) => {
  const { id, field, value } = props;
  const apiRef = useGridApiContext();
  const [editValue, setEditValue] = React.useState(
    JSON.stringify(value, null, 2)
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value);
    try {
      const parsedValue = JSON.parse(event.target.value);
      apiRef.current.setEditCellValue({ id, field, value: parsedValue, debounceMs: 200 });
    } catch (e) {
      console.warn("Invalid JSON:", e);
    }
  };

  return (
    <TextField
      value={editValue}
      onChange={handleChange}
      multiline
      fullWidth
    />
  );
}

export default JsonEditComponent
