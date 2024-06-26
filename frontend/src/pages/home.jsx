import React, { useEffect, useState, useSyncExternalStore } from "react";
import axios from "axios";
import Loader from "../component/loader";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ChevronLeft, SendHorizontal } from "lucide-react"
export default function Home() {
    const [load, setLoad] = useState(false);
    const [tab, setTab] = useState("profile");
    const [userdata, setUserdata] = useState(null);
    const [val, setVal] = useState(null);
    const [messtype, setMesstype] = useState(null);
    const [bot, setBot] = useState(null);
    const [aires, setAires] = useState(null);
    const [showlist, setShowlist] = useState(-1);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = (search) => {
        return new URLSearchParams(search);
    };

    useEffect(() => {
        const params = queryParams(location.search);
        const type = params.get('type');
        setMesstype(type)

        if (type === 'outlook') {
            const fetch = async () => {
                const data = await axios.get("http://localhost:8000/outlook/profile")
                console.log(data)
                setUserdata(data);
                setLoad(true)
            }
            setTimeout(() => {
                fetch();
            }, 3000);
        }
        else if (type == "gmail") {
            const fetch = async () => {
                const data = await axios.get("http://localhost:8000/gmail/profile")
                console.log(data)
                setUserdata(data);
                setLoad(true)
            }
            setTimeout(() => {
                fetch();
            }, 3000);
        }
    }, [location.search]);

    useEffect(() => {
        if (tab === "mail" && messtype === "outlook") {
            const fetch = async () => {
                const data = await axios.get("http://localhost:8000/outlook/all-Mails/:email");
                setVal(data.data);
                console.log(data.data)
            }
            fetch()
        }
        else if (tab === "mail" && messtype === "gmail") {
            const fetch = async () => {
                const data = await axios.get("http://localhost:8000/gmail/all-Mails");
                setVal(data.data);
                console.log(data.data)
            }
            fetch()
        }
    }, [tab])

    const handleMailClick = (data) => {
        setShowlist(data);
        setBot(true);
        console.log(val)

        const fetchAIResponse = async () => {
            try {
                const response = await axios.post("http://localhost:8000/gmail/ai", {
                    from: val[data].senderName,
                    to: "me",
                    label: "interested in product",
                    messageId: val[data].id,
                    message: val[data].message,
                    subject: val[data].subject,
                });
                setAires(response.data);
                console.log("AI response:", response);
            } catch (error) {
                console.error("Error fetching AI response:", error);
            }
        };

        fetchAIResponse();
    };


    useEffect(() => {
        if (bot === true) {
            console.log("using openai")
        }
    }, [bot])

    const handleSubmit = async()=>{
        console.log(val[showlist])
        const response = axios.post("http://localhost:8000/gmail/send",{emailData:aires.emailData,from: val[showlist].id,});
        console.log(response);
    }

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
                            <User onClick={() => { setTab("profile"); setBot(false) }} className="text-white hover:cursor-pointer size-12" />
                            <Mail onClick={() => { setTab("mail") }} className="text-white hover:cursor-pointer size-12" />
                            <LogOut onClick={() => { navigate('/') }} className="text-white hover:cursor-pointer mt-auto size-12" />
                        </motion.div>
                        <div className="w-[94%]">
                            {
                                tab === "profile" ? (
                                    <div className="flex h-full justify-center items-center">
                                        {
                                            messtype === "gmail" ? (
                                                <div>
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 1 }}
                                                        className="flex flex-col gap-4">
                                                        <p className="text-white text-center text-5xl font-semibold">Successfully Registered With  </p>
                                                        <br />
                                                        {userdata && <span className="text-[#7578ff] text-5xl font-bold uppercase">{userdata.data.emailAddress}</span>}
                                                        <span>!</span>
                                                    </motion.div>
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 1 }}
                                                    className="flex flex-row gap-6">
                                                    <p className="text-white text-5xl font-semibold">HELLO  </p>
                                                    {userdata && <span className="text-[#7578ff] text-5xl font-bold uppercase">{userdata.data.displayName}</span>}
                                                    <span>!</span>
                                                </motion.div>
                                            )
                                        }
                                    </div>
                                ) : (
                                    <div className="flex h-full sm:flex-row flex-col overflow-y-scroll">
                                        <div className="sm:w-[50%] w-full flex items-center justify-center h-full">
                                            {
                                                showlist === -1 ? (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 1 }}
                                                        className="w-[85%] h-[90%] overflow-y-scroll shadow-cards p-8 gap-4 flex flex-col rounded-xl">
                                                        <p className="text-center text-3xl font-semibold text-white">
                                                            Your Mail's
                                                        </p>
                                                        {
                                                            val && val.map((mail, index) => (
                                                                <motion.div
                                                                    key={mail.id}
                                                                    initial={{ x: 1000 }}
                                                                    animate={{ x: 0 }}
                                                                    transition={{ duration: 0.3, delay: 0.2 * index }}
                                                                    onClick={() => { handleMailClick(index) }}
                                                                    className="bg-[#0d0f11] hover:border-blue-400 hover:border p-6 rounded-lg flex flex-col shadow-md hover:shadow-lg cursor-pointer"
                                                                >
                                                                    <p className="text-white text-xl font-bold">{mail.senderName}</p>
                                                                    <p className="text-[#909296] font-semibold">{mail.subject}</p>
                                                                </motion.div>
                                                            ))
                                                        }

                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 1 }}
                                                        className="w-[85%] h-[90%] overflow-y-scroll shadow-cards p-8 gap-4 flex flex-col rounded-xl">
                                                        <div className="flex flex-row">
                                                            <ChevronLeft onClick={() => { setShowlist(-1) }} className="text-white mr-auto hover:cursor-pointer" />
                                                            <p className="text-center text-3xl font-semibold text-white">
                                                                {val[showlist].senderName}
                                                            </p>
                                                        </div>
                                                        <p className="text-[#909296] font-semibold text-xl mt-12">
                                                            {val[showlist].subject}
                                                        </p>
                                                        <p className="text-white font-semibold text-2xl mt-12">
                                                            {val[showlist].message}
                                                        </p>

                                                    </motion.div>
                                                )
                                            }
                                        </div>
                                        <div className="sm:w-[50%] w-full flex items-center justify-center h-full">
                                            {
                                                bot &&
                                                <AnimatePresence>
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{opacity:0}}
                                                        transition={{ duration: 1 }}
                                                        className="w-[85%]  h-[90%] overflow-y-scroll shadow-cards p-8 gap-4 flex flex-col items-center rounded-xl">
                                                        {
                                                            aires ? (
                                                                // <div dangerouslySetInnerHTML={aires.html} className="text-white">
                                                                // </div>
                                                                <div className="flex h-full flex-col">
                                                                    <div className="text-3xl text-white font-semibold text-center">
                                                                        AI Generated Response
                                                                    </div>
                                                                    <div className="text-[#909296] pt-12 flex flex-col gap-8 font-semibold">
                                                                        <p className="text-2xl font-semibold text-white">
                                                                            {
                                                                                aires.mailOptions.predictedLabel
                                                                            }
                                                                        </p>
                                                                        <p>
                                                                            {
                                                                                aires.mailOptions.data
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="w-full mt-auto">
                                                                        <button  onClick={()=>handleSubmit()} className="p-4 pl-8 pr-8 gap-4 flex items-end flex-row rounded-full bg-blue-600 text-white font-semibold">
                                                                            Send <span>
                                                                                <SendHorizontal className="text-white" />
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-white">
                                                                    Waiting for GenAI response
                                                                </div>
                                                            )
                                                        }
                                                    </motion.div>
                                                </AnimatePresence>
                                            }
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
        </div >
    )
}