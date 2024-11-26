import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Container,
  Box,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MenuLogo from "./MenuLogo";
import FloatingChatButton from "./FloatingChatButton";
import Swal from "sweetalert2";
import { AddIntern } from './Server.jsx';

export default function AddInterns() {

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_i: "",
    internId: "",
    InternshipDate: "",
    password: "",
    confirmPassword: "",
    rating: "",
    isManager: false,
  });

  const [formErrors, setFormErrors] = useState({
    first_name: false,
    last_name: false,
    email_i: false,
    internId: false,
    InternshipDate: false,
    password: false,
    confirmPassword: false,
    rating: false,
  });

  const handleCancelClick = () => {
    navigate("/MangerPage");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  
    if (name === "email_i") {
      const isValidEmail = validateEmail(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        email_i: !isValidEmail,
      }));
    }

    if (name === "internId") {
      const isValidId = validateId(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        internId: !isValidId,
      }));
    }

    if (name === "InternshipDate") {
      const isValidDate = validateDate(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        InternshipDate: !isValidDate,
      }));
    }
  };

  const validateTextOnly = (value) => {
    return /^[a-zA-Zא-ת ]*$/.test(value) && value !== "";
  };

  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9.+_-]+@gmail\.com$/;
    return regex.test(email);
  }

  function validateId(id) {
    const regex = /^\d{9}$/;
    return regex.test(id);
  }

  function validateDate(date) {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    return selectedDate <= currentDate;
  }

  function validateRating(rating) {
    const ratingNumber = Number(rating);
    return ratingNumber >= 1 && ratingNumber <= 10;
  }

  function validatePassword(pass) {
    const uppercaseLetter = /[A-Z]/;
    const digit = /[0-9]/;
    return (
      uppercaseLetter.test(pass) && digit.test(pass)
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const isFirstNameValid = validateTextOnly(formData.first_name);
    const isLastNameValid = validateTextOnly(formData.last_name);
    const isEmailIValid = validateEmail(formData.email_i);
    const isIdValid = validateId(formData.internId);
    const isDateValid = validateDate(formData.InternshipDate);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid =
      formData.password === formData.confirmPassword;
    const isRatingValid = formData.rating !== "";

    setFormErrors({
      first_name: !isFirstNameValid,
      last_name: !isLastNameValid,
      email_i: !isEmailIValid,
      internId: !isIdValid,
      InternshipDate: !isDateValid,
      password: !isPasswordValid,
      confirmPassword: !isConfirmPasswordValid,
      rating: !isRatingValid,
    });

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailIValid &&
      isIdValid &&
      isDateValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      isRatingValid
    ) {
      AddIntern(formData).then((data) => {      
        Swal.fire({
          icon: 'success',
          title: 'הוספת המתמחה הצליחה!',
          text: 'המתמחה נוסף בהצלחה.',
        })
      }).catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'הוספת המתמחה נכשלה',
          text: 'תעודת זהות כבר קיימת במערכת.',
        });
      });
    }
  };

  return (
    <>
      <MenuLogo role="manager"/>
      <Container component="main" dir="rtl">
       
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={8} lg={6}>
            <Card sx={{ mt: 9, width: "100%", mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    marginTop: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <PersonAddAlt1Icon
                      sx={{
                        fontSize: "inherit",
                        width: "100px",
                        height: "40px",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  component="h1"
                  variant="h6"
                  fontWeight="bold"
                  textAlign="center"
                >
                  הוספת מתמחה
                </Typography>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 3 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="internId"
                        id="internId"
                        label="תעודת זהות"
                        autoComplete="תעודת זהות"
                        value={formData.internId}
                        onChange={handleChange}
                        error={formErrors.internId}
                        helperText={
                          formErrors.internId
                            ? "תעודת זהות חייבת להכיל 9 ספרות"
                            : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="email_i"
                        id="email"
                        label="כתובת אימייל"
                        autoComplete="כתובת אימייל"
                        value={formData.email_i}
                        onChange={handleChange}
                        error={formErrors.email_i}
                        helperText={
                          formErrors.email_i ? "אנא הזן כתובת אימייל תקינה" : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        name="first_name"
                        id="first_name"
                        label="שם פרטי"
                        autoComplete="given-name"
                        value={formData.first_name}
                        onChange={handleChange}
                        error={formErrors.first_name}
                        helperText={
                          formErrors.first_name ? "יכול להכיל רק אותיות" : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        name="last_name"
                        id="last_name"
                        label="שם משפחה"
                        autoComplete="family-name"
                        value={formData.last_name}
                        onChange={handleChange}
                        error={formErrors.last_name}
                        helperText={
                          formErrors.last_name ? "יכול להכיל רק אותיות" : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="date"
                        name="InternshipDate"
                        id="InternshipDate"
                        label="שנת התמחות"
                        autoComplete="given-name"
                        value={formData.InternshipDate}
                        onChange={handleChange}
                        error={formErrors.InternshipDate}
                        helperText={
                          formErrors.InternshipDate
                            ? "התאריך לא יכול להיות גדול מהתאריך הנוכחי"
                            : ""
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        name="password"
                        id="password"
                        label="סיסמה"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                        helperText={
                          formErrors.password ? "הסיסמה חייבת להכיל לפחות אות גדולה וספרות" : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12} dir="rtl">
                      <TextField
                        fullWidth
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        label="חזור על הסיסמה"
                        autoComplete="current-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={formErrors.confirmPassword}
                        helperText={
                          formErrors.confirmPassword
                            ? "הסיסמאות חייבות להיות זהות"
                            : ""
                        }
                        variant="standard"
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="standard">
                          <InputLabel id="rating-label">דירוג מתמחה</InputLabel>
                          <Select
                            labelId="rating-label"
                            id="rating"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            error={formErrors.rating}
                          >
                            {Array.from({ length: 10 }, (_, i) => (
                              <MenuItem key={i + 1} value={i + 1}>
                                {i + 1}
                              </MenuItem>
                            ))}
                          </Select>
                          {formErrors.rating && (
                            <Typography color="error" variant="caption">
                              אנא הזן דירוג תקין בין 1 ל-10
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isManager}
                              onChange={handleChange}
                              name="isManager"
                              color="primary"
                            />
                          }
                          label="האם מנהל"
                          sx={{ ml: 3 }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <CardActions>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2,
                        ml: 2,
                      }}
                    >
                      הוספה
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleCancelClick}
                      variant="contained"
                      sx={{
                        mt: 2,
                        backgroundColor: "CornflowerBlue",
                        color: "white",
                        "&:hover": { backgroundColor: "DeepSkyBlue" },
                      }}
                    >
                      חזרה לדף הראשי
                    </Button>
                  </CardActions>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <FloatingChatButton />
    </>
  );
}
