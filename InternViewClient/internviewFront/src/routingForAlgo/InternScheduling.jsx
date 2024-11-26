import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  Paper,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { GetAllIntern, GetAllInternsDutySchedule } from "../FFCompos/Server";
import { useTheme } from "@mui/material/styles";
import MenuLogo from "../FFCompos/MenuLogo";
import { useLocation } from "react-router-dom";
import { AddInternDutySchedule, RemoveInternDutySchedule } from "../FFCompos/Server.jsx"; // Assuming RemoveInternDutySchedule is defined

// Constants for initial state
const initialAssignments = {
  Sunday: [],
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
};

const initialWeekDates = {
  Sunday: "",
  Monday: "",
  Tuesday: "",
  Wednesday: "",
  Thursday: "",
  Friday: "",
  Saturday: "",
};

// Hebrew translation for days of the week
const daysInHebrew = {
  Sunday: "ראשון",
  Monday: "שני",
  Tuesday: "שלישי",
  Wednesday: "רביעי",
  Thursday: "חמישי",
  Friday: "שישי",
  Saturday: "שבת",
};

export default function InternScheduling() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const [interns, setInterns] = useState([]);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [confirmedAssignments, setConfirmedAssignments] = useState(null);
  const [weekDates, setWeekDates] = useState(initialWeekDates);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledData, setScheduledData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedInternsForDay, setSelectedInternsForDay] = useState([]);

  useEffect(() => {
    // Fetch all interns using the GetAllIntern function
    GetAllIntern()
      .then((data) => {
        setInterns(data);
      })
      .catch((error) => {
        console.error("Error in GetAllIntern: ", error);
      });

    // Fetch scheduled data using the GetAllInternsDutySchedule function
    GetAllInternsDutySchedule()
      .then((data) => {
        setScheduledData(data);
      })
      .catch((error) => {
        console.error("Error in GetAllInternsDutySchedule: ", error);
      });
  }, []);

  // Calculate the week dates starting from the selected date
  const calculateWeekDates = (selectedDate) => {
    if (isNaN(selectedDate)) return; // Guard clause for invalid date
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const newWeekDates = {};
    Object.keys(daysInHebrew).forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      newWeekDates[day] = date;
    });
    setWeekDates(newWeekDates);
  };

  // Handle date change for the calendar
  const handleWeekStartDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    calculateWeekDates(selectedDate);
  };

  // Handle changes in selection of interns for a specific day
  const handleSelectChange = (day, event) => {
    const selectedInterns = event.target.value.slice(0, 2); // Allow a maximum of 2 interns
    setAssignments((prevAssignments) => ({
      ...prevAssignments,
      [day]: selectedInterns,
    }));
  };

  // Confirm the assignments and show a confirmation dialog using SweetAlert2
  const confirmAssignments = () => {
    Swal.fire({
      title: "?אתה בטוח",
      text: "?האם אתה מאשר את השיבוץ",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "ביטול",
      confirmButtonText: "כן, אשר",
    }).then((result) => {
      if (result.isConfirmed) {
        // Prepare and send assignments to the server
        const schedulingData = [];
        Object.keys(assignments).forEach((day) => {
          assignments[day].forEach((internId) => {
            if (weekDates[day]) {
              schedulingData.push({
                DutyDate: weekDates[day].toISOString().split('T')[0] + "T00:00", // Ensure date is valid
                Intern_id: internId,
              });
            }
          });
        });
  
        const responses = []; // מערך לאיסוף כל התגובות
        const successfulAssignments = []; // מערך לאיסוף השיבוצים שהצליחו
  
        // Make API call for each scheduling entry
        Promise.all(schedulingData.map((schedule) =>
          AddInternDutySchedule(schedule)
            .then((response) => {
              responses.push(response); // שמור כל תגובה במערך
              if (response === 1) {
                successfulAssignments.push(schedule); // שמור את השיבוצים שהצליחו
              }
            })
            .catch((error) => {
              console.error("Error in AddInternDutySchedule: ", error);
              Swal.fire("שגיאה", ".לא הצלחנו לאשר את השיבוץ", "error");
            })
        )).then(() => {
          // ניתוח התגובות
          const hasSuccess = responses.includes(1);
          const hasMinus1 = responses.includes(-1);
          const hasMinus2 = responses.includes(-2);
  
          // Update the state regardless of the result to ensure rendering
          setScheduledData((prevData) => [
            ...prevData,
            ...successfulAssignments.map((schedule) => ({
              dutyDate: schedule.DutyDate,
              intern_id: schedule.Intern_id,
            })),
          ]);
  
          if (hasSuccess && !hasMinus1 && !hasMinus2) {
            Swal.fire("!אושר", ".השיבוץ אושר בהצלחה", "success");
          } else if (!hasSuccess && hasMinus1 && hasMinus2) {
            Swal.fire({
              icon: "error",
              title: "לא בוצע שיבוץ",
              html: "בחרת בשיבוץ שכבר קיים , ולא ניתן לשבץ יותר מ 2 מתמחים ביום",
            });
          } else if (hasSuccess && hasMinus1 && hasMinus2) {
            Swal.fire({
              icon: "warning",
              title: "...הפעולה בוצעה בהצלחה :) אבל",
              html: " בחרת בשיבוץ שכבר קיים , ולא ניתן לשבץ יותר מ 2 מתמחים ביום ועל כן לא התווספו",
            });
          } else if (!hasSuccess && hasMinus1 && !hasMinus2) {
            Swal.fire({
              icon: "error",
              title: "בחרת בשיבוץ שכבר קיים",
              html:"נסה שוב",
            });
          } else if (!hasSuccess && !hasMinus1 && hasMinus2) {
            Swal.fire({
              icon: "error",
              title: "לא ניתן לשבץ יותר מ 2 מתמחים ביום",
              html:"נסה שוב",
            });
          } else if (hasSuccess && hasMinus1 && !hasMinus2) {
            Swal.fire({
              icon: "warning",
              title: "...הפעולה בוצעה בהצלחה :) אבל",
              html: "אחד מהשיבוצים שבחרת כבר קיימים במערכת ועל כן לא התווספו",
            });
          } else if (hasSuccess && !hasMinus1 && hasMinus2) {
            Swal.fire({
              icon: "warning",
              title: "...הפעולה בוצעה בהצלחה :) אבל",
              html: " לא ניתן לשבץ יותר מ 2 מתמחים ביום ועל כן לא התווספו",
            });
          }
        });
      }
    });
  };
  
  

  // Clear all assignments and optionally clear confirmed assignments
  const clearAssignments = () => {
    setAssignments(initialAssignments);
    setWeekDates(initialWeekDates);
    setConfirmedAssignments(null);
  };

  // Navigate to the next or previous week
  const changeWeek = (offset) => {
    setCurrentWeekOffset((prevOffset) => prevOffset + offset);
  };

  // Toggle the visibility of the schedule table
  const toggleScheduleVisibility = () => {
    setShowSchedule((prev) => !prev);
  };

  // Open the dialog to show assigned interns with delete option
  const openInternsDialog = (day) => {
    const internsForDay = generateWeeklyScheduleFromServer[day]?.interns || [];

    // סינון מתמחים כפולים לפי ID
    const uniqueInternsForDay = Array.from(new Set(internsForDay.map(intern => intern.id)))
      .map(id => internsForDay.find(intern => intern.id === id));

    setSelectedDay(day);
    setSelectedInternsForDay(uniqueInternsForDay);
    setOpenDialog(true);
  };


  // Handle intern removal
  const handleRemoveIntern = (internId) => {
    // Make API call to remove intern
    const dutyDate = weekDates[selectedDay]?.toISOString().split('T')[0] + "T00:00";
    RemoveInternDutySchedule({ DutyDate: dutyDate, Intern_id: internId })
      .then((response) => {
        if (response) {
          // Successfully removed, update state
          setScheduledData((prevData) =>
            prevData.filter(
              (schedule) =>
                !(schedule.dutyDate.startsWith(dutyDate) && schedule.intern_id === internId)
            )
          );
          setSelectedInternsForDay((prevInterns) =>
            prevInterns.filter((intern) => intern.id !== internId)
          );
          Swal.fire("הוסר בהצלחה", ".השיבוץ הוסר בהצלחה", "success");
        } else {
          Swal.fire("שגיאה", ".לא הצלחנו להסיר את השיבוץ", "error");
        }
      })
      .catch((error) => {
        console.error("Error in RemoveInternDutySchedule: ", error);
        Swal.fire("שגיאה", ".לא הצלחנו להסיר את השיבוץ", "error");
      });
  };

  // Generate the dynamic weekly schedule from server data
  const generateWeeklyScheduleFromServer = useMemo(() => {
    const schedule = {};
    const currentWeek = new Date(weekDates.Sunday);
    if (isNaN(currentWeek)) return schedule; // Guard against invalid dates
    currentWeek.setDate(currentWeek.getDate() + currentWeekOffset * 7);

    // Map intern IDs to intern details
    const internMap = interns.reduce((map, intern) => {
      map[intern.id] = `${intern.first_name} ${intern.last_name}`;
      return map;
    }, {});

    Object.keys(daysInHebrew).forEach((day, index) => {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + index);
      if (isNaN(date)) return; // Guard clause for invalid date
      const formattedDate = date.toISOString().split('T')[0]; // Format date to 'YYYY-MM-DD'

      // Filter scheduled data for the current day
      const internsForDay = scheduledData
        .filter(schedule => schedule.dutyDate.startsWith(formattedDate))
        .map(schedule => ({
          id: schedule.intern_id,
          name: internMap[schedule.intern_id] || "Unknown",
        }));

      schedule[day] = {
        date: date.toLocaleDateString("he-IL"),
        interns: internsForDay,
      };
    });
    return schedule;
  }, [scheduledData, interns, currentWeekOffset, weekDates]);

  // Check if a start date for the week is selected
  const isWeekDateSelected = Object.values(weekDates).every((date) => date);
  // Check if any assignments are made
  const isAnyAssignmentMade = Object.values(assignments).some(
    (dayAssignments) => dayAssignments.length > 0
  );

  return (
    <>
      <MenuLogo />
      <Box sx={{ mt: 3, mb: 2, direction: "rtl", px: isMobile ? 1 : 4 }}>
        <Typography variant="h6" fontWeight={"bold"} gutterBottom>
          הוספת תורנויות
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            type="date"
            label="בחר שבוע לתורנויות"
            onChange={handleWeekStartDateChange}
            sx={{ width: "100%", textAlign: "center" }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        {!isMobile ? (
          // Table layout for larger screens
          <TableContainer component={Paper} sx={{ mb: 2, direction: "rtl" }}>
            <Table sx={{ tableLayout: "fixed", width: "100%", direction: "rtl" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "9%", textAlign: "center", fontSize: 16 }}>

                  </TableCell>
                  {Object.keys(assignments).map((day) => (
                    <TableCell key={day} sx={{ width: "14%", textAlign: "center", fontSize: 16 }}>
                      {daysInHebrew[day]}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {weekDates[day] ? weekDates[day].toLocaleDateString("he-IL") : ""}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ textAlign: "center", fontSize: 16 }}>
                    תורנים
                  </TableCell>
                  {Object.keys(assignments).map((day) => (
                    <TableCell key={day} sx={{ textAlign: "center", fontSize: 16 }}>
                      <Select
                        multiple
                        value={assignments[day]}
                        onChange={(event) => handleSelectChange(day, event)}
                        renderValue={(selected) =>
                          selected
                            .map((id) => interns.find((intern) => intern.id === id)?.first_name)
                            .join(", ")
                        }
                        fullWidth
                        displayEmpty
                        sx={{
                          textAlign: "right",
                          fontSize: 16,
                          backgroundColor: "#e3f2fd",
                        }}
                        MenuProps={{
                          PaperProps: {
                            "aria-hidden": false,
                            style: {
                              maxHeight: 48 * 4.5 + 8,
                              width: "250px",
                            },
                          },
                        }}
                      >
                        {interns.map((intern) => (
                          <MenuItem key={intern.id} value={intern.id}>
                            {intern.first_name} {intern.last_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Card layout for mobile screens
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.keys(assignments).map((day) => (
              <Card key={day} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    {daysInHebrew[day]}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {weekDates[day] ? weekDates[day].toLocaleDateString("he-IL") : ""}
                    </Typography>
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      תורנים
                    </Typography>
                    <Select
                      multiple
                      value={assignments[day]}
                      onChange={(event) => handleSelectChange(day, event)}
                      renderValue={(selected) =>
                        selected
                          .map((id) => interns.find((intern) => intern.id === id)?.first_name)
                          .join(", ")
                      }
                      fullWidth
                      displayEmpty
                      sx={{
                        textAlign: "right",
                        fontSize: 16,
                        backgroundColor: "#e3f2fd",
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8,
                            width: "250px",
                          },
                        },
                      }}
                    >
                      {interns.map((intern) => (
                        <MenuItem key={intern.id} value={intern.id}>
                          {intern.first_name} {intern.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: 4,
            flexDirection: isMobile ? "column" : "row", // Stack buttons on mobile
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={confirmAssignments}
            sx={{ fontSize: isMobile ? 12 : 14 }}
            disabled={!isWeekDateSelected || !isAnyAssignmentMade} // Disable button if no date is selected
          >
            אישור שיבוץ
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearAssignments}
            sx={{ fontSize: isMobile ? 12 : 14 }}
          >
            ניקוי שיבוץ
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={toggleScheduleVisibility}
            sx={{ fontSize: isMobile ? 12 : 14 }}
          >
            {showSchedule ? "הסתר לוח תורנויות" : "הצג לוח תורנויות"}
          </Button>
        </Box>

        {showSchedule && (
          <Box sx={{ direction: "rtl" }}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              לוח תורנויות לשבוע הנבחר
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Button variant="outlined" onClick={() => changeWeek(-1)}>
                שבוע קודם
              </Button>
              <Button variant="outlined" onClick={() => changeWeek(1)}>
                שבוע הבא
              </Button>
            </Box>
            <Box sx={{ mb: 4 }}>
              <TableContainer component={Paper} sx={{ direction: "rtl" }}>
                <Table
                  sx={{
                    tableLayout: "auto",
                    width: "100%",
                    minWidth: isMobile ? 300 : "100%",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: 16,
                          whiteSpace: isMobile ? "nowrap" : "normal",
                        }}
                      >

                      </TableCell>
                      {Object.keys(daysInHebrew).map((day) => (
                        <TableCell
                          key={day}
                          sx={{
                            textAlign: "center",
                            fontSize: 16,
                            whiteSpace: isMobile ? "nowrap" : "normal",
                          }}
                        >
                          {daysInHebrew[day]}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {generateWeeklyScheduleFromServer[day]?.date || ""}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          textAlign: "center",
                          fontSize: 16,
                          whiteSpace: isMobile ? "nowrap" : "normal",
                        }}
                      >
                        תורנים
                      </TableCell>
                      {Object.keys(daysInHebrew).map((day) => (
                        <TableCell
                          key={day}
                          sx={{
                            textAlign: "center",
                            fontSize: 16,
                            whiteSpace: isMobile ? "nowrap" : "normal",
                          }}
                          onClick={() => openInternsDialog(day)} // Open dialog on cell click
                        >
                          {generateWeeklyScheduleFromServer[day]?.interns
                            .filter((intern, index, self) =>
                              index === self.findIndex((t) => t.id === intern.id))
                            .map((intern, index) => (
                              <Typography key={`${intern.id}-${index}`} variant="body2" sx={{ mb: 1 }}>
                                {intern.name}
                              </Typography>
                            ))}

                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={openDialog} dir="rtl" onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>מתמחים ששובצו</DialogTitle>
        <DialogContent>
          {selectedInternsForDay.map((intern, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {intern.name}
              </Typography>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveIntern(intern.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
