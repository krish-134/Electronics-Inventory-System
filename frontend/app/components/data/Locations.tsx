import type React from "react"
import { Box, Button, Grid, Icon, IconButton, Stack, TextField, Typography } from "@mui/material"
import { Component, Location } from '../../types'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react"
import { Add, Delete, DragHandle, DragIndicator, Edit as EditIcon, MoreVert, Save, VerticalShadesTwoTone } from "@mui/icons-material"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { produce } from 'immer';

type ItemProps = {
    id: string
    from: Location
}

type LocationType = "facility" | "storage" | "position"

const UNPLACED: Location = { position_id: -1, facility: '__UNPLACED__', storage_name: '__UNPLACED__', position: '__UNPLACED__' }

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

const ComponentList: React.FC<PropsWithChildren<Location & { editing: boolean, onRename: (newName: string) => void, handleDrop: (part_num: string, from: Location, to: Location) => void }>> = ({ children, editing, onRename, handleDrop, ...location }) => {
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
            {editing
                ? <TextField size="small" variant="standard" defaultValue={location.position} onBlur={e => { if (e.target.value !== location.position) onRename(e.target.value) }} />
                : <Typography variant="subtitle2">{location.position}</Typography>}
            <Box ref={drop} role={'Dustbin'} sx={{ bgcolor: isOver ? 'background.default' : '', p: 1, borderRadius: 1 }}>
                {children}
            </Box>
        </Stack>
    )
}

const UnplacedTray: React.FC<{ components: Component[], handleDrop: (part_num: string, from: Location, to: Location) => void }> = ({ components, handleDrop }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT',
        drop: (item: ItemProps) => {
            if (item.from.position_id === -1) return;
            handleDrop(item.id, item.from, UNPLACED)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }))

    return (
        <Box ref={drop} sx={{
            border: '1px dashed',
            borderColor: isOver ? 'primary.main' : 'divider',
            p: 2, borderRadius: 2, mb: 2, width: '100%', minHeight: 60
        }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Unplaced Components</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {components.length > 0
                    ? components.map(c => (
                        <ComponentItem key={c.part_num} part_num={c.part_num} location={UNPLACED}>
                            <Typography variant="caption">{c.part_num}</Typography>
                        </ComponentItem>
                    ))
                    : <Typography variant="caption" color="text.disabled">No unplaced components</Typography>
                }
            </Stack>
        </Box>
    )
}

