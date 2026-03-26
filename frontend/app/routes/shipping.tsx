import type React from "react"
import PurchasesTable from "../shipping/data/PurchasesTable"
import SuppliersTable from "../shipping/data/SuppliersTable"
// import CouriersTable from "../shipping/data/CouriersTable"
import { Stack } from "@mui/material"

const Shipping: React.FC = () => {
    return (
        // <>shipping</>
        <Stack direction="column" gap={2}>
            <PurchasesTable />
            <SuppliersTable />
            {/* <CouriersTable /> */}
        </Stack>
    )
}

export default Shipping
