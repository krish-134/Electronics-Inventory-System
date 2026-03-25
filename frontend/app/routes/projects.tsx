import type React from "react"
import Button from "@mui/material/Button";
import { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const Projects: React.FC = () => {
    const [returned, setReturned] = useState<object[]>([]);
    const [errorText, setErrorText] = useState<string>();

    function request() {
        fetch(`http://localhost:3000/project?has-all-components=true`)
            .then(res => res.json())
            .then(data => setReturned(data))
            .then(_ => {if (!returned.length) setErrorText("None of your projects use all of your components!")})
            .catch(err => console.error(err));
    }

    return (
        <div className="flex flex-col my-3 space-y-6 w-1/2 pt-9">   
            <p>
                Click this button to see the projects that use all of your components!
            </p>
                
            <Button onClick={request} sx={{ justifySelf: "left", width: 200, border: 1, mb: 3}}>Query!</Button>

            {returned.length ? 
                 <List
                    sx={{
                        width: '100%',
                        maxWidth: 360,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        maxHeight: 300,
                        '& ul': { padding: 0 }
                    }}
                    >
                    {returned.map((ret) => (
                        <li>
                            <ListItem>
                                <ListItemText primary={`${Object.values(ret)[0]} : ${Object.values(ret)[1]}`} />
                            </ListItem>
                        </li>
                    ))}
                </List>
            : 
                <p className="text-red-400">
                    {errorText}
                </p>
            }
        </div>
    )
}

export default Projects
