import React, { useState, useEffect } from "react";
import MenuLogo from "./MenuLogo.jsx";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import FloatingChatButton from "./FloatingChatButton";
import { GetAllProcedure, GetInternSurgeriesByProcedure } from "./Server.jsx";

//-------------------------------------
export default function CardsDetailsInterns() {
  const [data, setData] = useState([]); // נתונים ראשוניים שנשלפים מהשרת
  const [filteredData, setFilteredData] = useState([]); // נתונים מסוננים בהתבסס על קריטריוני חיפוש
  const [searchDate, setSearchDate] = useState(""); // מצב לחיפוש לפי תאריך ניתוח
  const [selectedRole, setSelectedRole] = useState("all"); // מצב לסינון לפי תפקיד נבחר
  const [loading, setLoading] = useState(false); // מצב לאינדיקציה של טעינה
  const [error, setError] = useState(""); // מצב להצגת הודעות שגיאה
  const location = useLocation(); // גישה לאובייקט המיקום
  const procedure_Id = location.state?.procedureId || 0; // שליפת מזהה הפרוצדורה ממצב המיקום או null אם לא קיים
  const [procedures, setProcedures] = useState([]); // מערך המחזיק את כל הפרוצדורות
  const [selectedProcedure, setSelectedProcedure] = useState(null); // מצביע על הפרוצדורה הנבחרת
  const { internID } = location.state || {};
  const internId =
    internID ?? JSON.parse(sessionStorage.getItem("currentUserID")) ?? 0; // שליפת מזהה המתמחה מאחסון הסשן
  const role = location.state.role || "manager";
  console.log("location.state:", location.state);
  // הוק לשליפת כל שמות הפרוצדורות
  useEffect(() => {
    GetAllProcedure()
      .then((data) => {
        setProcedures(data); // שמירת הנתונים במערך הפרוצדורות
      })
      .catch((error) => {
        console.error("Error in GetAllProcedure: ", error); // הדפסת שגיאה במקרה של בעיה
      });
  }, []);

  // הוק לשליפת נתונים מהשרת בהתבסס על internId ו-procedure_Id
  useEffect(() => {
    setLoading(true);
    if (internId) {
      GetInternSurgeriesByProcedure(internId, procedure_Id)
        .then((fetchedData) => {
          setData(fetchedData);
          setFilteredData(fetchedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data."); // הצגת הודעת שגיאה כשלוקחים נתונים
          setLoading(false);
        });
    } else {
      setError("Invalid intern ID."); // הצגת שגיאה במקרה של מזהה מתמחה לא תקין
      setLoading(false);
    }
  }, [internId, procedure_Id]);

  // הוק לשליפת נתונים על פי הפרוצדורה שנבחרה
  useEffect(() => {
    if (internId && selectedProcedure) {
      setLoading(true);
      GetInternSurgeriesByProcedure(internId, selectedProcedure.procedure_Id)
        .then((fetchedData) => {
          setData(fetchedData);
          setFilteredData(fetchedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data."); // הצגת שגיאה במקרה של כשל בשליפת נתונים
          setLoading(false);
        });
    }
  }, [internId, selectedProcedure]);

  // סינון הנתונים בהתבסס על הקריטריונים שנבחרו
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (selectedRole === "all" || item.Intern_role === selectedRole) &&
        (searchDate === "" ||
          new Date(item.Surgery_date).toLocaleDateString() ===
            new Date(searchDate).toLocaleDateString())
    );
    setFilteredData(filtered);
  }, [searchDate, selectedRole, data]);

  // פונקציה שמעדכנת את הפרוצדורה הנבחרת
  const handleProcedureChange = (event, newValue) => {
    setSelectedProcedure(newValue); // עדכון הפרוצדורה הנבחרת
  };

  // פונקציה לעדכון חיפוש לפי תאריך ניתוח
  const handleSearchChange = (event) => {
    setSearchDate(event.target.value);
  };

  // פונקציה לעדכון חיפוש לפי תפקיד בניתוח
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  return (
    <>
       <MenuLogo role={role || "intern"} />
      <Typography
        variant="h6"
        sx={{ marginTop: 8, textAlign: "center", fontWeight: "bold" }}
      >
        הצגת הניתוחים
      </Typography>
      <Box
        sx={{
          margin: "10px",
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 2,
          marginTop: 2,
        }}
      >
        {/* תיבה עבור בחירת פרוצדורה */}
        <Box sx={{ width: "100%", maxWidth: 300 }}>
          <Autocomplete
            value={selectedProcedure}
            onChange={handleProcedureChange}
            options={procedures}
            getOptionLabel={(option) => option.procedureName || ""}
            renderInput={(params) => (
              <TextField {...params} label="בחירת שם ניתוח" fullWidth />
            )}
            isOptionEqualToValue={(option, value) =>
              option.procedureName === value.procedureName
            }
          />
        </Box>
      </Box>
      {/* תיבה עבור שאר הפילטרים */}
      <Box
        sx={{
          margin: "10px",
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 2,
          marginTop: 2,
        }}
      >
        <TextField
          type="date"
          value={searchDate}
          onChange={handleSearchChange}
          label="חפש תאריך ניתוח"
          InputLabelProps={{ shrink: true }}
          sx={{ width: "49%" }} // Adjusted width
        />
        <FormControl sx={{ width: "49%" }}> {/* Adjusted width and removed marginLeft */}
          <InputLabel id="role-select-label">תפקיד בניתוח</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            onChange={handleRoleChange}
            displayEmpty
            label="תפקיד בניתוח"
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="מנתח ראשי">מנתח ראשי</MenuItem>
            <MenuItem value="עוזר ראשון">עוזר ראשון</MenuItem>
            <MenuItem value="עוזר שני">עוזר שני</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ margin: "0 20px" }}>
          {" "}
          {/* Adjust the margin value as needed */}
          <TableContainer
            component={Paper}
            sx={{ direction: "rtl", boxShadow: 3 }}
          >
            <Table sx={{ minWidth: 550 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: "#1976D2" }}>
                <TableRow>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    שם הפרוצדורה
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    רמת קושי של הניתוח
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    תאריך הניתוח
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    תפקיד
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      אין נתונים זמינים להצגה.
                    </TableCell>
                  </TableRow>
                )}
                {filteredData.map((row, index) => (
                  <TableRow
                    key={row.id || index} // Use row.id if it exists, otherwise use index
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:nth-of-type(even)": {
                        backgroundColor: "action.hover",
                      },
                      "&:hover": { backgroundColor: "action.selected" },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      align="right"
                      sx={{ fontSize: "14px" }}
                    >
                      {row.Procedure_name}
                    </TableCell>
                    <TableCell align="right">{row.Difficulty_level}</TableCell>
                    <TableCell align="right">
                      {new Date(row.Surgery_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">{row.Intern_role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
      <FloatingChatButton />
    </>
  );
}
