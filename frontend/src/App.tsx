import { useRef, type Ref } from 'react'
import './App.css'
import DBTable from './components/DBTable';

function App() {
    const partNumRef: Ref<HTMLInputElement> = useRef(null);

    const updatePartNumRef: Ref<HTMLInputElement> = useRef(null);
    const updatePriceRef: Ref<HTMLInputElement> = useRef(null);
    
    const addComponent = async () => {
        if (!partNumRef.current) return;

        const partNum = partNumRef.current.value;

        const body = {
            part_num: partNum,
            price: 27.33,
            name: `Name ${Math.floor(Math.random() * 1_000_000)}`,
            package: '0402',
            tolerance: 0.1,
            quantity: 1,
            voltage_rating: 16,
            additional: {},

            storage_name: 'desk',
            position: 'drawer 1',
            facility: 'home',
            supplier_name: 'DigiKey'
        }

        await fetch(`http://localhost:3000/component/create`, {
            body: JSON.stringify(body),
            method: "POST"
        }).finally(() => {
            window.location.reload()
        })
    }

    const updatePrice = async () => {
        if (!updatePartNumRef.current || !updatePriceRef.current) return;

        const partNum = updatePartNumRef.current.value;
        const price = updatePriceRef.current.value;

        const body = {
            price: price
        }

        await fetch(`http://localhost:3000/component/${partNum}/price`, {
            body: JSON.stringify(body),
            method: "PUT"
        }).finally(() => {
            window.location.reload()
        })
    }

    const deleteComponent = async (partNum: string) => {
        await fetch(`http://localhost:3000/component/${partNum}`, {
            method: "DELETE"
        }).finally(() => {
            window.location.reload()
        })
    }

    return (
        <>
            <div style={{ "display": "flex", "flexDirection": "row", "gap": "8px" }}>
                <input type="text" ref={partNumRef} placeholder="Part #" />
                <input type="button" onClick={addComponent} value="Create" />
            </div>
            <div style={{ "display": "flex", "flexDirection": "row", "gap": "8px", "marginTop":"12px" }}>
                
                <input type="text" ref={updatePartNumRef} placeholder="Part #" />
                <input type="text" ref={updatePriceRef} placeholder="Updated Price" />
                <input type="button" onClick={updatePrice} value="Update" />
            </div>
            <DBTable tableName='component' keyColumn='part_num'onDelete={deleteComponent} />
            <DBTable tableName='supplier' />
            <DBTable tableName='location' />
        </>
    )
}

export default App