const Locations: React.FC = () => {
    const [editing, setEditing] = useState(false)
    const [locations, setLocations] = useState<Location[]>([])
    const [unplacedComponents, setUnplacedComponents] = useState<Component[]>([])
    const [componentLocations, setComponentLocations] = useState<{
        [facility: string]: {
            [storage_name: string]: {
                [position: string]: Component[]
            }
        }
    }>({})

    useEffect(() => {
        const fetchData = async () => {
            const locJson = await fetch('http://localhost:3000/location')
                .then(res => res.json())
            const compLocJson = await fetch('http://localhost:3000/location/components')
                .then(res => res.json())
            const unplacedJson = await fetch('http://localhost:3000/location/unplaced')
                .then(res => res.json())
            setLocations(locJson)
            setUnplacedComponents(unplacedJson)

            const allLocations = locJson.reduce((acc, loc) => {
                acc[loc.facility] ??= {};
                if (loc.storage_name) {
                    acc[loc.facility][loc.storage_name] ??= {};
                    if (loc.position) {
                        acc[loc.facility][loc.storage_name][loc.position] =
                            compLocJson[loc.facility]?.[loc.storage_name]?.[loc.position] ?? [];
                    }
                }
                return acc;
            }, {})
            setComponentLocations(allLocations)
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
                const key = loc2.storage_name;

                if (!facilityMap[key]) facilityMap[key] = {}


                if (!facilityMap[key][loc2.position]) facilityMap[key][loc2.position] = [];

                facilityMap[key]?.[loc2.position]?.push(loc2)
            })
            ret[loc.facility] = facilityMap
        })
        return ret
    }, [locations])

    const handleDrop = async (part_num: string, from: Location, to: Location) => {
        const toUnplaced = to.position_id === -1;
        const fromUnplaced = from.position_id === -1;

        await fetch(`http://localhost:3000/component/${part_num}/move`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                position: toUnplaced ? null : to.position_id
            })
        })

        if (fromUnplaced) {
            const component = unplacedComponents.find(c => c.part_num === part_num);
            setUnplacedComponents(prev => prev.filter(c => c.part_num !== part_num));
            setComponentLocations(produce(draft => {
                draft[to.facility] ??= {};
                draft[to.facility][to.storage_name] ??= {};
                draft[to.facility][to.storage_name][to.position] ??= [];
                draft[to.facility][to.storage_name][to.position].push({
                    ...component,
                    facility: to.facility,
                    storage_name: to.storage_name,
                    position: to.position
                });
            }))
        } else if (toUnplaced) {
            let removed: Component | undefined;
            setComponentLocations(produce(draft => {
                const source = draft[from.facility][from.storage_name][from.position];
                const idx = source.findIndex(c => c.part_num === part_num);
                if (idx !== -1) {
                    const [component] = source.splice(idx, 1);
                    removed = { ...component };
                }
            }))
            if (removed) setUnplacedComponents(prev => [...prev, removed!]);
        } else {
            setComponentLocations(produce(draft => {
                const source = draft[from.facility][from.storage_name][from.position];
                const idx = source.findIndex(c => c.part_num === part_num);
                if (idx !== -1) {
                    const [component] = source.splice(idx, 1);
                    draft[to.facility] ??= {};
                    draft[to.facility][to.storage_name] ??= {};
                    draft[to.facility][to.storage_name][to.position] ??= [];
                    draft[to.facility][to.storage_name][to.position].push({
                        ...component,
                        facility: to.facility,
                        storage_name: to.storage_name,
                        position: to.position
                    });
                }
            }))
        }
    }

    /**
     * Updates componentLocations to include new location
     *
     * @note Does not create the Location passed in - location is used only to store data about creation
     */
    const createLocation = async (location: Omit<Location, 'position_id'>, loc_type: LocationType) => {
        // await fetch ...
        await fetch("http://localhost:3000/location/create", {
            method: "POST",
            body: JSON.stringify({ location, type: loc_type })
        })
        switch (loc_type) {
            case "facility":
                setComponentLocations(produce(draft => {
                    draft[location.facility] ??= {}
                }))
                setLocations(draft => {
                    draft.push(location)
                    return draft
                })
                break;
            case "storage":
                setComponentLocations(produce(draft => {
                    draft[location.facility] ??= {}
                    draft[location.facility][location.storage_name] ??= {}
                }))
                setLocations(draft => {
                    draft = draft.filter(loc => loc.facility === location.facility && loc.storage_name !== "")
                    draft.push(location)
                    return draft
                })
                break;
            case "position":
                setComponentLocations(produce(draft => {
                    draft[location.facility] ??= {}
                    draft[location.facility][location.storage_name] ??= {}
                    draft[location.facility][location.storage_name][location.position] ??= []
                }))
                setLocations(draft => {
                    draft = draft.filter(loc => (loc.facility !== location.facility && loc.storage_name !== location.storage_name) || loc.position !== "")
                    draft.push(location)

                    return draft
                })
                break;
        }
    }

    const renameFacility = async (oldName: string, newName: string) => {
        await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'facility', oldName, newName })
        })
        setComponentLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft)) {
                rebuilt[key === oldName ? newName : key] = draft[key];
            }
            return rebuilt;
        }))
    }

    const renameStorage = async (facility: string, oldName: string, newName: string) => {
        await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'storage', oldName, newName, facility })
        })
        setComponentLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft[facility])) {
                rebuilt[key === oldName ? newName : key] = draft[facility][key];
            }
            draft[facility] = rebuilt;
        }))
    }

    const renamePosition = async (facility: string, storage: string, oldName: string, newName: string) => {
        await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'position', oldName, newName, facility, storage })
        })
        setComponentLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft[facility][storage])) {
                rebuilt[key === oldName ? newName : key] = draft[facility][storage][key];
            }
            draft[facility][storage] = rebuilt;
        }))
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Stack direction="row" sx={{ justifyContent: "flex-end", width: "100%" }}>
                <IconButton onClick={() => setEditing(e => !e)}>
                    {editing ? (
                        <Save />
                    ) : (
                        <EditIcon />
                    )}
                </IconButton>
            </Stack>
            <UnplacedTray components={unplacedComponents} handleDrop={handleDrop} />
            <Grid container spacing={2} sx={{ width: "100%" }}>
                {Object.entries(componentLocations).map(([facility, storages]) => (
                    <Grid key={facility} sx={{ border: "1px solid", borderColor: "divider", p: 4, borderRadius: 2, width: "100%", mb: 2 }}>
                        {editing
                            ? <TextField size="small" variant="standard" defaultValue={facility} onBlur={e => { if (e.target.value !== facility) renameFacility(facility, e.target.value) }} inputProps={{ style: { fontSize: '1.25rem', fontWeight: 500 } }} />
                            : <Typography variant="h6">{facility}</Typography>}
                        <Stack direction="column" gap={2} sx={{ mt: 2 }}>
                            {Object.entries(storages).map(([storage_name, locs]) => (
                                <Box key={storage_name} sx={{ border: "1px solid", borderColor: "background.paper", p: 4, borderRadius: 2, width: "100%" }}>
                                    {editing
                                        ? <TextField size="small" variant="standard" defaultValue={storage_name} onBlur={e => { if (e.target.value !== storage_name) renameStorage(facility, storage_name, e.target.value) }} />
                                        : <Typography variant="subtitle1">{storage_name}</Typography>}
                                    <Grid container size={3} spacing={1} sx={{ width: "100%", mt: 1 }}>
                                        {Object.entries(locs).map(([position, components]) => {
                                            const currentLoc = locations.find(l => l.facility === facility && l.storage_name === storage_name && l.position === position)
                                                ?? { position_id: 0, facility, storage_name, position };

                                            return (
                                                <Grid key={position} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={3}>
                                                    <ComponentList editing={editing} onRename={newName => renamePosition(facility, storage_name, position, newName)} handleDrop={handleDrop} {...currentLoc}>
                                                        {components.length > 0 ?
                                                            components.map(c => (
                                                                <ComponentItem key={c.part_num} part_num={c.part_num} location={currentLoc}>
                                                                    <Typography variant="caption">{c.part_num}</Typography>
                                                                </ComponentItem>
                                                            ))
                                                            : (
                                                                <Typography variant="caption" color="text.disabled">Empty</Typography>
                                                            )}
                                                    </ComponentList>
                                                </Grid>
                                            )
                                        })}
                                        {editing && <Grid key="add-position" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }} size={3}>
                                            <Button sx={{ width: "100%", height: "100%", p: 2 }} disableRipple onClick={() => {
                                                createLocation({
                                                    facility,
                                                    storage_name,
                                                    position: "New Position",
                                                }, "position")
                                            }}
                                            >
                                                <Add sx={{ color: "text.secondary" }} />
                                            </Button>
                                        </Grid>}
                                    </Grid>
                                </Box>
                            ))}

                            {editing && <Grid container size={3} spacing={1} sx={{ border: "1px solid", borderColor: "background.paper", width: "100%", mt: 1, borderRadius: 2 }}>
                                <Button sx={{ width: "100%", height: "100%", p: 2 }} disableRipple onClick={() => createLocation({
                                    facility,
                                    storage_name: "New Storage",
                                    position: ""
                                }, "storage")}>
                                    <Add sx={{ color: "text.secondary" }} />
                                </Button>
                            </Grid>}
                        </Stack>
                    </Grid>
                ))}
                {editing && <Grid sx={{
                    border: "1px solid", borderColor: "divider", borderRadius: 2, width: "100%", display: "flex", flexDirection: "row", justifyContent: "center"
                }}>
                    <Button sx={{ width: "100%", height: "100%", p: 4 }} disableRipple onClick={() => createLocation({
                        facility: "New Facility",
                        storage_name: "",
                        position: ""
                    }, "facility")}>
                        <Add sx={{ color: "text.secondary" }} />
                    </Button>
                </Grid>}
            </Grid>
        </DndProvider >
    )
}

export default Locations
