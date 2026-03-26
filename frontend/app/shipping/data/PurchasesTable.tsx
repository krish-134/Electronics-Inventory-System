import { useCallback } from "react"

const PurchasesTable(): React.FC = () => {
    const getData = useCallback(async () => {
        return await fetch(`http://localhost:3000/shipping?type=purchases`)
    })
}