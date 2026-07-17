import React,{useEffect,useState} from "react";
import { supabase } from "../../supabaseClient";

export default function BingoDemo(){
 const [msg,setMsg]=useState("Cargando...");
 useEffect(()=>{(async()=>{
  const {data,error}=await supabase.from("bingo_games")
   .select("*")
   .eq("id","469849c4-105b-47fe-b4a7-aa37ba1f3fc2")
   .maybeSingle();

  if(error){
    setMsg(JSON.stringify(error,null,2));
    return;
  }
  setMsg(JSON.stringify(data,null,2));
 })();},[]);
 return <pre style={{padding:20,whiteSpace:"pre-wrap"}}>{msg}</pre>;
}
