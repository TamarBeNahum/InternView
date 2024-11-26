import React from "react";
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Avatar,
    Grid
} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

import doctorPic from "/src/Image/doctor_picForCard.png";
import managerPic from "/src/Image/manager_picForCard.png";
import doctorHomePic from '/src/Image/doctorHomePic.png';
import logoHomePic from '/src/Image/InternView.png';
import { useNavigate } from 'react-router-dom';

const images = {
    doctorPic,
    managerPic
};

//-------------------------------------

export default function ManagerOptions() {
    const [formData, setFormData] = React.useState([
        {
            name: "מנהל",
            picName: "managerPic",
            opt: ["צפייה במתמחים והתקדמותם", "שיבוץ מתמחים לניתוחים"],
            route: '/MangerPage'
        },
        {
            name: "מתמחה",
            picName: "doctorPic",
            opt: ["מעקב אחר הסילבוס", "צפייה בניתוחים שבוצעו"],
            route: '/intern'
        }
    ]);

    const navigate = useNavigate();

    function handleCardClick(route) {
        navigate(route);
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start', // Align content to the top
                    pt: 1, // Add padding top to push content down a bit
                }}
            >
                <img
                    src={logoHomePic}
                    alt="Logo"
                    style={{
                        width: 'auto',
                        maxWidth: '200px',
                        height: 'auto',
                        maxHeight: '100px',
                    }}
                />
            </Box>
            <Typography component="h1" variant="h5" sx={{ mb: 4, mt: 5 }}>
                בחירת דרך התחברות
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 2,
                    marginTop: 2,
                }}
            >
                <Grid container spacing={{ xs: 1, md: 3 }} sx={{ direction: 'rtl', justifyContent: 'center' }}>
                    {formData.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card
                                onClick={() => handleCardClick(item.route)}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    backgroundColor: "#fff",
                                    border: "5px solid",
                                    borderRadius: "10px",
                                    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                                    transition: "transform 0.3s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                    margin: '0.4rem',
                                    borderColor: item.name === "מנהל" ? "CornflowerBlue" : "#A7C7E7",
                                }}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                marginBottom: 2,
                                                objectFit: "contain"
                                            }}
                                            src={images[item.picName]}
                                        />
                                    }

                                    sx={{
                                        display: "flex",
                                        flexDirection: "row-reverse",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 0,
                                    }}
                                    titleTypographyProps={{
                                        variant: "h6", // Changed from "subtitle1" to "h6"
                                        fontWeight: "bold",
                                        borderBottom: '2px solid #ccc'
                                    }}
                                    title={item.name}
                                />
                                <CardContent sx={{ paddingTop: 0 }}>
                                    {item.opt.map((option, idx) => (
                                        <Typography key={idx} component="h2" variant="h6" sx={{ mb: 1 }} color="text.secondary" align="center">
                                            {option}
                                        </Typography>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
}
