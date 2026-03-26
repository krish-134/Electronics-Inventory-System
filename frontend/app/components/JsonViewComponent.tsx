import { Button, Popover } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { RichTreeView } from "@mui/x-tree-view";
import { useState } from "react";

const JsonViewComponent: React.FC<GridRenderCellParams> = (params) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    type Entry = {
        id: string
        label: string
        value: any
    }
    const intoTreeEntry = (entry: Entry) => {
        const { id, label, value } = entry;
        if (Array.isArray(value)) {
            return {
                id, label, children: value.map((v, i) => intoTreeEntry({
                    id: `${id}-${i}`,
                    label: `${i}`,
                    value: v
                }))
            }
        } else if (typeof value === "object") {
            return {
                id, label, children: Object.entries(value).map(([k, v], _) => intoTreeEntry({
                    id: `${id}-${k}`,
                    label: `${k}`,
                    value: v
                }))
            }
        } else {
            return { id, label: `${label}: ${value}` }
        }
    }

    const hasValue = params.formattedValue && Object.entries(params.formattedValue).length > 0

    const items = hasValue ? Object.entries(params.formattedValue).map(([k, v], _) => intoTreeEntry({
        id: `${k}`,
        label: `${k}`,
        value: v
    })) : undefined

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = !!anchorEl
    const id = open ? 'delete-popover' : undefined
    return hasValue ? (
        <>
            <Button onClick={handleClick} sx={{ height: '1.75rem' }} variant="outlined">
                Show
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <RichTreeView items={items!} />
            </Popover>
        </>
    ) : (
        <></>
    )
}

export default JsonViewComponent
