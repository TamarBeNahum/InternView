import React from "react";
import MenuLogo from "./MenuLogo"; // ייבוא רכיב התפריט הראשי של המנהל
import ViewInterns from "./ViewInterns"; // ייבוא רכיב להצגת מתמחים
import { Link } from "react-router-dom"; // ייבוא רכיב ה-Link מ-React Router לצורך ניווט בין דפים
import { Grid, Box, Typography, Paper } from "@mui/material"; // ייבוא רכיבי Material-UI
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // אייקון עבור שיבוץ מתמחים
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"; // אייקון עבור צפייה בסילבוס
import GroupAddIcon from "@mui/icons-material/GroupAdd"; // אייקון עבור הוספת מתמחים
import UploadFileIcon from "@mui/icons-material/UploadFile"; // אייקון עבור העלאת ניתוחים
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // אייקון עבור שיבוצים לניתוחים שבועיים
import FloatingChatButton from "./FloatingChatButton";
import HamburgerMenu from "./HamburgerMenu";

export default function MangerPage() {
  // מערך שמכיל את כל הפעולות האפשריות עבור המנהל, כולל הכותרת, האייקון והקישור הרלוונטי
  const actions = [
    {
      title: "שיבוץ מתמחים",
      icon: <AssignmentTurnedInIcon fontSize="large" color="primary" />,
      link: "/MatchingAlgo",
    },
    {
      title: "צפייה בסילבוס של מתמחה",
      icon: <PlaylistAddCheckIcon fontSize="large" color="primary" />,
      link: "/ShowSyllabusPerIntern",
    },
    {
      title: "הוספת מתמחים",
      icon: <GroupAddIcon fontSize="large" color="primary" />,
      link: "/addIntern",
    },
    {
      title: "הוספת תורנויות",
      icon: <AssignmentTurnedInIcon fontSize="large" color="primary" />,
      link: "/InternScheduling",
    },
    {
      title: "העלאת ניתוחים",
      icon: <UploadFileIcon fontSize="large" color="primary" />,
      link: "/AddSurgeries",
    },
    {
      title: "שיבוצים לניתוחים שבועיים",
      icon: <CalendarMonthIcon fontSize="large" color="primary" />,
      link: "/WeeklySchedule",
    },
  ];

  return (
    <>
      <MenuLogo role="manager"  /> {/* רכיב שמציג את הלוגו או תפריט המנהל */}
      <ViewInterns /> {/* רכיב להצגת מתמחים */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Grid
          container
          spacing={2} // ערך spacing בין הכרטיסיות
          alignItems="center" // יישור אנכי של הכרטיסיות
        >
          {actions.map(
            (
              action,
              index /* מיפוי על כל פעולה במערך כדי ליצור כפתור עם פרטים מותאמים */
            ) => (
              <Grid item xs={6} sm={4} md={4} lg={2} key={index}>
                <Box display="flex" justifyContent="center">
                  <Paper
                    component={Link}
                    to={action.link} // הקישור לדף הרלוונטי
                    elevation={3} // צל קל לכרטיס כדי להדגיש אותו
                    sx={{
                      padding: 2,
                      textAlign: "center",
                      transition: "transform 0.2s", // אפקט תנועה קל בעת ריחוף מעל הכרטיס
                      "&:hover": { transform: "scale(1.05)" }, // הגדלת הכרטיס בעת ריחוף
                      height: "60px", // קביעת גובה אחיד לכל הכפתורים
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "2px solid #1976d2", // מסגרת כחולה סביב הכרטיס
                      borderRadius: "8px", // עיגול פינות הכרטיס
                      textDecoration: "none", // הסרת הקו התחתון מהטקסט בלינק
                      color: "inherit", // שימוש בצבע הטקסט ברירת המחדל
                      width: "100%", // התאמה למלוא הרוחב של ה-Grid item
                      maxWidth: "170px", // הגבלת הרוחב המקסימלי לכרטיס
                    }}
                  >
                    {action.icon} {/* הצגת האייקון של הפעולה */}
                    <Typography variant="h6" sx={{ mt: 1, fontSize: 16 }}>
                      {action.title} {/* הצגת הכותרת של הפעולה */}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            )
          )}
        </Grid>
      </Box>
      <FloatingChatButton/>
    </>
  );
}
