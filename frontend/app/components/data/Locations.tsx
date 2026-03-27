import type React from "react"
import { Box, Button, Grid, Icon, Stack, Typography } from "@mui/material"
import { Location } from '../../types'
import { PropsWithChildren, useEffect, useMemo, useState } from "react"
import { Add, DragHandle, DragIndicator } from "@mui/icons-material"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const ComponentItem: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'COMPONENT',
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    return (
        <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Stack direction="row" gap={1} sx={{ alignItems: 'center', alignContent: 'center' }}>
                <div role="Handle" ref={drag}><DragIndicator sx={{ cursor: "grab" }} fontSize="small" /></div>
                {children}
            </Stack>
        </div>
    )
}

const ComponentList: React.FC<PropsWithChildren<Location>> = ({ children, ...location }) => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }))

    return (
        <Stack>
            <Typography variant="subtitle2">{location.position}</Typography>
            <Box ref={drop} role={'Dustbin'} sx={{ bgcolor: isOver ? 'background.default' : '', p: 1, borderRadius: 1 }}>
                {children}
            </Box>
        </Stack>
    )
}

const Locations: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([])
    const [componentLocations, setComponentLocations] = useState<any>()

    useEffect(() => {
        const fetchData = async () => {
            const locJson = await fetch('http://localhost:3000/location')
                .then(res => res.json())
            const compLocJson = await fetch('http://localhost:3000/location/components')
                .then(res => res.json())
            setLocations(locJson)
            setComponentLocations(compLocJson)
        }

        fetchData()
    }, [])

    const byFacility: Map<string, Map<string, Location[]>> = useMemo(() => {
        const ret = new Map()
        locations.forEach(loc => {
            const facilityMap: Map<string, Location[]> = new Map();
            locations.forEach(loc2 => {
                if (loc.facility != loc2.facility) return;
                const key = loc2.label ?? loc2.storage_name;

                if (!facilityMap.has(key)) facilityMap.set(key, [])
                facilityMap.get(key)?.push(loc2)
            })
            ret.set(loc.facility, facilityMap)
        })
        return ret;
    }, [locations])

    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={2} sx={{ width: "100%" }}>
                {[...byFacility.entries()].map(([facility, locs]) => (
                    <Grid key={facility} sx={{ border: "1px solid", borderColor: "divider", p: 4, borderRadius: 2, width: "100%" }}>
                        <Typography variant="h6">{facility}</Typography>
                        <Stack direction="column" gap={2} sx={{ mt: 2 }}>
                            {[...locs.entries()].map(([display_name, locs]) => (
                                <Box key={display_name} sx={{ border: "1px solid", borderColor: "background.paper", p: 4, borderRadius: 2, width: "100%" }}>
                                    <Typography variant="subtitle1">{display_name}</Typography>
                                    <Grid container size={3} sx={{ width: "100%", mt: 1 }}>
                                        {locs.map(loc => (
                                            <Grid key={loc.position} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={3}>
                                                <ComponentList {...loc}>
                                                    {componentLocations[facility]?.[loc.storage_name]?.map(c => (
                                                        <ComponentItem>
                                                            <Typography variant="caption">
                                                                {c.part_num}
                                                            </Typography>
                                                        </ComponentItem>
                                                    )) ?? (
                                                            <Typography variant="caption">No components...</Typography>
                                                        )}
                                                </ComponentList>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>
                ))}
                <Grid sx={{
                    border: "1px solid", borderColor: "divider", borderRadius: 2, width: "100%", display: "flex", flexDirection: "row", justifyContent: "center"
                }}>
                    <Button sx={{ width: "100%", height: "100%", p: 4 }} disableRipple>
                        <Add sx={{ color: "text.primary" }} />
                    </Button>
                </Grid>
            </Grid>
        </DndProvider >
    )
}

export default Locations
