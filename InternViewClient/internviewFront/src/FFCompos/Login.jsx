import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Swal from 'sweetalert2';
import doctorHomePic from '/src/Image/doctorHomePic.png'
import logoHomePic from '/src/Image/InternView.png';
import { api, updateInternPassword } from './Server';
import emailjs from 'emailjs-com';
import { LogInIntern } from './Server';
//--------------------------------------------------

export default function Login() {
    //מעבר בין דפים דרך הראוטר
    const navigate = useNavigate();

    //צאק בוקס של צפייה בסיסמא - useState
    const [showPassword, setShowPassword] = React.useState(false);
    const [tempPassDialog, setTempPassDialog] = React.useState(false);

    // אובייקט של הטופס - useState 
    const [formData, setFormData] = React.useState({
        internId: '',
        password: '',
    });

    //שליחת אימייל- useState
    const [emailIntern, setEmailIntern] = React.useState("")

    // יצירת סיסמא חדשה- useState
    const [newPassword, setNewPassword] = React.useState("")

    //משתנה בוליאני שמתעדכן כדי לבדוק אם הסיסמה הזמנית שהוזנה על ידי 
    //המשתמש תואמת למספר הרנדומלי שנשלח אליו.
    const [tempPassCorrect, setTempPassCorrect] = React.useState(false)

    //מחזיק את הסיסמה הזמנית שהמשתמש צריך
    // להזין כדי לאשר את זהותו בטרם יוכל להגדיר סיסמה חדשה
    const [tempPass, setTempPass] = React.useState("")

    //משמש לצורך בדיקה של הסיסמה הזמנית
    React.useEffect(() => {
        setTempPassCorrect(Number(number) === Number(tempPass))
    }, [tempPass])

    // אובייקט של שגיאות הטופס - useState 
    const [formErrors, setFormErrors] = React.useState({
        internId: false,
        password: false,
    });

    // open the dialog-  useState
    const [open, setOpen] = React.useState(false);

    //useState- פונקציה רנדומלית שמגרילה מספרים
    const [number, setNumber] = React.useState();


    // פונקציה המטפלת בצ'אק בוקס של הסיסמא - בכל לחיצה נשנה מאמת לשקר ולהפך
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    //פונקציה הבודקת את הולידציה של שם משתמש
    function validateInternId(internId) {
        const regex = /^[0-9]+$/; // תבנית של מספרים בלבד
        // אם המחרוזת עומדת בתנאי התווים של התבנית ואינה מחרוזת ריקה, מחזיר true
        return regex.test(internId) && internId != '';
    }

    //פונקציה הבודקת את הולידציה של הסיסמא
    function validatePassword(password) {
        //בודק שהסיסמא מכילה לפחות אות גדולה אחת ומספר אחד
        const uppercaseLetter = /[A-Z]/;
        const digit = /[0-9]/;
        return (
            uppercaseLetter.test(password) && digit.test(password)
        );
    }

    const handleChange = (event) => {
        //const name = event.target.name  :דרך קיצור לכתוב כמה פעמים   
        const { name, value } = event.target;
        //שמאפיין את כל שדות הטופס (עדכון של האובייקט) useState-שמירת הערך שנכתב בשדה ל  
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        const isInternIdValid = validateInternId(formData.internId);
        const isPasswordValid = validatePassword(formData.password);

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            internId: !isInternIdValid,
            password: !isPasswordValid,
        }));

        if (!isInternIdValid || !isPasswordValid) { return };

        //בדיקה האם המשתמש קיים
        let currentUser;
        LogInIntern(formData.internId, formData.password)
            .then((data) => {
                currentUser = data;
                //console.log("Current user:", currentUser);

                if (currentUser) {
                    // Save the user in sessionStorage if found
                    sessionStorage.setItem('currentUserID', JSON.stringify(currentUser.id));
                    sessionStorage.setItem('currentUserYear', JSON.stringify(currentUser.interns_year));
                    // Show a toast message that the user has logged in successfully
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1000, // Adjust the time as needed
                        timerProgressBar: true,
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Logged in successfully'
                    });
                    // Automatically navigate to '/intern' after the toast message
                    setTimeout(() => {
                        if (currentUser.isManager){
                            navigate('/ManagerOptions');
                         
                        }
                        else {
                            navigate('/intern');
                        }
                    }, 1000); // Match this time with the timer above
                }
            })
            .catch((error) => {
                // The user failed to log in - incorrect username or password
                Swal.fire({
                    icon: 'error',
                    title: 'Login failed',
                    text: 'intern Id or Password is incorrect.',
                });
                console.error("Error logging in:", error);
            });
    }

    // Function to open the dialog
    const handleOpenDialog = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    //פונקציה לאיפוס סיסמא  
    async function handleResetPassword(event) {
        event.preventDefault(); // Prevent form submission page reload

        // Validate the email address before sending it to the server
        if (!validateGmailAddress(emailIntern)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid Gmail address.',
            });
            return;
        }

        const generatedNumber = generateRandomNumber(); // Generate a new random number

        //Check if Email is a valid email that exist
        const response = await fetch(`${api}Interns/checkEmailIntern/${emailIntern}`);

        if (!response.ok) {  // Check if the HTTP response status code is successful
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        handleClose();  // Close the dialog 
        if (data == 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `This User email do not exist: ${emailIntern}`,
            });
        }
        if (data == 1) {
            emailjs.send('service_riczz6e', 'template_ysrygc8', { to_email: emailIntern, pass: generatedNumber }, 'XevYnHw2VwCxgAt_1')
                .then((result) => {
                    setNumber(generatedNumber);
                    setTempPassDialog(true);
                    console.log('Email successfully sent!', result.text);
                }).catch((error) => {
                    console.log('Failed to send email.', error.text);
                })
        }
    };

    // פונקציה לבדיקת תקינות כתובת מייל
    function validateGmailAddress(email) {
        const regex = /^[a-zA-Z0-9.+_-]+@gmail\.com$/;
        return regex.test(email);
    }

    // פונקציה שמגרילה מספר בן 10 ספרות
    function generateRandomNumber() {
        const min = 1000000000;
        const max = 9999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //פונקציה המטפלת בסיסמא החדשה
    function handleNewPassword() {
        // אם המשתנה בוליאני הופך לטרו
        if (tempPassCorrect) {
            //בודקים את הולידציה לסיסמה
            if (validatePassword(newPassword)) {
                //changeUserPassword
                updateInternPassword(emailIntern, newPassword).then((data) => {
                    if (data) {
                        Swal.fire({
                            title: "Success!",
                            text: "פרטיך עודכנו בהצלחה",
                            icon: "success",
                            confirmButtonText: "OK",
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "העדכון נכשל. אנא נסה שוב.",
                            icon: "error",
                            confirmButtonText: "Close",
                        });
                    }
                })
                    .catch((error) => {
                        console.error(error);
                    });
                setTempPassDialog(false)
            }
            else Swal.fire({
                icon: 'error',
                title: 'Password invalid!',
                text: 'Password should contain at least one upper case letter and a digit',
            });
        }
        else Swal.fire({
            icon: 'error',
            title: 'Password invalid!',
            text: 'please enter the temporary password you received in the email we sent you',
        });

    }
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh', // Take at least full height of the viewport
                    justifyContent: 'flex-start', // Align content to the top
                    pt: 1, // Add padding top to push content down a bit
                }}
            >
                <img className="logoImage" src={logoHomePic} alt="Logo" />
                <Avatar sx={{ width: 300, height: 300, mb: 1 }} src={doctorHomePic} />
                <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                    Log in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                autoFocus
                                name="internId"
                                id="internId"
                                label="intern Id"
                                autoComplete="internId"
                                error={formErrors.internId}
                                helperText={formErrors.internId ? 'The ID must contain nine digits.' : ""}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                id="password"
                                label="Password"
                                autoComplete="new-password"
                                error={formErrors.password}
                                helperText={formErrors.password ? "The new password must contain capital letters and numbers" : ''}
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                            />
                        </Grid>
                    </Grid>

                    <FormControlLabel
                        control={<Checkbox checked={showPassword} onChange={handleShowPassword} color="primary" />}
                        label="Show Password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, mb: 2 }}
                    >
                        LogIn
                    </Button>
                    <Button fullWidth variant="text" onClick={handleOpenDialog}>
                        Forgot Password?
                    </Button>
                </Box>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Reset Your Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>To reset your password, please enter your email address here. We will send you reset instructions.</DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setEmailIntern(event.target.value) }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleResetPassword}>Send Temporary Password</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={tempPassDialog} onClose={() => setTempPassDialog(false)}>
                <DialogTitle>Reset Your Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>To reset your password, please enter the temporary password you received in the email we sent you</DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="tempPass"
                        name="tempPass"
                        label="Temporary Password"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setTempPass(event.target.value) }}
                    />
                    {tempPassCorrect &&
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="newPass"
                            name="newPass"
                            label="New Password"
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={(event) => { setNewPassword(event.target.value) }}
                        />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTempPassDialog(false)}>Cancel</Button>
                    <Button onClick={handleNewPassword}>Reset Password</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}


