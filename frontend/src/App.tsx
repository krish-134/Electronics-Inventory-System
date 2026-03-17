import { useRef, type Ref } from 'react'
import './App.css'
import DBTable from './components/DBTable';
import { Button, Stack, TextField, ThemeProvider, createTheme } from '@mui/material'

function App() {
    const partNumRef: Ref<HTMLInputElement> = useRef(null);

    const updatePartNumRef: Ref<HTMLInputElement> = useRef(null);
    const updatePriceRef: Ref<HTMLInputElement> = useRef(null);

    const deletePartNumRef: Ref<HTMLInputElement> = useRef(null);

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
            <Stack gap={2}>
                <Stack gap={2} direction="row">
                    <TextField label="Part #" variant="outlined" ref={partNumRef} />
                    <Button onClick={addComponent} variant="contained">Create</Button>
                </Stack>
                <Stack gap={2} direction="row">
                    <TextField label="Part #" variant="outlined" ref={updatePartNumRef} />
                    <TextField label="Updated Price" variant="outlined" ref={updatePriceRef} />
                    <Button onClick={updatePrice} variant="contained">Update</Button>
                </Stack>
                <Stack gap={2} direction="row">
                    <TextField label="Part #" variant="outlined" ref={deletePartNumRef} />
                    <Button onClick={deleteComponent} variant="contained">Delete</Button>
                </Stack>
            </Stack>
            <DBTable tableName='component' />
            <DBTable tableName='supplier' />
            <DBTable tableName='location' />
        </>
    )
}

export default App
