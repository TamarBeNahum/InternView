import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import QueueIcon from '@mui/icons-material/Queue';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { GetInterns, UpdateInternInSurgery } from './server_forOldAlgo.jsx';
import Swal from 'sweetalert2';
//-------------------------------
//-אלגוריתם של שיבוץ מתמחה פר ניתוח
//מציגה טבלה של מתמחים ברפואה ומאפשרת שיבוץ שלהם לתפקידים שונים בניתוחים בהתאם לנתונים שהתקבלו מהשרת
//------------------------------
export default function AlgoResults({ surgeryID, refreshComponents }) {

    const [interns, setInterns] = useState([]); // מערך לשמירת הנתונים על המתמחים
    const [openDialogId, setOpenDialogId] = useState(null); // מזהה לניהול הדיאלוג הפתוח

    let scores = ['90%', '85%', '70%', '60%', '50%'] // ציונים דמו לדוגמה

    useEffect(() => {
        let interns = [];
        GetInterns()
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    let intern = data[i];
                    let internObj = {
                        id: intern.id,
                        fullName: `${intern.first_name} ${intern.last_name}`,
                        year: intern.interns_year,
                        rating: intern.interns_rating,
                        score: scores[i] // השמת ציון בהתאם לסדר
                    }
                    interns.push(internObj);
                }
                setInterns(interns); // עדכון המערך במידע שהתקבל
            })
            .catch(error => {
                console.error("Error in GetInterns: ", error);
            });
    }, []);

    // פתיחת הדיאלוג למתמחה מסוים
    const handleOpenDialog = (id) => { setOpenDialogId(id); };
    // סגירת הדיאלוג הפתוח
    const handleCloseDialog = () => { setOpenDialogId(null); };
    // טיפול בבחירת מתמחה לתפקיד מסוים בניתוח
    const handleChooseDialog = (intern_role, intern) => {
        let matchObj = {
            Surgery_id: surgeryID,
            Intern_id: intern.id,
            Intern_role: intern_role,
            newMatch: true //WE DROP IT FROM THE [Intern_in_surgery] TABLE AFTER MODIFY THE ALGO
        }
        UpdateInternInSurgery(matchObj)
            .then(data => {
                if (data) {
                    refreshComponents(); // רענון הנתונים בקומפוננטת האב
                    Swal.fire({
                        text: "שיבוץ בוצע בהצלחה",
                        icon: "success",
                        confirmButtonText: "OK",
                    })
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        text: 'המתמחה כבר משובץ לאותו התפקיד',
                    });
                }
            })
            .catch(error => {
                console.error("Error in UpdateInternInSurgery: ", error);
            });
        setOpenDialogId(null);// סגירת הדיאלוג לאחר הטיפול בפעולה
    };

    return (
        <TableContainer component={Paper} dir="rtl" sx={{ marginLeft: 7, marginX: 7, mb: 2, width: 'auto' }}>
            <Table sx={{ minWidth: 500 }}>
                <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{ width: '10%' }}>שם המתמחה</TableCell>
                        <TableCell align="center" sx={{ width: '10%' }}>שנת התמחות</TableCell>
                        <TableCell align="center" sx={{ width: '10%' }}>דירוג מתמחה</TableCell>
                        <TableCell align="center" sx={{ width: '10%' }}>ציון תיאום</TableCell>
                        <TableCell align="center" sx={{ width: '10%' }}>תאם לניתוח</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {interns.map(intern => (
                        <TableRow key={intern.id}>
                            <TableCell align="center" sx={{ width: '10%' }}>{intern.fullName}</TableCell>
                            <TableCell align="center" sx={{ width: '10%' }}>{intern.year}</TableCell>
                            <TableCell align="center" sx={{ width: '10%' }}>{intern.rating}</TableCell>
                            <TableCell align="center" sx={{ width: '10%' }}>{intern.score}</TableCell>
                            <TableCell align="center" sx={{ width: '10%' }}>
                                <Button onClick={() => handleOpenDialog(intern.id)} size="small">
                                    <QueueIcon />
                                </Button>
                                {openDialogId === intern.id && (
                                    <Dialog
                                        open={openDialogId === intern.id}
                                        onClose={handleCloseDialog}
                                    >
                                        <DialogTitle dir="rtl">{"שיבוץ מתמחה לניתוח"}</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText dir="rtl" id="alert-dialog-description">
                                                לאיזה תפקיד לשבץ את {intern.fullName} ?
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => handleChooseDialog('עוזר שני', intern)}>עוזר שני </Button>
                                            <Button onClick={() => handleChooseDialog('עוזר ראשון', intern)}>עוזר ראשון </Button>
                                            <Button onClick={() => handleChooseDialog('מנתח ראשי', intern)}>מנתח ראשי</Button>

                                        </DialogActions>
                                    </Dialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer >
    );
}
