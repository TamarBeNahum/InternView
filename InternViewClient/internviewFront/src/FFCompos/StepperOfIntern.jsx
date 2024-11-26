import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  StepIcon,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // For completed steps
import "../App.css";
import doctorPic from "/src/Image/doctorForStepper.png";

// Map Hebrew years to step indices
const yearToStepIndex = {
  א: 5,
  ב: 4,
  ג: 3,
  ד: 2,
  ה: 1,
  ו: 0,
};

function getSteps() {
  return ["שנה ו", "שנה ה", "שנה ד", "שנה ג", "שנה ב", "שנה א"];
}

// Custom step icon component
function StepIconComponent({ active, completed, icon }) {
  if (completed) {
    return <CheckCircleIcon style={{ color: "green" }} />;
  }
  if (active) {
    return (
      <div style={{ position: "relative" }}>
        <img
          src={doctorPic}
          alt="Doctor Icon"
          style={{
            position: "absolute",
            top: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "57px",
            height: "52px",
          }}
        />
        <StepIcon icon={icon} />
      </div>
    );
  }
  return <StepIcon icon={icon} />;
}

export default function CustomStepper() {
  const storedDate = sessionStorage.getItem("currentUserYear");
  const currentDate = new Date();
  let currentUserYear = 1;

  if (storedDate) {
    const storedYear = new Date(JSON.parse(storedDate)).getFullYear();
    const currentYear = currentDate.getFullYear();
    const yearDifference = currentYear - storedYear + 1; // Adding 1 to account for the first year as well
    currentUserYear = Math.min(yearDifference, 6);
  }

  const steps = getSteps();
  const activeStep = 6 - currentUserYear; // Adjusting to map the year difference to the step index
  let counter = steps.length;

  return (
    <>
      <Typography
        variant="h6"
        component="h3"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 10,
          mt: 11,
        }}
      >
        צפייה בהתקדמות שלך
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step
              key={label}
              completed={index > activeStep - 1}
              className="slide-in"
              style={{ animationDelay: `${index * 0.2}s` }} // Delay animation based on index
            >
              <StepLabel
                StepIconComponent={(props) => (
                  <StepIconComponent
                    active={index === activeStep}
                    completed={index > activeStep}
                    icon={counter--}
                  />
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </>
  );
}
