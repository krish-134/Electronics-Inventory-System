import type React from "react"
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import DisplayTable from "../components/DisplayTable";
import Toast, { ToastInput, ToastStyle } from "../components/Toast";
import { Divider } from "@mui/material";
import { useToast } from "../ToastProvider";

const Projects: React.FC = () => {
    const [data, setData] = useState<object[]>([]);
    const [returned, setReturned] = useState<object[]>([]);

    const { showToast } = useToast();

    function request() {
        fetch(`http://localhost:3000/project?has-all-components=true`)
            .then(res => res.json())
            .then(data => {
                setReturned(data)
                if (!data.length) {
                    showToast({display: "None of your projects use all of your components!", level: ToastStyle.ERROR});
                     ;
                }
            })
            .catch(err => console.error(err));
    }

    useEffect(()=>{
        fetch(`http://localhost:3000/project`)
            .then(res => res.json())
            .then(data => {
                setData(data)
            })},
            []
        )

    return (
        <div className="flex flex-col space-y-6 w-full">   
             

            <DisplayTable data={data} label={"Projects"}/>

            <Divider sx={{my:3}}/>
            
            <p>
                Click this button to see the projects that use all of your components!
            </p>
                
            <Button onClick={request} sx={{ justifySelf: "left", width: 200, border: 1}}>Query!</Button>

            {returned.length > 0 &&
                <DisplayTable label={"Projects"} data={returned}/>
            }
        </div>
    )
}

export default Projects
