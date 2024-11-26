import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TodayIcon from "@mui/icons-material/Today";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GetAllSurgeriesWithInterns,
  GetAllIntern,
  PutOptimalAssignmentsForUser
} from "../FFCompos/Server.jsx";
import Swal from "sweetalert2";

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function WeeklySchedule() {
  const queryParams = new URLSearchParams(location.search);
  const initialDate = queryParams.get("startDate")
    ? new Date(queryParams.get("startDate"))
    : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [surgeries, setSurgeries] = useState([]);
  const [interns, setInterns] = useState([]); // Adding state for interns
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [inputErrors, setInputErrors] = useState({
    Lead_Surgeon: false,
    First_Assistant: false,
    Second_Assistant: false,
  });

  useEffect(() => {
    // Fetch surgeries data on component mount
    GetAllSurgeriesWithInterns()
      .then((response) => {
        console.log("Surgeries response:", response);
        setSurgeries(response);
      })
      .catch(console.error);

    // Fetch interns data on component mount
    GetAllIntern()
      .then((response) => {
        console.log("Interns response:", response);
        setInterns(response);
      })
      .catch(console.error);
  }, []);

  const getWeekDates = () => {
    const startOfWeek = currentDate.getDate() - currentDate.getDay();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(startOfWeek + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  const weekDates = getWeekDates();

  const previousWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const nextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getSurgeriesForDate = (date) => {
    return surgeries
      .filter((surgery) => {
        const surgeryDate = new Date(surgery.Surgery_date);
        return (
          surgeryDate.getFullYear() === date.getFullYear() &&
          surgeryDate.getMonth() === date.getMonth() &&
          surgeryDate.getDate() === date.getDate()
        );
      })
      .sort((a, b) => new Date(a.Surgery_date) - new Date(b.Surgery_date)); // Sort surgeries by time
  };

  const handleOpenDialog = (surgery) => {
    setSelectedSurgery(surgery);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // reset the selected surgery and input errors
    setTimeout(() => {
        setSelectedSurgery(null);
        setInputErrors({ Lead_Surgeon: false, First_Assistant: false, Second_Assistant: false });
    }, 100); // Slight delay to ensure smooth closing
};


const handleSaveChanges = () => {
    if (selectedSurgery) {
        const surgeryId = selectedSurgery.Surgery_id;

        // בדיקת שיבוצים כפולים
        const internIds = [
            selectedSurgery.Lead_Surgeon?.Id,
            selectedSurgery.First_Assistant?.Id,
            selectedSurgery.Second_Assistant?.Id,
        ];

        const duplicateInterns = internIds.filter(
            (id, index) => id && internIds.indexOf(id) !== index
        );

        if (duplicateInterns.length > 0) {
            setInputErrors({
                Lead_Surgeon: duplicateInterns.includes(selectedSurgery.Lead_Surgeon?.Id),
                First_Assistant: duplicateInterns.includes(selectedSurgery.First_Assistant?.Id),
                Second_Assistant: duplicateInterns.includes(selectedSurgery.Second_Assistant?.Id),
            });

            Swal.fire({
                icon: "error",
                title: "שגיאה",
                text: "לא ניתן לבחור מתמחה ליותר מתפקיד אחד",
            });
            return;
        }

        const internAssignments = [
            {
                intern_role: "מנתח ראשי",
                intern_id: selectedSurgery.Lead_Surgeon?.Id,
            },
            {
                intern_role: "עוזר ראשון",
                intern_id: selectedSurgery.First_Assistant?.Id,
            },
            {
                intern_role: "עוזר שני",
                intern_id: selectedSurgery.Second_Assistant?.Id,
            },
        ];

        const validAssignments = internAssignments.filter(
            (assignment) => assignment.intern_id
        );

        Promise.all(
            validAssignments.map((assignment) =>
                PutOptimalAssignmentsForUser({
                    surgery_id: surgeryId,
                    intern_id: assignment.intern_id,
                    intern_role: assignment.intern_role,
                })
            )
        )
        .then((responses) => {
            const success = responses.some(response => response === true);

            if (success) {
                Swal.fire({
                    icon: "success",
                    title: "השיבוץ בוצע בהצלחה",
                    text: "השיבוץ נשמר בהצלחה!",
                });

                // עדכון הניתוח ברשימת הניתוחים
                setSurgeries((prevSurgeries) =>
                    prevSurgeries.map((surgery) =>
                        surgery.Surgery_id === surgeryId
                            ? { ...surgery, ...selectedSurgery }
                            : surgery
                    )
                );
            }

            handleCloseDialog();

        })
        .catch((error) => {
            console.error("Error updating assignments:", error);
        });
    }
};




  const handleInputChange = (field, value) => {
    setSelectedSurgery({
      ...selectedSurgery,
      [field]: value,
    });
  };

  function formatName(fullName) {
    const [firstName, lastName] = fullName.split(" ");
    return `${firstName} .${lastName.charAt(0)}.`;
  }

  return (
    <div style={styles.weeklySchedule}>
      <div style={styles.header}>
        <div style={styles.weekNavigation}>
          <Tooltip title="לתאריך הנוכחי" arrow>
            <div style={styles.todayButton} onClick={goToToday}>
              <TodayIcon style={styles.todayIcon} />
            </div>
          </Tooltip>
          <FiChevronRight style={styles.navIcon} onClick={previousWeek} />

          <div style={styles.dateDisplay}>
            {currentDate.toLocaleDateString("he-IL", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <FiChevronLeft style={styles.navIcon} onClick={nextWeek} />
        </div>
      </div>
      <div style={styles.gridContainer}>
        <div style={styles.daysColumn}>
          {weekDates.map((date, dayIndex) => (
            <div key={dayIndex} style={styles.dayColumn}>
              <div style={styles.dayHeader}>
                <div style={styles.dayName}>{daysOfWeek[dayIndex]}</div>
                <div style={styles.date}>
                  {date.toLocaleDateString("he-IL")}
                </div>
              </div>
              <div style={styles.dayCell}>
                {getSurgeriesForDate(date).map((surgery) => (
                  <div
                    key={surgery.Surgery_id}
                    style={styles.surgeryItem}
                    onClick={() => handleOpenDialog(surgery)} // Open dialog on clicking the entire item
                  >
                    <Accordion
                      onClick={(e) => e.stopPropagation()} // Prevent Accordion from opening dialog
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{ minHeight: "5px" }}
                      >
                        <div>
                          <strong>פרוצדורות</strong>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          maxHeight: "60px", // Set maximum height for AccordionDetails
                          overflowY: "auto", // Add scroll if content overflows
                          padding: "4px", // Reduce padding inside AccordionDetails
                        }}
                      >
                        <div>
                          {surgery.procedureName.join(", ")}
                          {/* Display all procedures */}
                        </div>
                      </AccordionDetails>
                    </Accordion>

                    <div style={styles.surgeryTime}>
                      {new Date(surgery.Surgery_date).toLocaleTimeString(
                        "he-IL",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </div>

                    <div>
                      <strong>גיל מטופל:</strong> {surgery.Patient_age}
                    </div>
                    <div>
                      <strong>מספר מקרה:</strong> {surgery.Case_number}
                    </div>
                    <div>
                      <strong>מנתח ראשי:</strong>{" "}
                      {surgery.Lead_Surgeon.id === 0
                        ? "ללא שיבוץ"
                        : formatName(surgery.Lead_Surgeon.Name)}
                    </div>
                    <div>
                      <strong>עוזר ראשון:</strong>{" "}
                      {surgery.First_Assistant.id === 0
                        ? "ללא שיבוץ"
                        : formatName(surgery.First_Assistant.Name)}
                    </div>
                    <div>
                      <strong>עוזר שני:</strong>{" "}
                      {surgery.Second_Assistant.id === 0
                        ? "ללא שיבוץ"
                        : formatName(surgery.Second_Assistant.Name)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog for editing surgery details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "80%",
            maxWidth: "600px",
            height: "auto",
            maxHeight: "90vh",
            padding: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{ direction: "rtl", fontSize: "1.5rem", fontWeight: "bold" }}
        >
          עריכת שיבוץ
        </DialogTitle>
        <DialogContent sx={{ direction: "rtl", paddingTop: "8px" }}>
          {selectedSurgery && (
            <>
              <FormControl
                fullWidth
                sx={{ marginBottom: "16px", marginTop: "10px" }}
                error={inputErrors.Lead_Surgeon}
              >
                <InputLabel id="lead-surgeon-label">מנתח ראשי</InputLabel>
                <Select
                  labelId="lead-surgeon-label"
                  value={selectedSurgery.Lead_Surgeon?.Id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedIntern = interns.find(
                      (intern) => intern.id === selectedId
                    );
                    handleInputChange("Lead_Surgeon", {
                      Id: selectedId,
                      Name: selectedIntern
                        ? `${selectedIntern.first_name} ${selectedIntern.last_name}`
                        : "",
                    });
                  }}
                  label="מנתח ראשי"
                  sx={{ minHeight: "48px" }}
                >
                  {interns.map((intern) => (
                    <MenuItem key={intern.id} value={intern.id}>
                      {`${intern.first_name} ${intern.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                sx={{ marginBottom: "16px" }}
                error={inputErrors.First_Assistant}
              >
                <InputLabel id="first-assistant-label">עוזר ראשון</InputLabel>
                <Select
                  labelId="first-assistant-label"
                  value={selectedSurgery.First_Assistant?.Id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedIntern = interns.find(
                      (intern) => intern.id === selectedId
                    );
                    handleInputChange("First_Assistant", {
                      Id: selectedId,
                      Name: selectedIntern
                        ? `${selectedIntern.first_name} ${selectedIntern.last_name}`
                        : "",
                    });
                  }}
                  label="עוזר ראשון"
                  sx={{ minHeight: "48px" }}
                >
                  {interns.map((intern) => (
                    <MenuItem key={intern.id} value={intern.id}>
                      {`${intern.first_name} ${intern.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth error={inputErrors.Second_Assistant}>
                <InputLabel id="second-assistant-label">עוזר שני</InputLabel>
                <Select
                  labelId="second-assistant-label"
                  value={selectedSurgery.Second_Assistant?.Id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedIntern = interns.find(
                      (intern) => intern.id === selectedId
                    );
                    handleInputChange("Second_Assistant", {
                      Id: selectedId,
                      Name: selectedIntern
                        ? `${selectedIntern.first_name} ${selectedIntern.last_name}`
                        : "",
                    });
                  }}
                  label="עוזר שני"
                  sx={{ minHeight: "48px" }}
                >
                  {interns.map((intern) => (
                    <MenuItem key={intern.id} value={intern.id}>
                      {`${intern.first_name} ${intern.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "space-between", padding: "8px 24px" }}
        >
          <Button onClick={handleCloseDialog} color="secondary">
            ביטול
          </Button>
          <Button
            onClick={handleSaveChanges}
            color="primary"
            variant="contained"
          >
            עדכון
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const styles = {
  weeklySchedule: {
    direction: "rtl",
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    padding: "0 20px",
    borderBottom: "2px solid #ddd",
  },
  dateDisplay: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#444",
    minWidth: "180px",
  },
  weekNavigation: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  navIcon: {
    fontSize: "24px",
    cursor: "pointer",
    color: "rgb(25 118 210)",
    margin: "0 15px",
  },
  gridContainer: {
    display: "flex",
    overflowX: "auto",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  daysColumn: {
    display: "flex",
    flex: 1,
  },
  dayColumn: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    borderLeft: "1px solid #ddd",
    minWidth: "120px",
  },
  dayHeader: {
    padding: "5px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f1f1f1",
    textAlign: "center",
  },
  dayCell: {
    padding: "10px",
    textAlign: "center",
    backgroundColor: "#fff",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  todayButton: {
    cursor: "pointer",
    padding: "10px",
    backgroundColor: "#f1f1f1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "10px",
  },
  todayIcon: {
    fontSize: "24px",
    color: "rgb(25 118 210)",
  },
  dayName: {
    fontWeight: "bold",
    color: "rgb(25 118 210)",
  },
  date: {
    fontSize: "14px",
    color: "#888",
  },
  surgeryItem: {
    backgroundColor: "rgb(215 233 255)",
    borderRadius: "4px",
    margin: "5px",
    padding: "4px",
    marginBottom: "10px",
    fontSize: "12px",
    textAlign: "right",
    position: "relative",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
  },
  surgeryTime: {
    position: "absolute",
    top: "-1px",
    right: "5px", // Changed from left to right
    fontSize: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "3px",
    zIndex: 1,
  },
};

export default WeeklySchedule;
