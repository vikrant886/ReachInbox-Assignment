import React, { useEffect, useState, useSyncExternalStore } from "react";
import axios from "axios";
import Loader from "../component/loader";
import { motion } from "framer-motion";
import { Mail, LogOut, User } from "lucide-react";
export default function Home() {
    const [load, setLoad] = useState(false);
    const [tab, setTab] = useState("profile");
    const [userdata, setUserdata] = useState(null);
    const [val, setVal] = useState(null);
    useEffect(() => {
        const fetch = async () => {
            const data = await axios.get("http://localhost:8000/outlook/profile")
            console.log(data)
            setUserdata(data);
            setLoad(true)
        }
        setTimeout(() => {
            fetch();
        }, 3000);
    }, [])
    useEffect(() => {
        if (tab === "mail") {
            const fetch = async () => {
                const data = await axios.get("http://localhost:8000/outlook//all-Mails/:email");
                setVal(data.data);
                console.log(data.data)
            }
            fetch()
        }
    }, [tab])
    return (
        <div className="w-screen h-screen bg-black">
            {
                load ? (
                    <motion.div className="w-full flex flex-row h-full">
                        <motion.div
                            initial={{ opacity: 0, x: -200 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: .5 }}
                            className="w-[6%] flex justify-start gap-8 pb-12 pt-12  items-center flex-col bg-[#0d0f11] shadow-2xl shadow-[#1c3257]">
                            <User onClick={() => { setTab("profile") }} className="text-white hover:cursor-pointer size-12" />
                            <Mail onClick={() => { setTab("mail") }} className="text-white hover:cursor-pointer size-12" />
                            <LogOut className="text-white hover:cursor-pointer mt-auto size-12" />
                        </motion.div>
                        <div className="w-[94%]">
                            {
                                tab === "profile" ? (
                                    <div className="flex h-full justify-center items-center">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 1 }}
                                            className="flex flex-row gap-6">
                                            <p className="text-white text-5xl font-semibold">HELLO  </p>
                                            {userdata && <span className="text-[#7578ff] text-5xl font-bold uppercase">{userdata.data.displayName}</span>}
                                            <span>!</span>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-row">
                                        <div className="w-[50%] flex items-center justify-center h-full">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1 }}
                                                className="w-[85%] h-[90%] overflow-hidden shadow-cards p-8 gap-4 flex flex-col rounded-xl">
                                                <p className="text-center text-3xl font-semibold text-white">
                                                    Your Mail's
                                                </p>
                                                {
                                                    val && val.map((mail, index) => (
                                                        <motion.div
                                                            key={mail.id}
                                                            initial={{ x: 1000 }}
                                                            animate={{ x: 0 }}
                                                            transition={{ duration: 0.4, delay: 0.2 * index }}
                                                            whileHover={{ scale: 1.05 }} 
                                                            className="bg-[#0d0f11] p-6 rounded-lg flex flex-col shadow-md hover:shadow-lg cursor-pointer"
                                                        >
                                                            <p className="text-white text-xl font-bold">{mail.senderName}</p>
                                                            <p className="text-[#909296] font-semibold">{mail.subject}</p>
                                                        </motion.div>
                                                    ))
                                                }

                                            </motion.div>
                                        </div>
                                        <div></div>
                                    </div>
                                )
                            }
                        </div>
                    </motion.div>
                ) : (
                    <div className=" flex justify-center items-center">
                        <Loader />
                    </div>
                )
            }
        </div>
    )
}