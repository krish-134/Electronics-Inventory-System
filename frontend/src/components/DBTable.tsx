import type React from "react"
import { useEffect, useState } from "react"

interface DBTableParams {
    tableName: string
}

const DBTable: React.FC<DBTableParams> = ({ tableName }) => {
    const [vals, setVals] = useState<object[]>([])

    useEffect(() => {
        fetch(`http://localhost:3000/${tableName}/all`)
            .then(res => res.json())
            .then(json => {
                setVals(json)
            })
    }, [])

    const keys = Object.keys(vals[0] || {})

    return (
        <>
            <strong>{tableName}</strong>
            <table>
                <tr>
                    {keys.map(k => (
                        <th>{k}</th>
                    ))}
                </tr>
                {vals && vals.map(
                    v => (
                        <tr>
                            {Object.values(v).map(c => (<td>{JSON.stringify(c)}</td>))}
                        </tr>
                    )
                )}
            </table>
        </>
    )
}

export default DBTable
