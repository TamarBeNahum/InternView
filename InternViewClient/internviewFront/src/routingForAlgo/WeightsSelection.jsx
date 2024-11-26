import React, { useState, useEffect } from "react";
import { Container, Typography, TextField, Box, Button } from "@mui/material";
import Swal from "sweetalert2";
import { Update_Algorithm_Weights, Get_Algorithm_Weights } from "../FFCompos/Server.jsx"; // Adjust the import path if needed

export default function WeightsSelection() {
  const [weights, setWeights] = useState({
    difficulty: 0,
    year: 0,
    skill: 0,
    syllabus: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch weights from the server when the component mounts
    Get_Algorithm_Weights()
      .then((weights) => {
        setWeights({
          difficulty: weights.yearDifficulty,
          year: weights.yearWeight,
          skill: weights.skills,
          syllabus: weights.syllabusWeight,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "שגיאה בקבלת המשקלים",
          text: error.message,
        });
      });
  }, []);

  const handleSubmit = () => {
    const total = weights.difficulty + weights.year + weights.skill + weights.syllabus;
    if (total !== 100) {
      setErrorMessage("הסכום הכולל של הערכים חייב להיות 100");
    } else {
      setErrorMessage("");
      const updatedWeights = {
        Skills: weights.skill,
        YearWeight: weights.year,
        YearDifficulty: weights.difficulty,
        SyllabusWeight: weights.syllabus,
      };

      Update_Algorithm_Weights(updatedWeights)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "!המשקלים עודכנו בהצלחה",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "שגיאה בעדכון המשקלים",
            text: error.message,
          });
        });
    }
  };

  const handleWeightChange = (field, value) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 2 }}>
      <Typography variant="h6" fontWeight={"bold"}  sx={{ mb: 2 }} gutterBottom>
        בחירת משקלים לשיבוץ
      </Typography>
      .לפניך רמת החשיבות הניתנת לכל אחת מהתכונות באלגוריתם השיבוץ (גבוהה יותר = חשובה יותר)
      <br></br>
       .ביכולתך לבחור את רמת החשיבות לכל תכונה בהתאם להעדפותיך
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <TextField
          dir="rtl"
          label="רמת קושי של הניתוח"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          sx={{ width: '80%', maxWidth: '350px' }} // Set specific width
          margin="normal"
          value={weights.difficulty}
          onChange={(e) => handleWeightChange("difficulty", Number(e.target.value))}
        />
        <TextField
          dir="rtl"
          label="שנת ההתמחות"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          sx={{ width: '80%', maxWidth: '350px' }} // Set specific width
          margin="normal"
          value={weights.year}
          onChange={(e) => handleWeightChange("year", Number(e.target.value))}
        />
        <TextField
          dir="rtl"
          label="מיומנות של המתמחה"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          sx={{ width: '80%', maxWidth: '350px' }} // Set specific width
          margin="normal"
          value={weights.skill}
          onChange={(e) => handleWeightChange("skill", Number(e.target.value))}
        />
        <TextField
          dir="rtl"
          label="סילבוס פר ניתוח"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          sx={{ width: '80%', maxWidth: '350px' }} // Set specific width
          margin="normal"
          value={weights.syllabus}
          onChange={(e) => handleWeightChange("syllabus", Number(e.target.value))}
        />
        {errorMessage && (
          <Typography color="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Typography>
        )}
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#1976d2",
            color: "white",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          onClick={handleSubmit}
        >
          אישור
        </Button>
      </Box>
    </Container>
  );
}
