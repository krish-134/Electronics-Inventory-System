import type React from "react"
import Button from "@mui/material/Button";
import { useState } from "react";
import DisplayTable from "../components/DisplayTable";
import Toast, { ToastStyle } from "../components/Toast";

const Projects: React.FC = () => {
    const [returned, setReturned] = useState<object[]>([]);
    const [errorText, setErrorText] = useState<string>();

    const [toastOpen, setToastOpen] = useState<boolean>(false);

    function request() {
        fetch(`http://localhost:3000/project?has-all-components=true`)
            .then(res => res.json())
            .then(data => {
                setReturned(data)
                if (!data.length) {
                    setErrorText("None of your projects use all of your components!");
                    setToastOpen(true);
                }
            })
            .catch(err => console.error(err));
    }

    return (
        <div className="flex flex-col my-3 space-y-6 pt-9 w-full">   
            <Toast open={toastOpen} setOpen={setToastOpen} text={errorText} style={ToastStyle.ERROR} />
            
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
