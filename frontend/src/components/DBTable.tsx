import type React from "react"
import { useEffect, useState } from "react"

interface DBTableParams {
    tableName: string
    keyColumn?: string
    onDelete?: (keyValue: string) => void
}

const DBTable: React.FC<DBTableParams> = ({ tableName, keyColumn, onDelete}) => {
    const [vals, setVals] = useState<Record<string, unknown>[]>([])


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
                    {onDelete && <th>Actions</th>}
                </tr>
                {vals.map((row, i) => {
                    const keyValue = keyColumn ?  String(row[keyColumn]) : undefined
                    return (
                        <tr key = {i}>
                            {Object.values(row).map((val, jcol) => (
                                <td key={jcol}>{JSON.stringify(val)}</td>
                            ))}
                            {onDelete && keyValue && (
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => onDelete(keyValue)}
                                        >
                                            Delete
                                        </button>
                                </td>
                            )}
                        </tr>
                    )
                })}
            </table>
        </>
    )
}

export default DBTable
