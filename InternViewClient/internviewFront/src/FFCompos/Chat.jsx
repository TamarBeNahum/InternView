import * as React from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Avatar,
    Grid,
    Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { database } from '../firebase'; // the data from Firebase Realtime Database
import { ref, onValue, push, off, update } from 'firebase/database';
import DoneAllIcon from '@mui/icons-material/DoneAll';


const ChatUI = ({ user, onBack }) => {


    const internID = JSON.parse(sessionStorage.getItem('currentUserID'));
    const [chatMessages, setChatMessages] = useState([]);
    // GET the DATA from Firebase
    useEffect(() => {
        // Create a reference to the 'messages/' path in the Firebase Realtime Database
        const messagesRef = ref(database, 'messages/');
        // Listen for changes at the 'messages/' path with onValue method.
        onValue(messagesRef, (snapshot) => {
            //gets the current data from the Firebase database's 'messages/' section.
            const data = snapshot.val(); // קבלת הנתונים העדכניים
            const loadedMessages = [];
            for (const key in data) {
                let message = data[key];
                // messages will be marked as read when loaded to the user
                if (message.from_id === user.Intern_id && message.to_id === internID && !message.read) {
                    const messageRef = ref(database, `messages/${key}`);
                    update(messageRef, { read: true });// עדכון ההודעה כנקראה
                }
                loadedMessages.push({ messages_id: key, ...message });
            }
            // Filter the messages to include only those that are between the current user and the chat partner.
            // סינון ההודעות להודעות הרלוונטיות בין המשתמשים
            const filteredMessages = loadedMessages.filter(message =>
                (message.from_id === internID && message.to_id === user.Intern_id) ||
                (message.from_id === user.Intern_id && message.to_id === internID)
            );

            setChatMessages(filteredMessages);

        });

        // Detach listener when the component unmounts
        return () => off(messagesRef);// ניתוק המאזין בעת פריקת הרכיב
    }, []);

    //PUT new messages into Firebase Realtime Database
    // שליחת הודעה חדשה
    const handleSend = () => {
        if (input.trim() !== "") {
            // Create a new reference for a message in the 'messages/' path of the Firebase Realtime Database.
            const newMessageRef = ref(database, 'messages/');

            const message = {
                read: false,
                from_id: internID,
                to_id: user.Intern_id,
                content: input.trim(),
                messages_date: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString().slice(0, -5)
            };
            // Push the new message object to the Firebase Realtime Database.
            push(newMessageRef, message);
            setInput("");
        }
    };

    const EndRef = useRef(null);// ref לסקרול אוטומטי לתחתית הצ'אט
    const messagesEndRef = useRef(null);  // Ref for the last message

    useEffect(() => {
        EndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        //messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }, [chatMessages]);

    const [input, setInput] = useState(""); // ערך הקלט לשליחת הודעות

    // פורמט תאריך לתצוגה
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }


    return (
        <Box
            sx={{
                height: "60vh", // Keeping the height consistent
                display: "flex",
                flexDirection: "column",
                bgcolor: "white",
            }}
        >

            <Box ref={messagesEndRef} sx={{ flexGrow: 1, overflowX: "hidden", overflowY: "auto", p: 2 }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "sticky",
                    top: -16,
                    zIndex: 2,
                    justifyContent: "space-between",
                    p: 0,
                    backgroundColor: 'white',
                    mb: 2,
                    borderBottom: '1px solid  #E0E0E0'
                }}>

                    <IconButton onClick={onBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    {/* Title with the selected user's name */}
                    <Typography variant="h6">
                        {`${user.First_name} ${user.Last_name}`}  {/* Assuming 'user' is the name of the user */}
                    </Typography>
                    {/* Placeholder for any other element you want to keep on the right side */}
                    <Box sx={{ width: 48 }} /> {/* This box has the same width as IconButton to balance the title */}
                </Box>
                {chatMessages.map((message, index) => {
                    const prevDate = index > 0 ? chatMessages[index - 1].messages_date.slice(0, 10) : null;
                    const currentDate = message.messages_date.slice(0, 10);

                    // Check if the day has changed (or if its the first message)
                    const showDateHeader = prevDate !== currentDate;

                    return (
                        <React.Fragment key={message.messages_id}>
                            {showDateHeader && (
                                <Typography sx={{ color: 'gray', textAlign: 'center', mb: 2 }}>
                                    {formatDate(message.messages_date)}
                                </Typography>
                            )}
                            <Message key={message.messages_id} message={message} user={user} />
                        </React.Fragment>
                    );
                })}
                {/* Scroll to this element */}
                <div ref={EndRef} />
            </Box>
            <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <TextField
                            autoFocus
                            dir="rtl"
                            size="small"
                            fullWidth
                            variant="outlined"
                            value={input}
                            onChange={() => { setInput(event.target.value) }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') { handleSend(); }
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSend}
                        >
                            שלח
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const Message = ({ message, user }) => {
    const internID = JSON.parse(sessionStorage.getItem('currentUserID'));
    const isPartner = message.from_id != internID;
    const messageReadColor = (message.read) ? '#2196f3' : '#9e9e9e'; // Grey for read, blue for unread

    return (
        <Box

            sx={{
                display: "flex",
                justifyContent: isPartner ? "flex-start" : "flex-end",
                mb: 2,
            }}
        >
            <Box

                sx={{
                    display: "flex",
                    flexDirection: isPartner ? "row" : "row-reverse",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ width: "3vh", fontSize: '13px', height: "3vh", bgcolor: isPartner ? "#99cfe0" : "#ade6bb", border: isPartner ? '1px solid #72bcd4' : '1px solid #72d48a' }}>
                    {isPartner ? `${user.First_name[0]}${user.Last_name[0]}` : "U"}
                </Avatar>
                <Paper
                    dir="rtl"
                    variant="outlined"
                    sx={{
                        p: 0.6,
                        pl: isPartner ? 1 : 0.6,
                        mb: 0.1,
                        mt: -1,
                        ml: isPartner ? 0.5 : 0,
                        mr: isPartner ? 0 : 0.5,
                        backgroundColor: isPartner ? "#99cfe0" : "#ade6bb",
                        borderRadius: isPartner ? "15px 15px 15px 5px" : "15px 15px 5px 15px",
                        width: 'auto', // Ensures that the paper element fits its content
                        maxWidth: 'calc(100% - 1rem)', // Prevents the paper from overflowing the parent box
                        wordBreak: 'break-word', // Ensures that long words do not cause overflow
                    }}
                >
                    <Typography variant="body1" sx={{ mb: '-5px' }}>{message.content}</Typography>
                    <div style={{ marginBottom: '-6px', display: 'flex', height: '20px' }}>

                        {/* Icon indicating the read status */}
                        {message.from_id == internID ?
                            <DoneAllIcon sx={{ color: messageReadColor, ml: 0.3, mt: 0.3, height: 17 }} /> : ''
                        }
                        <Typography variant="" sx={{ color: 'grey', fontSize: '13px', ml: 1, mr: isPartner ? 1 : 0 }}>
                            {message.messages_date.slice(11, 16)}
                        </Typography>


                    </div>

                </Paper>
            </Box>
        </Box>
    );
};

export default ChatUI;