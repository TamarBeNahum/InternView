import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Button, Container } from '@mui/material';
import RecentSurgeries from '../FFCompos/RecentSurgeries';
import FullSyllabus from '../FFCompos/FullSyllabus';
import MenuLogo from '../FFCompos/MenuLogo';
import StepperOfIntern from './StepperOfIntern';
import TableChartIcon from '@mui/icons-material/TableChart';
import DomainVerificationIcon from '@mui/icons-material/DomainVerification';
import { GetInternByID } from './Server.jsx';
import FloatingChatButton from './FloatingChatButton';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
export default function InternPage() {

  // משתנה מצב לאחסון נתוני המשתמש הנוכחי
  const [currentUser, setCurrentUser] = useState(null);

  // Hook לניווט תוכניתי בין דפים
  const navigate = useNavigate();

  useEffect(() => {
    //session storage- שליפת מזהה המתמחה מה
    const internID = JSON.parse(sessionStorage.getItem('currentUserID'));

    // קריאה לפונקציה GetInternByID כדי לשלוף את נתוני המתמחה
    GetInternByID(internID)  // Call GetInternByID to fetch intern data
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error("Error in GetInternByID: ", error);
      });
  }, []);  // רשימת תלויות ריקה מבטיחה שהקוד ירוץ רק פעם אחת לאחר טעינת הקומפוננטה

  // פונקציה לניווט לדף הסילבוס המלא
  const handleViewFullSyllabus = () => {
    navigate('/TableFullSyllabus/:id');
  };

  // פונקציה לניווט לדף הצגת כל הניתוחים
  const handleViewAllSurgeries = () => {
    navigate('/details/:id', {
      state: {
        role: 'intern'
      }
    });
  }

  const handleCalenderPage = () => {
    navigate("/calender");
  };


  return (
    <>
      <MenuLogo role="intern" />
      
      {/* ציר התקדמות */}
      <StepperOfIntern />

      <Container maxWidth="lg" sx={{ mt: 8, mb: 3 }}>
        <Grid container spacing={3} alignItems="center" dir={'rtl'}>
          {/* Full Syllabus View */}
          <Grid item xs={12}>
            <FullSyllabus />
          </Grid>

          {/* Full Syllabus Button */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={handleViewFullSyllabus}
              sx={{
                width: '100%',
                maxWidth: 300,
                backgroundColor: 'white',       // Set background color to white
                color: '#1976d2',                  // Set text color to blue
                borderColor: '#1976d2',            // Set border color to blue
                borderWidth: 2,                 // Set border width
                borderStyle: 'solid',           // Define border as solid
                '&:hover': {
                  backgroundColor: '#f0f0f0', // Light grey background on hover for slight effect
                  borderColor: 'darkblue'     // Darker blue border on hover
                }
              }}
            >
              צפייה בסילבוס המלא
              <TableChartIcon sx={{ mr: 1 }} />
            </Button>
          </Grid>

          {/* Recent Surgeries Button */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={handleViewAllSurgeries}
              sx={{
                width: '100%',
                maxWidth: 300,
                backgroundColor: 'white',       // Set background color to white
                color: '#1976d2',                  // Set text color to blue
                borderColor: '#1976d2',            // Set border color to blue
                borderWidth: 2,                 // Set border width
                borderStyle: 'solid',           // Define border as solid
                '&:hover': {
                  backgroundColor: '#f0f0f0', // Light grey background on hover for slight effect
                  borderColor: 'darkblue'     // Darker blue border on hover
                }
              }}
            >
              צפייה בניתוחים שבוצעו
              <DomainVerificationIcon sx={{ mr: 1 }} />
            </Button>
          </Grid>

            {/* Calender Page Button */}
            <Grid item xs={12} display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={handleCalenderPage}
              sx={{
                width: '100%',
                maxWidth: 300,
                backgroundColor: 'white',       // Set background color to white
                color: '#1976d2',                  // Set text color to blue
                borderColor: '#1976d2',            // Set border color to blue
                borderWidth: 2,                 // Set border width
                borderStyle: 'solid',           // Define border as solid
                '&:hover': {
                  backgroundColor: '#f0f0f0', // Light grey background on hover for slight effect
                  borderColor: 'darkblue'     // Darker blue border on hover
                }
              }}
            >
              צפייה בלוח שנה
              <CalendarMonthIcon sx={{ mr: 1 }} />
            </Button>
          </Grid>

          {/* Recent Surgeries */}
          <Grid item xs={12}>
            <RecentSurgeries />
          </Grid>

        </Grid>
      </Container>
      <FloatingChatButton />
    </>
  );
}
