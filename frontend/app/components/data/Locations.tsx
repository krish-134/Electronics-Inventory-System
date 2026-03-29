import type React from "react"
import { Box, Button, Grid, Icon, IconButton, Stack, Typography } from "@mui/material"
import { Component, Location } from '../../types'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react"
import { Add, DragHandle, DragIndicator, MoreVert, VerticalShadesTwoTone } from "@mui/icons-material"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { produce } from 'immer';

type ItemProps = {
    id: string
    from: Location
}

const ComponentItem: React.FC<PropsWithChildren<{ part_num: string, location: Location }>> = ({ part_num, location, children }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'COMPONENT',
        item: { id: part_num, from: location } as ItemProps,
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

const ComponentList: React.FC<PropsWithChildren<Location & { handleDrop: (part_num: string, from: Location, to: Location) => void }>> = ({ children, handleDrop, ...location }) => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT',
        drop: (item: ItemProps, monitor) => {
            console.log('dropping', item, monitor)
            const loc = item.from;
            if (loc.facility === location.facility && loc.storage_name === location.storage_name && loc.position === location.position) return;
            handleDrop(item?.id, loc, location)
        },
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
    const [refresh, setRefresh] = useState<boolean>(false)

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

    const byFacility: {
        [facility: string]: {
            [storage_name: string]: {
                [position: string]: Location[]
            }
        }
    } = useMemo(() => {
        const ret = {}
        locations.forEach(loc => {
            const facilityMap: { [storage_name: string]: { [position: string]: Location[] } } = {};
            locations.forEach(loc2 => {
                if (loc.facility != loc2.facility) return;
                const key = loc2.label ?? loc2.storage_name;

                if (!facilityMap[key]) facilityMap[key] = {}


                if (!facilityMap[key][loc2.position]) facilityMap[key][loc2.position] = [];

                facilityMap[key]?.[loc2.position]?.push(loc2)
            })
            ret[loc.facility] = facilityMap
        })
        return ret
    }, [locations])

    const handleDrop = async (part_num: string, from: Location, to: Location) => {
        await fetch(`http://localhost:3000/component/${part_num}/move`, {
            method: "PUT",
            body: JSON.stringify(to)
        })

        setComponentLocations(produce(draft => {
            const from_dname = from.label ?? from.storage_name
            const to_dname = to.label ?? to.storage_name

            const source = draft[from.facility][from_dname][from.position]
            const idx = source.findIndex(c => c.part_num == part_num)

            if (idx == -1) return;

            const [component] = source.splice(idx, 1)

            draft[to.facility] ??= {}
            draft[to.facility][to_dname] ??= {}
            draft[to.facility][to_dname][to.position] ??= []
            draft[to.facility][to_dname][to.position].push({ ...component, ...to })
        }))
        setRefresh(!refresh)
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={2} sx={{ width: "100%" }}>
                {[...Object.entries(byFacility)].map(([facility, locs]) => (
                    <Grid key={facility} sx={{ border: "1px solid", borderColor: "divider", p: 4, borderRadius: 2, width: "100%" }}>
                        <Typography variant="h6">{facility}</Typography>
                        <Stack direction="column" gap={2} sx={{ mt: 2 }}>
                            {[...Object.entries(locs)].map(([display_name, locs]) => (
                                <Box key={display_name} sx={{ border: "1px solid", borderColor: "background.paper", p: 4, borderRadius: 2, width: "100%" }}>
                                    <Typography variant="subtitle1">{display_name}</Typography>
                                    <Grid container size={3} spacing={1} sx={{ width: "100%", mt: 1 }}>
                                        {Object.entries(locs).map(([position, locs]) => {
                                            const components = componentLocations[facility]?.[display_name]?.[position];
                                            return locs.map(loc => (
                                                <Grid key={loc.position} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={3}>
                                                    {(!components || !components.length) && (
                                                        <IconButton sx={{ position: "relative", float: "right", top: -10, right: -10, borderRadius: 2 }}>
                                                            <MoreVert fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    <ComponentList handleDrop={handleDrop} {...loc}>
                                                        {(components && components.length) ? components.map(c => (
                                                            <ComponentItem part_num={c.part_num} location={loc}>
                                                                <Typography variant="caption">
                                                                    {c.part_num}
                                                                </Typography>
                                                            </ComponentItem>
                                                        )) : (
                                                            <Typography variant="caption">No components...</Typography>
                                                        )}
                                                    </ComponentList>
                                                </Grid>
                                            ))
                                        })}
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
