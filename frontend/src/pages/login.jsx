import React from "react";
import { motion } from "framer-motion";
import axios from "axios";
export default function Login(){

    const handleoutlooklogin=async()=>{
        window.location.href="http://localhost:8000/outlook/signin"
    }
    const handlegooglelogin=async()=>{
        window.location.href="http://localhost:8000/gmail/signin"
    }
    return(
        <div className=" w-screen h-screen bg-black">
            <motion.div
            className="text-8xl h-[50%] font-semibold flex flex-col justify-end pb-20 items-center text-white"
            initial={{opacity:0,y:-100}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.7}}
            >
                Get Started With
            </motion.div>
            <div className="w-full flex flex-row justify-center gap-8 h-[50%]">
                <motion.button 
                onClick={()=>{handlegooglelogin()}}
                initial={{opacity:0,x:-200}}
                animate={{opacity:1,x:0}}
                transition={{duration:0.6}}
                 className="bg-[#4535c8] rounded-lg w-60 text-white font-semibold h-20">Google</motion.button>
                <motion.button 
                onClick={()=>{handleoutlooklogin()}}
                initial={{opacity:0,x:200}}
                animate={{opacity:1,x:0}}
                transition={{duration:0.6}}
                 className="bg-[#4535c8] rounded-lg w-60 text-white font-semibold h-20">Outlook</motion.button>
            </div>
        </div>
    )
}