import { useEffect,useState } from "react";
import {WS_URL} from "../app/config"

export function useSocket(){
    const[loading,setLoading]=useState(true);
    const[socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMjViMTI1Yy0wMmI3LTRjOTMtOWVlZi0xN2RiNDcwN2QwNzkiLCJpYXQiOjE3NDg4ODA3Mzl9.4e-unvkNP77SXElC7_BW4bMBFfgBIhrDncPy64EwRn8`);
        ws.onopen=()=>{
            setLoading(false);
            setSocket(ws);
        }
    },[]);
    return {
        socket,
        loading
    }
}
