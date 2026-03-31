import type React from "react"
import ComponentsTable from "../components/data/ComponentsTable"
import { Stack } from "@mui/material"
import ResistorTable from "../components/data/ResistorTable"
import CapacitorTable from "../components/data/CapacitorTable"
import DiodeTable from "../components/data/DiodeTable"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Component } from "../types"

const Components: React.FC = () => {
    const [data, setData] = useState<(Component & { component_type: string })[]>()

    useEffect(() => {
        fetch(`http://localhost:3000/component`)
            .then(res => res.json())
            .then(json => {
                setData(json.map((j, i) => ({ id: j.part_num ?? i, ...j })))
            })
    }, [])

    const getData = useCallback(async () => data, [data])
    const getResistors = useCallback(async () => data?.filter(d => d.component_type == "resistor"), [data])
    const getCapacitors = useCallback(async () => data?.filter(d => d.component_type == "capacitor"), [data])
    const getDiodes = useCallback(async () => data?.filter(d => d.component_type == "diode"), [data])

    return (
        <Stack direction="column" gap={2}>
            {data && (
                <>
                    <ComponentsTable getData={getData} />
                    <ResistorTable getData={getResistors} />
                    <CapacitorTable getData={getCapacitors} />
                    <DiodeTable getData={getDiodes} />
                </>
            )}
        </Stack>
    )
}

export default Components
