import type React from "react"
import ComponentsTable from "../components/data/ComponentsTable"
import { Stack } from "@mui/material"
import ResistorTable from "../components/data/ResistorTable"
import CapacitorTable from "../components/data/CapacitorTable"
import DiodeTable from "../components/data/DiodeTable"

const Components: React.FC = () => {
    return (
        <Stack direction="column" gap={2}>
            <ComponentsTable />
            <ResistorTable />
            <CapacitorTable />
            <DiodeTable />
        </Stack>
    )
}

export default Components
