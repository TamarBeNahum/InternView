import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  Chip,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TodayIcon from "@mui/icons-material/Today";
import Swal from "sweetalert2";
import {
  GetAllSurgeriesWithProcedures,
  GetAllProcedure,
  DeleteSurgeryFromSurgeriesSchedule,
  UpdateSurgeries,
  PutOptimalAssignmentsAlgo,
  GetAllIntern,
} from "../FFCompos/Server.jsx";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const generateCalendar = (month) => {
  const startOfTheMonth = month.startOf("month").startOf("week");
  const endOfTheMonth = month.endOf("month").endOf("week");
  const days = [];
  let day = startOfTheMonth;

  while (day.isSameOrBefore(endOfTheMonth)) {
    days.push(day);
    day = day.add(1, "day");
  }

  return days;
};

export default function SurgerySchedule() {
  const navigate = useNavigate();
  const [events, setEvents] = useState({});
  const [procedures, setProcedures] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [loading, setLoading] = useState(false); // for loading spinner
  const [interns, setInterns] = useState([]);
  const [newSurgery, setNewSurgery] = useState({
    Surgery_date: "",
    Hospital_name: "הלל יפה",
    Patient_age: "",
    Case_number: "",
    Difficulty_level: "",
    procedureName: [],
  });

  const days = generateCalendar(currentMonth);

  useEffect(() => {
    GetAllSurgeriesWithProcedures()
      .then((data) => {
        let allEvents = {};
        data.forEach((surgery) => {
          if (surgery.Surgery_date) {
            const dateKey = surgery.Surgery_date.slice(0, 10);
            if (!allEvents[dateKey]) {
              allEvents[dateKey] = [];
            }
            allEvents[dateKey].push({
              ...surgery,
              displayText: `ניתוח ב${surgery.Hospital_name}`,
              isNewMatch: surgery.newMatch === 1,
            });
          } else {
            console.warn("Surgery_date is missing for surgery:", surgery);
          }
        });
        setEvents(allEvents);
      })
      .catch((error) => {
        console.error("Error in GetAllSurgeriesWithProcedures: ", error);
      });

    GetAllProcedure()
      .then((data) => {
        setProcedures(data);
      })
      .catch((error) => {
        console.error("Error in GetAllProcedure: ", error);
      });

    GetAllIntern()
      .then((data) => {
        setInterns(data);
      })
      .catch((error) => {
        console.error("Error fetching interns:", error);
      });
  }, []);

  const getInternNameById = (id) => {
    const intern = interns.find((intern) => intern.id === id);
    return intern ? `${intern.first_name} ${intern.last_name}` : "לא הוקצה";
  };

  const handleDayClick = (day) => {
    const formattedDay = day.format("YYYY-MM-DD");
    setSelectedDayEvents(events[formattedDay] || []);
    setOpenDialog(true);
  };

  const handleMouseDown = (day) => {
    setIsDragging(true);
    setDragStart(day);
    setSelectedDates([day]);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (selectedDates.length > 0) {
      console.log(
        "Selected dates:",
        selectedDates.map((date) => date.format("YYYY-MM-DD"))
      );
    }
  };

  const handleMouseEnter = (day) => {
    if (isDragging && dragStart) {
      const start = dragStart.isBefore(day) ? dragStart : day;
      const end = dragStart.isAfter(day) ? dragStart : day;

      // Ensure selection does not exceed 7 days
      if (end.diff(start, "day") < 7) {
        const newSelectedDates = [];
        let date = start;
        while (date.isSameOrBefore(end)) {
          newSelectedDates.push(date);
          date = date.add(1, "day");
        }
        setSelectedDates(newSelectedDates);
      }
    }
  };

  // Touch events for mobile devices
  const handleTouchStart = (day) => {
    handleMouseDown(day);
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.dataset && element.dataset.date) {
      handleMouseEnter(dayjs(element.dataset.date));
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handlePrevMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const handleToday = () => setCurrentMonth(dayjs());

  const handleOpenAddDialog = (event) => {
    setNewSurgery({
      Surgery_id: event.Surgery_id,
      Surgery_date: dayjs(event.Surgery_date).format("YYYY-MM-DDTHH:mm"),
      Hospital_name: event.Hospital_name,
      Patient_age: event.Patient_age,
      Case_number: event.Case_number,
      Difficulty_level: event.Difficulty_level,
      procedureName: event.procedureName,
    });
    setSelectedEvent(event);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleUpdateSurgery = () => {
    Swal.fire({
      title: "האם אתה בטוח?",
      text: "האם אתה בטוח שברצונך לעדכן ניתוח זה?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "כן, עדכן",
      cancelButtonText: "בטל",
    }).then((result) => {
      if (result.isConfirmed) {
        UpdateSurgeries(selectedEvent.Surgery_id, newSurgery)
          .then(() => {
            const dateKey = newSurgery.Surgery_date.slice(0, 10);
            let updatedEvents = { ...events };
            // Remove the old event
            const oldDateKey = dayjs(selectedEvent.Surgery_date).format(
              "YYYY-MM-DD"
            );
            updatedEvents[oldDateKey] = updatedEvents[oldDateKey].filter(
              (event) => event.Surgery_id !== selectedEvent.Surgery_id
            );
            if (updatedEvents[oldDateKey].length === 0) {
              delete updatedEvents[oldDateKey];
            }

            // Add the updated event
            if (!updatedEvents[dateKey]) {
              updatedEvents[dateKey] = [];
            }
            updatedEvents[dateKey].push({
              ...newSurgery,
              displayText: `ניתוח ב${newSurgery.Hospital_name}`,
              isNewMatch: false,
            });

            setEvents(updatedEvents);
            setSelectedDayEvents(updatedEvents[dateKey]);
            handleCloseAddDialog();
            Swal.fire("עודכן!", "הניתוח עודכן בהצלחה.", "success");
          })
          .catch((error) => {
            Swal.fire("שגיאה", "אירעה שגיאה בעת עדכון הניתוח.", "error");
          });
      }
    });
  };

  const handleOpenRemoveDialog = (event) => {
    setSelectedEvent(event);
    setOpenRemoveDialog(true);
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedEvent(null);
  };

  const handleRemoveSurgery = () => {
    DeleteSurgeryFromSurgeriesSchedule(selectedEvent.Surgery_id).then(
      (data) => {
        const dateKey = selectedEvent.Surgery_date.slice(0, 10);
        const updatedEvents = events[dateKey].filter(
          (event) => event.Surgery_id !== selectedEvent.Surgery_id
        );
        if (updatedEvents.length === 0) {
          delete events[dateKey];
        } else {
          events[dateKey] = updatedEvents;
        }
        setEvents({ ...events });
        setSelectedDayEvents(updatedEvents);
        handleCloseRemoveDialog();
        if (data == 1) Swal.fire("נמחק!", "הניתוח נמחק בהצלחה.", "success");
        else Swal.fire("הניתוח לא קיים", "", "error");
      }
    );
  };

  const handleOptimalAssignments = () => {
    if (selectedDates.length === 0) {
        Swal.fire("שגיאה", "אנא בחר טווח תאריכים לפני הרצת האלגוריתם.", "error");
        return;
    }

    const startDate = selectedDates[0].format("YYYY-MM-DD") + " 00:00:00";
    const endDate = selectedDates[selectedDates.length - 1].format("YYYY-MM-DD") + " 23:59:59";

    setLoading(true);

    PutOptimalAssignmentsAlgo(startDate, endDate)
        .then((response) => {
            setLoading(false);

            Swal.fire({
                title: "האלגוריתם הורץ בהצלחה!",
                text: "נמצא שיבוץ אופטימלי לכל הניתוחים. האם תרצה להוריד את ההתאמות לאקסל?",
                icon: "success",
                showCancelButton: true,
                confirmButtonText: "כן, הורד אקסל",
                cancelButtonText: "לא, עבור ללוח ההתאמות",
            }).then((result) => {
                if (result.isConfirmed) {
                    downloadExcel(response);
                    navigate(`/weeklySchedule?startDate=${selectedDates[0].format("YYYY-MM-DD")}`);
                    window.location.reload();
                } else {
                    navigate(`/weeklySchedule?startDate=${selectedDates[0].format("YYYY-MM-DD")}`);
                    window.location.reload();
                }
            });
        })
        .catch((error) => {
            setLoading(false);
            console.error("Error in PutOptimalAssignmentsAlgo:", error);
            Swal.fire("שגיאה", "אירעה שגיאה בהרצת האלגוריתם.", "error");
        });
  };

  const downloadExcel = (assignments) => {
    const sortedAssignments = assignments.sort((a, b) => {
      const surgeryA = Object.values(events)
        .flat()
        .find((event) => event.Surgery_id === a.surgeryId);
      const surgeryB = Object.values(events)
        .flat()
        .find((event) => event.Surgery_id === b.surgeryId);
    
      if (!surgeryA || !surgeryB) return 0; // Return 0 if one or both surgeries are undefined
    
      return new Date(surgeryA.Surgery_date) - new Date(surgeryB.Surgery_date);
    });
    
    

    const data = sortedAssignments.map((assignment) => {
      const surgery = Object.values(events)
        .flat()
        .find((event) => event.Surgery_id === assignment.surgeryId);
    
      if (!surgery) return {}; // Handle the case where surgery is undefined
    
      return {
        "תאריך ושעת ניתוח": dayjs(surgery.Surgery_date).format("DD/MM/YYYY HH:mm"),
        פרוצדורות:
          Array.isArray(surgery.procedureName) && surgery.procedureName.length > 0
            ? surgery.procedureName.join(", ")
            : "אין פרוצדורות",
        "שם מנתח ראשי": getInternNameById(assignment.mainInternId),
        "שם עוזר ראשון": getInternNameById(assignment.firstAssistantInternId),
        "שם עוזר שני": getInternNameById(assignment.secondAssistantInternId),
      };
    });
    

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "שיבוץ ניתוחים");
    XLSX.writeFile(workbook, "Surgery_Assignments.xlsx");
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <div style={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            :)  טוען את ההתאמות של האלגוריתם, כבר מוכנים 
          </Typography>
        </div>
      </Backdrop>
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          direction: "rtl",
        }}
      >
        <Typography sx={{ textAlign: "right", flexGrow: 1, fontSize: 17 }}>
          לפניך לוח שנה המציג את כלל הניתוחים במערך הכירורגיה.
          <br />
          כדי לחשב שיבוץ מתמחים לניתוחים, בחר שבוע רלוונטי על ידי לחיצה
          וגרירה בלוח השנה ,ולאחר מכן לחץ על ←
          <Button
            variant="outlined"
            color="secondary"
            sx={{
              fontSize: 12,
              mr: 0.7,
              padding: 0.5,
              mt: { xs: 0.5, sm: -0.5 },
            }}
            onClick={handleOptimalAssignments}
          >
            חשב אלגוריתם שיבוץ
          </Button>
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            direction: "ltr",
          }}
        >
          <Typography variant="h4" sx={{ textAlign: "left", flexGrow: 1 }}>
            {currentMonth.format("MMMM YYYY")}
          </Typography>
          <Button onClick={handleNextMonth} aria-label="Next Month">
            <KeyboardArrowLeftIcon />
          </Button>
          <Button onClick={handleToday} aria-label="Today">
            <TodayIcon />
          </Button>
          <Button onClick={handlePrevMonth} aria-label="Previous Month">
            <KeyboardArrowRightIcon />
          </Button>
        </Box>
        <Grid
          container
          spacing={1}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          onTouchEnd={handleTouchEnd}
        >
          {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(
            (day, index) => (
              <Grid
                item
                xs={1.714}
                key={index}
                sx={{ textAlign: "center", fontWeight: "bold" }}
              >
                {day}
              </Grid>
            )
          )}
          {days.map((day) => (
            <Grid
              item
              xs={1.714}
              key={day.toString()}
              sx={{
                height: 90,
                border: "0.1px solid #ccc",
                backgroundColor: selectedDates.some((selectedDate) =>
                  selectedDate.isSame(day, "day")
                )
                  ? "#85c1e9"
                  : "transparent",
                "&:hover": {
                  overflowY: "auto",
                },
              }}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onTouchStart={() => handleTouchStart(day)}
              onTouchMove={handleTouchMove}
              data-date={day.format("YYYY-MM-DD")}
            >
              <Box
                component="div"
                role="button"
                sx={{
                  width: "100%",
                  height: "100%",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onClick={() => handleDayClick(day)}
                tabIndex={0}
                aria-label={`Select date ${day.format("D MMMM YYYY")}`}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12,
                    color: currentMonth.isSame(day, "month")
                      ? "text.primary"
                      : "grey.500",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    mr: 2,
                  }}
                >
                  {day.format("D")}
                </Typography>

                {events[day.format("YYYY-MM-DD")]?.map((event) => (
                  <Typography
                    key={event.Surgery_id} // שימוש ב-Surgery_id כמפתח ייחודי
                    variant="body2"
                    sx={{
                      color: "DarkBlue",
                      mt: 0.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      backgroundColor: event.isNewMatch
                        ? "Azure"
                        : "transparent",
                      fontSize: "11px",
                      mr: "2px",
                    }}
                  >
                    {event.displayText}
                  </Typography>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Dialog
          dir="rtl"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">ניתוחים</DialogTitle>
          <DialogContent>
            <List>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <React.Fragment key={event.Surgery_id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#85c1e9" }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ textAlign: "right" }}
                        primary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {`תאריך: ${dayjs(event.Surgery_date).format(
                                "DD/MM/YYYY"
                              )}, שעה: ${dayjs(event.Surgery_date).format(
                                "HH:mm"
                              )}, מיקום: ${event.Hospital_name}`}
                            </Typography>
                          </>
                        }
                        secondary={
                          <>
                            גיל המטופל: {event.Patient_age}
                            <br />
                            מספר תיק: {event.Case_number}
                            <br />
                            רמת קושי: {event.Difficulty_level}
                            <br />
                            פרוצדורות:{" "}
                            {Array.isArray(event.procedureName)
                              ? event.procedureName.join(", ")
                              : "אין פרוצדורות"}
                          </>
                        }
                      />
                      <Button
                        onClick={() => handleOpenAddDialog(event)}
                        color="primary"
                      >
                        עדכן
                      </Button>
                      <Button
                        onClick={() => handleOpenRemoveDialog(event)}
                        color="error"
                      >
                        מחק
                      </Button>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography>אין ניתוחים</Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              סגור
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          dir="rtl"
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          aria-labelledby="add-dialog-title"
        >
          <DialogTitle id="add-dialog-title">עדכן ניתוח</DialogTitle>
          <DialogContent dividers>
            <TextField
              margin="dense"
              label="תאריך"
              type="datetime-local"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={newSurgery.Surgery_date}
              onChange={(e) =>
                setNewSurgery({ ...newSurgery, Surgery_date: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="מיקום"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={newSurgery.Hospital_name}
              onChange={(e) =>
                setNewSurgery({ ...newSurgery, Hospital_name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="גיל המטופל"
              type="number"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={newSurgery.Patient_age}
              onChange={(e) =>
                setNewSurgery({ ...newSurgery, Patient_age: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="מספר תיק"
              type="number"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={newSurgery.Case_number}
              onChange={(e) =>
                setNewSurgery({ ...newSurgery, Case_number: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="רמת קושי"
              type="number"
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 3 } }}
              InputLabelProps={{
                shrink: true,
              }}
              value={newSurgery.Difficulty_level}
              onChange={(e) =>
                setNewSurgery({
                  ...newSurgery,
                  Difficulty_level: e.target.value,
                })
              }
            />
            <FormControl fullWidth margin="dense">
              <Autocomplete
                multiple
                id="procedure-name-autocomplete"
                options={procedures}
                getOptionLabel={(option) => option.procedureName}
                defaultValue={[]}
                value={newSurgery.procedureName.map(
                  (name) =>
                    procedures.find(
                      (procedure) => procedure.procedureName === name
                    ) || {
                      procedureName: name,
                    }
                )}
                onChange={(event, newValue) => {
                  setNewSurgery({
                    ...newSurgery,
                    procedureName: newValue.map(
                      (option) => option.procedureName
                    ),
                  });
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const tagProps = getTagProps({ index });
                    return (
                      <Chip
                        key={option.procedureName}
                        label={option.procedureName}
                        {...Object.keys(tagProps).reduce((acc, prop) => {
                          if (prop !== "key") acc[prop] = tagProps[prop];
                          return acc;
                        }, {})}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="פרוצדורות"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdateSurgery} color="primary">
              אשר
            </Button>
            <Button onClick={handleCloseAddDialog} color="secondary">
              בטל
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          dir="rtl"
          open={openRemoveDialog}
          onClose={handleCloseRemoveDialog}
          aria-labelledby="remove-dialog-title"
        >
          <DialogTitle id="remove-dialog-title">מחיקת ניתוח</DialogTitle>
          <DialogContent dividers>
            <Typography>האם אתה בטוח שברצונך למחוק את הניתוח הזה?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemoveSurgery} color="primary">
              כן
            </Button>
            <Button onClick={handleCloseRemoveDialog} color="secondary">
              לא
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
