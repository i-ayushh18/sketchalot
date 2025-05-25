import { useEffect,useState } from "react";
import {WS_URL} from "../app/config"

export function useSocket(){
    const[loading,setLoading]=useState(true);
    const[socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNiZTNhYy0yMzI3LTQ2NzUtYjBhMS05MzkxM2E5YzhmMmQiLCJpYXQiOjE3NDM3NjkyMDF9.mTgnM70Y1iP-qPiq6fi_3Bqum1xGaSAoTJYeu78VjQY`);
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
