import { useRef, type Ref } from 'react'
import './App.css'
import DBTable from './components/DBTable';

function App() {
    const partNumRef: Ref<HTMLInputElement> = useRef(null);
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
    return (
        <>
            <div style={{ "display": "flex", "flexDirection": "row", "gap": "8px" }}>
                <input type="text" ref={partNumRef} placeholder="Part #" />
                <input type="button" onClick={addComponent} value="Create" />
            </div>
            <DBTable tableName='component' />
            <DBTable tableName='supplier' />
            <DBTable tableName='location' />
        </>
    )
}

export default App
