import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import * as XLSX from "xlsx";
import MenuLogo from "../FFCompos/MenuLogo";
import excelImage from "../Image/exelPhoto.png";
import styled from "@mui/system/styled";
import {
  InsertSurgery,
  GetAllProcedure,
  AddProcedureInSurgery,
} from "../FFCompos/Server.jsx";
import Swal from "sweetalert2";
import "../App.css";
import FloatingChatButton from "./FloatingChatButton.jsx";

const VisuallyHiddenInput = styled("input")({
  position: "absolute",
  left: "-9999px",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
});

// Helper functions to convert Excel data
function convertExcelTimeToReadableTime(excelTime) {
  const totalMinutes = Math.round(excelTime * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function convertExcelDateToJSDate(excelDate) {
  if (typeof excelDate === "string" && excelDate.includes(".")) {
    const parts = excelDate.split(".");
    if (parts.length !== 3) {
      return excelDate;
    }
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
  const year = jsDate.getUTCFullYear();
  const month = (jsDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = jsDate.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddSurgeries() {
  const [loadedSurgeries, setLoadedSurgeries] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSingleForm, setOpenSingleForm] = useState(false);
  const [hasIncomplete, setHasIncomplete] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [newSurgery, setNewSurgery] = useState({
    caseNumber: "",
    patientAge: "",
    surgeryDate: "",
    surgeryTime: "",
    difficultyLevel: "",
    productionCodes: [],
  });
  const [errors, setErrors] = useState({
    caseNumber: false,
    patientAge: false,
    surgeryDate: false,
    surgeryTime: false,
    difficultyLevel: false,
    productionCodes: false,
  });
  const [procedures, setProcedures] = useState([]);

  useEffect(() => {
    GetAllProcedure()
      .then((data) => {
        setProcedures(data);
      })
      .catch((error) => {
        console.error("Error fetching procedures: ", error);
      });
  }, []);

  const handleSingleFormChange = (event) => {
    const { name, value } = event.target;

    let validatedValue = value;

    if (name === "patientAge") {
      if (value < 0) {
        validatedValue = 0;
      } else if (value > 120) {
        validatedValue = 120;
      }
    }

    setNewSurgery((prevState) => ({
      ...prevState,
      [name]: validatedValue,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: !validatedValue,
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let incomplete = false;
      let invalid = false;
      const objects = jsonData
        .slice(1)
        .filter((row, index) => {
          if (!Array.isArray(row)) {
            console.error(`Row ${index + 1} is not an array:`, row);
            return false;
          }

          const hasData = row.some(
            (cell) => cell !== undefined && cell !== null && cell !== ""
          );
          if (!hasData) return false;

          // Check if all required fields are complete
          const isComplete =
            row.length >= 6 &&
            row[0] &&
            row[1] &&
            row[2] &&
            row[3] &&
            row[4] &&
            row[5];
          if (!isComplete) {
            incomplete = true;
            console.warn(`Incomplete data on row ${index + 1}:`, row);
            return false;
          }

          // Validate the data
          const caseNumber = row[0];
          const patientAge = parseInt(row[1]);
          const surgeryDateRaw = row[2];
          const surgeryTimeRaw = row[3];
          const difficultyLevel = parseInt(row[4]);

          const productionCodes = String(row[5])
            .split(",")
            .map((code) => code.trim());

          const isCaseNumberValid = /^[0-9]+$/.test(caseNumber);
          const isPatientAgeValid = patientAge >= 0 && patientAge <= 120;

          // Convert and check the date and time
          const surgeryDate = convertExcelDateToJSDate(surgeryDateRaw);
          const surgeryTime = convertExcelTimeToReadableTime(surgeryTimeRaw);
          const isSurgeryDateValid = !isNaN(new Date(surgeryDate).getTime());
          const isSurgeryTimeValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(
            surgeryTime
          );

          const isDifficultyLevelValid =
            difficultyLevel >= 1 && difficultyLevel <= 3;
          const areProductionCodesValid = productionCodes.every((code) =>
            /^[0-9]+$/.test(code)
          );

          if (
            !isCaseNumberValid ||
            !isPatientAgeValid ||
            !isSurgeryDateValid ||
            !isSurgeryTimeValid ||
            !isDifficultyLevelValid ||
            !areProductionCodesValid
          ) {
            console.log(isCaseNumberValid, "isCaseNumberValid");
            console.log(isPatientAgeValid, "isPatientAgeValid");
            console.log(isSurgeryDateValid, "isSurgeryDateValid");
            console.log(isSurgeryTimeValid, "isSurgeryTimeValid");
            console.log(isDifficultyLevelValid, "isDifficultyLevelValid");
            console.log(areProductionCodesValid, "areProductionCodesValid");
            invalid = true;
            console.warn(`Invalid data on row ${index + 1}:`, row);
            return false;
          }

          return true;
        })
        .map((row) => ({
          caseNumber: row[0],
          patientAge: parseInt(row[1]),
          surgeryDate: convertExcelDateToJSDate(row[2]),
          surgeryTime: convertExcelTimeToReadableTime(row[3]),
          difficultyLevel: parseInt(row[4]),
          productionCodes: String(row[5])
            .split(",")
            .map((code) => code.trim()),
        }));

      if (invalid) {
        Swal.fire({
          icon: "error",
          title: "שגיאה בנתונים",
          text: "חלק מהשורות מכילות נתונים שאינם בפורמט הנכון ולכן לא יועלו למערכת.",
        });
      }

      setHasIncomplete(incomplete);
      setLoadedSurgeries(objects);
      setOpenDialog(true);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownload = (event) => {
    event.preventDefault();
    const link = document.createElement("a");
    link.href = "/exelFormat.xlsx";
    link.download = "exelFormat.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleContinueDialog = async () => {
    let successfulSurgeries = [];

    await Promise.all(
      loadedSurgeries.map(async (surgery) => {
        try {
          const response = await InsertSurgery({
            surgery_id: 0,
            case_number: surgery.caseNumber,
            patient_age: surgery.patientAge,
            surgery_date:
              surgery.surgeryDate + "T" + surgery.surgeryTime + ":00",
            difficulty_level: surgery.difficultyLevel,
            production_codes: surgery.productionCodes.join(", "), // שילוב קודי הפרוצדורות למחרוזת
            hospital_name: "הלל יפה",
          });

          console.log("Surgery inserted:", response);

          if (response !== -1 && response !== -2) {
            // Add procedures to the surgery
            await Promise.all(
              surgery.productionCodes.map(async (procedure_Id) => {
                await AddProcedureInSurgery(response, procedure_Id);
              })
            );

            successfulSurgeries.push(surgery);
          } else {
            let errorMsg = "";

            if (response === -1) {
              errorMsg = `- הוספת ניתוח אחד או יותר נכשלה <br> קיים ניתוח חופף בזמנים בתאריך ניתן`;
            } else if (response === -2) {
              errorMsg =
                "- הוספת ניתוח אחד או יותר נכשלה <br> קיימים כבר 2 ניתוחים בתאריך ניתן";
            }

            Swal.fire({
              icon: "warning",
              title: "...הפעולה בוצעה בהצלחה :) אבל",
              html: errorMsg,
            });
          }
        } catch (error) {
          console.error("Error inserting surgery:", error);
        }
      })
    );

    setSurgeries(successfulSurgeries);
    setOpenDialog(false);
    setIsConfirmed(true);
  };

  const handleOpenSingleForm = () => {
    setOpenSingleForm(true);
  };

  const handleCloseSingleForm = () => {
    setOpenSingleForm(false);
    setNewSurgery({
      caseNumber: "",
      patientAge: "",
      surgeryDate: "",
      surgeryTime: "",
      difficultyLevel: "",
      productionCodes: [],
    });
    setErrors({
      caseNumber: false,
      patientAge: false,
      surgeryDate: false,
      surgeryTime: false,
      difficultyLevel: false,
      productionCodes: false,
    });
  };

  const handleSingleFormSubmit = async () => {
    const newErrors = {
      caseNumber: !newSurgery.caseNumber,
      patientAge: !newSurgery.patientAge,
      surgeryDate: !newSurgery.surgeryDate,
      surgeryTime: !newSurgery.surgeryTime,
      difficultyLevel: !newSurgery.difficultyLevel,
      productionCodes: newSurgery.productionCodes.length === 0,
    };

    setErrors(newErrors);

    // אם יש שדות ריקים, יש להפסיק את השליחה
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      const response = await InsertSurgery({
        surgery_id: 0,
        case_number: newSurgery.caseNumber,
        patient_age: newSurgery.patientAge,
        surgery_date:
          newSurgery.surgeryDate + "T" + newSurgery.surgeryTime + ":00",
        difficulty_level: newSurgery.difficultyLevel,
        production_codes: newSurgery.productionCodes.join(", "),
        hospital_name: "הלל יפה",
      });

      console.log("Single surgery inserted:", response);

      if (response !== -1 && response !== -2) {
        // Add procedures to the surgery
        await Promise.all(
          newSurgery.productionCodes.map(async (procedure_Id) => {
            await AddProcedureInSurgery(response, procedure_Id);
          })
        );

        setSurgeries([newSurgery]);
        setIsConfirmed(true);
      } else {
        let errorMsg = "";

        if (response === -1) {
          errorMsg = `קיים ניתוח חופף בזמנים בתאריך ${newSurgery.surgeryDate}`;
        } else if (response === -2) {
          errorMsg = "תאריך זה כבר קיים במערכת";
        }

        Swal.fire({
          icon: "error",
          title: "הוספת ניתוח נכשלה",
          text: errorMsg,
        });
      }
    } catch (error) {
      console.error("Error inserting single surgery:", error);
    }

    handleCloseSingleForm();
  };

  return (
    <>
      <MenuLogo />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 3 }}>
        <Box
          spacing={3}
          alignItems="center"
          justifyContent="center"
          direction="column"
        >
          <Box>
            <Button
              component="label"
              variant="contained"
              onClick={handleOpenSingleForm}
              startIcon={<ContentPasteIcon />}
              sx={{
                mb: 2.5,
                width: "300px",
                backgroundColor: "white",
                color: "#1976d2",
                borderColor: "#1976d2",
                borderWidth: 2,
                borderStyle: "solid",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  borderColor: "darkblue",
                },
              }}
            >
              העלאת ניתוח בודד
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" align="center">
              ניתן להעלות גם ניתוחים בעזרת אקסל <br />
              שים ❤️️ - על האקסל להיות <b> בפורמט המתאים</b>
            </Typography>
            <img
              src={excelImage}
              alt="Excel Format"
              style={{ cursor: "pointer", width: "100px" }}
              onClick={handleDownload}
            />
            <Typography
              variant="body1"
              align="center"
              sx={{ mt: 1, color: "green" }}
              onClick={handleDownload}
            >
              לחץ על התמונה על מנת לעבוד <b> בפורמט</b>
            </Typography>
          </Box>

          <Box>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                width: "300px",
                m: 1,
                backgroundColor: "white",
                color: "#1976d2",
                borderColor: "#1976d2",
                borderWidth: 2,
                borderStyle: "solid",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  borderColor: "darkblue",
                },
              }}
            >
              העלאת ניתוחים בקובץ אקסל
              <VisuallyHiddenInput
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                aria-label="Upload Excel file"
                tabIndex="-1"
              />
            </Button>
          </Box>

          {isConfirmed && (
            <Box>
              {surgeries.length > 0 ? (
                <>
                  <Typography variant="h6" align="center" fontWeight={"bold"}>
                    :ניתוחים שהועלו מקובץ האקסל
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ direction: "rtl" }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: "rgb(25 118 210)",
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          <TableCell align="center" sx={{ color: "white" }}>
                            מספר מקרה
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white" }}>
                            גיל מטופל
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white" }}>
                            תאריך הניתוח
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white" }}>
                            שעת הניתוח
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white" }}>
                            רמת מורכבות
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white" }}>
                            קודי הפרוצדורות
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {surgeries.map((obj, index) => (
                          <TableRow key={index}>
                            <TableCell align="center">
                              {obj.caseNumber}
                            </TableCell>
                            <TableCell align="center">
                              {obj.patientAge}
                            </TableCell>
                            <TableCell align="center">
                              {obj.surgeryDate}
                            </TableCell>
                            <TableCell align="center">
                              {obj.surgeryTime}
                            </TableCell>
                            <TableCell align="center">
                              {obj.difficultyLevel}
                            </TableCell>
                            <TableCell align="center">
                              {obj.productionCodes.join(", ")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography variant="h6" align="center">
                  לא הועלה אף ניתוח למערכת
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Container>

      <Dialog
        open={openDialog}
        dir="rtl"
        onClose={handleCloseDialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogContent>
          <DialogContentText id="dialog-description">
            {hasIncomplete
              ? "בחלק מהשורות חסרים נתונים. האם אתה בטוח שברצונך להעלות את הקובץ?"
              : "האם אתה בטוח שברצונך להעלות את הקובץ?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinueDialog} color="primary">
            אישור
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            ביטול
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSingleForm} onClose={handleCloseSingleForm}>
        <DialogTitle>הכנס ניתוח בודד</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="מספר מקרה"
            name="caseNumber"
            type="number"
            fullWidth
            value={newSurgery.caseNumber}
            onChange={handleSingleFormChange}
            error={errors.caseNumber}
            helperText={errors.caseNumber ? "שדה חובה" : ""}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="גיל מטופל"
            name="patientAge"
            type="number"
            fullWidth
            value={newSurgery.patientAge}
            onChange={handleSingleFormChange}
            error={errors.patientAge}
            helperText={errors.patientAge ? "שדה חובה" : ""}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: 0,
              max: 120,
              step: 1,
            }}
          />

          <TextField
            margin="dense"
            label="תאריך הניתוח"
            name="surgeryDate"
            type="date"
            fullWidth
            value={newSurgery.surgeryDate}
            onChange={handleSingleFormChange}
            error={errors.surgeryDate}
            helperText={errors.surgeryDate ? "שדה חובה" : ""}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="שעת הניתוח"
            name="surgeryTime"
            type="time"
            fullWidth
            value={newSurgery.surgeryTime}
            onChange={handleSingleFormChange}
            error={errors.surgeryTime}
            helperText={errors.surgeryTime ? "שדה חובה" : ""}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="רמת מורכבות הניתוח"
            name="difficultyLevel"
            select
            fullWidth
            value={newSurgery.difficultyLevel}
            onChange={handleSingleFormChange}
            error={errors.difficultyLevel}
            helperText={errors.difficultyLevel ? "שדה חובה" : ""}
          >
            {[1, 2, 3].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
          <FormControl fullWidth margin="dense" error={errors.productionCodes}>
            <InputLabel id="procedure-code-label">קודי הפרוצדורות</InputLabel>
            <Select
              labelId="procedure-code-label"
              name="productionCodes"
              value={newSurgery.productionCodes}
              onChange={(event) =>
                setNewSurgery((prevState) => ({
                  ...prevState,
                  productionCodes: event.target.value,
                }))
              }
              label="קודי הפרוצדורות"
              multiple
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 38 * 5 + 8, // 5 items at 48px each plus some padding
                  },
                },
              }}
            >
              {procedures.map((procedure) => (
                <MenuItem
                  key={procedure.procedure_Id}
                  value={procedure.procedure_Id}
                >
                  {procedure.procedure_Id}
                </MenuItem>
              ))}
            </Select>
            {errors.productionCodes && (
              <Typography color="error">שדה חובה</Typography>
            )}
          </FormControl>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSingleForm} color="primary">
            ביטול
          </Button>
          <Button onClick={handleSingleFormSubmit} color="primary">
            הוספת ניתוח
          </Button>
        </DialogActions>
      </Dialog>
      <FloatingChatButton />
    </>
  );
}