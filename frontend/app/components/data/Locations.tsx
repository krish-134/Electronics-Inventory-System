import type React from "react"
import { Box, Button, Grid, IconButton, Popover, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { LocatedItem, Location } from '../../types'
import { useEffect, useMemo, useState } from "react"
import { Add, Delete, DragIndicator, Edit as EditIcon, FolderOpen, Memory, Save } from "@mui/icons-material"
import { Link } from 'react-router'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { produce } from 'immer';
import Toast, { ToastInput, ToastStyle } from "../Toast"
import { useToast } from "../../ToastProvider"

type ItemProps = {
    id: string
    itemType: 'component' | 'project'
    from: Location
}

type LocationType = "facility" | "storage" | "position"

const UNPLACED: Location = { position_id: -1, facility: '__UNPLACED__', storage_name: '__UNPLACED__', position: '__UNPLACED__' }

const LocationItem = ({ id, itemType, location, children }: React.PropsWithChildren<{ id: string, itemType: 'component' | 'project', location: Location }>) => {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'COMPONENT',
        item: { id, itemType, from: location } as ItemProps,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    return (
        <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Stack direction="row" gap={0.5} sx={{ alignItems: 'center' }}>
                <div role="handle" ref={drag}>
                    <DragIndicator sx={{ cursor: "grab", display: 'flex' }} fontSize="small" />
                </div>
                {children}
            </Stack>
        </div>
    )
}

type DropHandler = (id: string, itemType: 'component' | 'project', from: Location, to: Location) => void

const ComponentList = ({ children, editing, isEmpty, onRename, onDelete, handleDrop, ...location }: React.PropsWithChildren<Location & {
    editing: boolean
    isEmpty: boolean
    onRename: (newName: string) => Promise<boolean | void>
    onDelete: (e: React.MouseEvent<HTMLElement>) => void
    handleDrop: DropHandler
}>) => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT',
        drop: (item: ItemProps, monitor) => {
            console.log('dropping', item, monitor)
            const loc = item.from;
            if (loc.facility === location.facility && loc.storage_name === location.storage_name && loc.position === location.position) return;
            handleDrop(item.id, item.itemType, loc, location)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }))

    return (
        <Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {editing
                    ? <TextField size="small" variant="standard" defaultValue={location.position} onBlur={async e => { if (e.target.value !== location.position) { const ok = await onRename(e.target.value); if (ok === false) e.target.value = location.position; } }} />
                    : <Typography variant="subtitle2">{location.position}</Typography>}
                {editing && (
                    <Tooltip title={isEmpty ? "Delete position" : "Remove all components first"}>
                        <span>
                            <IconButton size="small" disabled={!isEmpty} onClick={onDelete}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Stack>
            <Box ref={drop} role={'Dustbin'} sx={{ bgcolor: isOver ? 'background.default' : '', p: 1, borderRadius: 1 }}>
                {children}
            </Box>
        </Stack>
    )
}

const UnplacedTray = ({ items, handleDrop }: { items: LocatedItem[], handleDrop: DropHandler }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT',
        drop: (item: ItemProps) => {
            if (item.from.position_id === -1) return;
            handleDrop(item.id, item.itemType, item.from, UNPLACED)
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
            <Typography variant="h6" sx={{ mb: 1 }}>Unplaced</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
                {items.length > 0
                    ? items.map(item => (
                        <LocationItem key={`${item.type}-${item.id}`} id={item.id} itemType={item.type} location={UNPLACED}>
                            <Tooltip title={item.type === "component" ? "Component" : "Project"}>
                                {item.type === 'component' ? <Memory sx={{ fontSize: 14, color: 'text.secondary', display: 'flex' }} /> : <FolderOpen sx={{ fontSize: 14, color: 'primary.main', display: 'flex' }} />}
                            </Tooltip>
                            <Typography component={Link} to={`/${item.type === 'component' ? 'components' : 'projects'}#${item.id}`} variant="caption" sx={{ lineHeight: 1, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{item.id}</Typography>
                        </LocationItem>
                    ))
                    : <Typography variant="caption" color="text.disabled">No unplaced items</Typography>
                }
            </Stack>
        </Box>
    )
}

const Locations: React.FC = () => {
    const [editing, setEditing] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ location: Omit<Location, 'position_id'>, type: LocationType, anchor: HTMLElement } | null>(null)
    const [locations, setLocations] = useState<Location[]>([])
    const [unplacedItems, setUnplacedItems] = useState<LocatedItem[]>([])
    const [itemLocations, setItemLocations] = useState<{
        [facility: string]: {
            [storage_name: string]: {
                [position: string]: LocatedItem[]
            }
        }
    }>({})

    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const locJson = await fetch('http://localhost:3000/location')
                .then(res => res.json())
            const [compLocJson, projLocJson, unplacedJson, unplacedProjJson] = await Promise.all([
                fetch('http://localhost:3000/location/components').then(res => res.json()),
                fetch('http://localhost:3000/location/projects').then(res => res.json()),
                fetch('http://localhost:3000/location/unplaced').then(res => res.json()),
                fetch('http://localhost:3000/location/unplaced-projects').then(res => res.json()),
            ])
            setLocations(locJson)
            setUnplacedItems([
                ...unplacedJson.map(c => ({ id: c.part_num, type: 'component' as const })),
                ...unplacedProjJson.map(p => ({ id: p.name, type: 'project' as const })),
            ])

            const allLocations = locJson.reduce((acc, loc) => {
                acc[loc.facility] ??= {};
                if (loc.storage_name) {
                    acc[loc.facility][loc.storage_name] ??= {};
                    if (loc.position) {
                        const components = (compLocJson[loc.facility]?.[loc.storage_name]?.[loc.position] ?? [])
                            .map(c => ({ id: c.part_num, type: 'component' as const }));
                        const projects = (projLocJson[loc.facility]?.[loc.storage_name]?.[loc.position] ?? [])
                            .map(p => ({ id: p.project_name, type: 'project' as const }));
                        acc[loc.facility][loc.storage_name][loc.position] = [...components, ...projects];
                    }
                }
                return acc;
            }, {})
            setItemLocations(allLocations)
        }

        fetchData()
    }, [])

    const handleDrop = async (id: string, itemType: 'component' | 'project', from: Location, to: Location) => {
        const toUnplaced = to.position_id === -1;
        const fromUnplaced = from.position_id === -1;
        const moveUrl = itemType === 'component'
            ? `http://localhost:3000/component/${id}/move`
            : `http://localhost:3000/project/${id}/move`;

        await fetch(moveUrl, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: toUnplaced ? null : to.position_id })
        }).then(res=>{
            if (Math.floor(res.status / 100) == 2) {
                showToast({display: "Successfully moved item!", level: ToastStyle.SUCCESS});
            }
        })

        const item: LocatedItem = { id, type: itemType };

        if (fromUnplaced) {
            setUnplacedItems(prev => prev.filter(i => !(i.id === id && i.type === itemType)));
            setItemLocations(produce(draft => {
                draft[to.facility] ??= {};
                draft[to.facility][to.storage_name] ??= {};
                draft[to.facility][to.storage_name][to.position] ??= [];
                draft[to.facility][to.storage_name][to.position].push(item);
            }))
        } else if (toUnplaced) {
            setItemLocations(produce(draft => {
                const source = draft[from.facility][from.storage_name][from.position];
                const idx = source.findIndex(i => i.id === id && i.type === itemType);
                if (idx !== -1) source.splice(idx, 1);
            }))
            setUnplacedItems(prev => [...prev, item]);
        } else {
            setItemLocations(produce(draft => {
                const source = draft[from.facility][from.storage_name][from.position];
                const idx = source.findIndex(i => i.id === id && i.type === itemType);
                if (idx !== -1) {
                    source.splice(idx, 1);
                    draft[to.facility] ??= {};
                    draft[to.facility][to.storage_name] ??= {};
                    draft[to.facility][to.storage_name][to.position] ??= [];
                    draft[to.facility][to.storage_name][to.position].push(item);
                }
            }))
        }
    }

    /**
     * Updates itemLocations to include new location
     *
     * @note Does not create the Location passed in - location is used only to store data about creation
     */
    const createLocation = async (location: Omit<Location, 'position_id'>, loc_type: LocationType) => {
        // await fetch ...
        await fetch("http://localhost:3000/location/create", {
            method: "POST",
            body: JSON.stringify({ location, type: loc_type })
        }).then(res=>{
            if (res.status == 409) {
                showToast({display: "Rename your newly created one first!", level: ToastStyle.ERROR});
                 
                return false;
            } else if (Math.floor(res.status / 100) == 2) {
                showToast({display: "Successfully created a new location!", level: ToastStyle.SUCCESS});
                 
            }
        })
        switch (loc_type) {
            case "facility":
                setItemLocations(produce(draft => {
                    draft[location.facility] ??= {}
                }))
                setLocations(draft => {
                    draft.push(location)
                    return draft
                })
                break;
            case "storage":
                setItemLocations(produce(draft => {
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
                setItemLocations(produce(draft => {
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
        const res = await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'facility', oldName, newName })
        })
        
        if (res.status == 409) {
            showToast({display: "A facility with this name already exists", level: ToastStyle.ERROR});
             
            return false;
        } else if (Math.floor(res.status / 100) == 2) {
            showToast({display: "Successfully renamed facility!", level: ToastStyle.SUCCESS});
             
        }

        setItemLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft)) {
                rebuilt[key === oldName ? newName : key] = draft[key];
            }
            return rebuilt;
        }))

        return true;
    }

    const renameStorage = async (facility: string, oldName: string, newName: string) => {
        const res = await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'storage', oldName, newName, facility })
        })

        if (res.status == 409) {
            showToast({display: "A storage with this name already exists", level: ToastStyle.ERROR});
             
            return false;
        } else if (Math.floor(res.status / 100) == 2) {
            showToast({display: "Successfully renamed storage!", level: ToastStyle.SUCCESS});
             
        }

        setItemLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft[facility])) {
                rebuilt[key === oldName ? newName : key] = draft[facility][key];
            }
            draft[facility] = rebuilt;
        }))

        return true;
    }

    const renamePosition = async (facility: string, storage: string, oldName: string, newName: string) => {
        const res = await fetch('http://localhost:3000/location/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'position', oldName, newName, facility, storage })
        })

        if (res.status == 409) {
            showToast({display: "A position with this name already exists", level: ToastStyle.ERROR});
             
            return false;
        } else if (Math.floor(res.status / 100) == 2) {
            showToast({display: "Successfully renamed position!", level: ToastStyle.SUCCESS});
             
        }

        setItemLocations(produce(draft => {
            const rebuilt = {};
            for (const key of Object.keys(draft[facility][storage])) {
                rebuilt[key === oldName ? newName : key] = draft[facility][storage][key];
            }
            draft[facility][storage] = rebuilt;
        }))

        return true;
    }

    const deleteLocation = async (location: Omit<Location, 'position_id'>, loc_type: LocationType) => {
        const res = await fetch('http://localhost:3000/location/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, type: loc_type })
        })

        if (res.ok) {
            showToast({display: "Successfully deleted location!", level: ToastStyle.SUCCESS});
             
        }

        setItemLocations(produce(draft => {
            switch (loc_type) {
                case "position":
                    delete draft[location.facility][location.storage_name][location.position];
                    break;
                case "storage":
                    delete draft[location.facility][location.storage_name];
                    break;
                case "facility":
                    delete draft[location.facility];
                    break;
            }
        }))
    }

    const isFacilityEmpty = (storages: { [storage: string]: { [position: string]: LocatedItem[] } }) =>
        Object.values(storages).every(positions => Object.values(positions).every(items => items.length === 0))

    const isStorageEmpty = (positions: { [position: string]: LocatedItem[] }) =>
        Object.values(positions).every(items => items.length === 0)

    return (
        <DndProvider backend={HTML5Backend}>
             
            <Stack direction="row" sx={{ justifyContent: "flex-end", width: "100%" }}>
                <Button variant="outlined" onClick={() => {
                        if (editing) {
                            showToast({display: "Successfuly saved locations!", level:ToastStyle.SUCCESS}); 
                        }
                        setEditing(e => !e); 
                    }} startIcon={editing ? (<Save />) : (<EditIcon />)}>
                    {editing ? "Save" : "Edit" }
                </Button>
            </Stack>
            <UnplacedTray items={unplacedItems} handleDrop={handleDrop} />
            <Grid container spacing={2} sx={{ width: "100%" }}>
                {Object.entries(itemLocations).map(([facility, storages]) => (
                    <Grid key={facility} sx={{ border: "1px solid", borderColor: "divider", p: 4, borderRadius: 2, width: "100%", mb: 2 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            {editing
                                ? <TextField size="small" variant="standard" defaultValue={facility} onBlur={async e => { if (e.target.value !== facility) { const ok = await renameFacility(facility, e.target.value); if (ok === false) e.target.value = facility; } }} />
                                : <Typography variant="h6">{facility}</Typography>}
                            {editing && (
                                <Tooltip title={isFacilityEmpty(storages) ? "Delete facility" : "Remove all components first"}>
                                    <span>
                                        <IconButton size="small" disabled={!isFacilityEmpty(storages)} onClick={e => setDeleteConfirm({ location: { facility, storage_name: '', position: '' }, type: 'facility', anchor: e.currentTarget })}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack direction="column" gap={2} sx={{ mt: 2 }}>
                            {Object.entries(storages).map(([storage_name, locs]) => (
                                <Box key={storage_name} sx={{ border: "1px solid", borderColor: "background.paper", p: 4, borderRadius: 2, width: "100%" }}>
                                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        {editing
                                            ? <TextField size="small" variant="standard" defaultValue={storage_name} onBlur={async e => { if (e.target.value !== storage_name) { const ok = await renameStorage(facility, storage_name, e.target.value); if (ok === false) e.target.value = storage_name; } }} />
                                            : <Typography variant="subtitle1">{storage_name}</Typography>}
                                        {editing && (
                                            <Tooltip title={isStorageEmpty(locs) ? "Delete storage" : "Remove all components first"}>
                                                <span>
                                                    <IconButton size="small" disabled={!isStorageEmpty(locs)} onClick={e => setDeleteConfirm({ location: { facility, storage_name, position: '' }, type: 'storage', anchor: e.currentTarget })}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                    <Grid container size={3} spacing={1} sx={{ width: "100%", mt: 1 }}>
                                        {Object.entries(locs).map(([position, items]) => {
                                            const currentLoc = locations.find(l => l.facility === facility && l.storage_name === storage_name && l.position === position)
                                                ?? { position_id: 0, facility, storage_name, position };

                                            return (
                                                <Grid key={position} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2 }} size={3}>
                                                    <ComponentList editing={editing} isEmpty={items.length === 0} onRename={newName => renamePosition(facility, storage_name, position, newName)} onDelete={e => setDeleteConfirm({ location: { facility, storage_name, position }, type: 'position', anchor: e.currentTarget })} handleDrop={handleDrop} {...currentLoc}>
                                                        {items.length > 0 ?
                                                            items.map(item => (
                                                                <LocationItem key={`${item.type}-${item.id}`} id={item.id} itemType={item.type} location={currentLoc}>
                                                                    <Tooltip title={item.type === "component" ? "Component" : "Project"}>
                                                                        {item.type === 'component' ? <Memory sx={{ fontSize: 14, color: 'text.secondary', display: 'flex' }} /> : <FolderOpen sx={{ fontSize: 14, color: 'primary.main', display: 'flex' }} />}
                                                                    </Tooltip>
                                                                    <Typography component={Link} to={`/${item.type === 'component' ? 'components' : 'projects'}#${item.id}`} variant="caption" sx={{ lineHeight: 1, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{item.id}</Typography>
                                                                </LocationItem>
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
            <Popover
                open={deleteConfirm !== null}
                anchorEl={deleteConfirm?.anchor}
                onClose={() => setDeleteConfirm(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Stack sx={{ p: 2, bgcolor: "background.paper" }} gap={1}>
                    <Typography variant="body2">
                        Delete {deleteConfirm?.type} '{deleteConfirm?.type === 'facility' ? deleteConfirm?.location.facility : deleteConfirm?.type === 'storage' ? deleteConfirm?.location.storage_name : deleteConfirm?.location.position}'?
                    </Typography>
                    <Stack direction="row" gap={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button size="small" color="error" onClick={() => {
                            if (deleteConfirm) deleteLocation(deleteConfirm.location, deleteConfirm.type);
                            setDeleteConfirm(null);
                        }}>Delete</Button>
                    </Stack>
                </Stack>
            </Popover>
        </DndProvider>
    )
}

export default Locations
