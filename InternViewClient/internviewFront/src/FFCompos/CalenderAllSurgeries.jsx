import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import MenuLogo from "./MenuLogo.jsx";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TodayIcon from "@mui/icons-material/Today";
import { GetAllSurgeries } from "./Server.jsx";
import FloatingChatButton from "./FloatingChatButton";

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

export default function CalenderAllSurgeries() {
  const [events, setEvents] = useState({});
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    GetAllSurgeries()
      .then((data) => {
        // console.log("Fetched surgeries data:", data); // Debugging log
        let allEvents = {};
        data.forEach((surgery) => {
          if (surgery.Surgery_date) {
            // Ensure correct casing
            const dateKey = surgery.Surgery_date.slice(0, 10); // Extract date part
            if (!allEvents[dateKey]) {
              allEvents[dateKey] = [];
            }
            allEvents[dateKey].push({
              ...surgery,
              displayText: `ניתוח ב${surgery.Hospital_name}`, // Correct casing
              isNewMatch: surgery.newMatch === 1,
            });
          } else {
            console.warn("Surgery_date is missing for surgery:", surgery);
          }
        });
        setEvents(allEvents);
      })
      .catch((error) => {
        console.error("Error in GetAllSurgeries: ", error);
      });
  }, []);

  const handleDayClick = (day) => {
    const formattedDay = day.format("YYYY-MM-DD");
    setSelectedDayEvents(events[formattedDay] || []);
    setOpenDialog(true);
  };

  const days = generateCalendar(currentMonth);

  const handlePrevMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const handleToday = () => setCurrentMonth(dayjs());

  return (
    <>
      <MenuLogo />
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          mt: 7,
          direction: "rtl",
        }}
      >
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
          <Button onClick={handleNextMonth}>
            <KeyboardArrowLeftIcon />
          </Button>
          <Button onClick={handleToday}>
            <TodayIcon />
          </Button>
          <Button onClick={handlePrevMonth}>
            <KeyboardArrowRightIcon />
          </Button>
        </Box>
        <Grid container spacing={1}>
          {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(
            (day) => (
              <Grid
                item
                xs={1.714}
                key={day}
                sx={{ textAlign: "center", fontWeight: "bold" }}
              >
                {day}
              </Grid>
            )
          )}
          {days.map((day, index) => (
            <Grid
              item
              xs={1.714}
              key={index}
              sx={{
                height: 90,
                border: "0.1px solid #ccc",
                "&::-webkit-scrollbar": { display: "none" },
                "&:hover": { overflowY: "auto" },
                scrollBehavior: "smooth",
                overflowY: "auto",
                whiteSpace: "nowrap",
              }}
            >
              <Button
                dir="rtl"
                sx={{
                  width: "100%",
                  height: "100%",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
                onClick={() => handleDayClick(day)}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    color: currentMonth.isSame(day, "month")
                      ? "text.primary"
                      : "grey.500",
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                    mr: 2,
                  }}
                >
                  {day.format("D")}
                </Typography>

                {day &&
                  events[day.format("YYYY-MM-DD")] &&
                  events[day.format("YYYY-MM-DD")].map((event, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      sx={{
                        color: "DarkBlue",
                        mt: 0.2,
                        whiteSpace: "scroll",
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
              </Button>
            </Grid>
          ))}
        </Grid>
        <Dialog
          dir="rtl"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        >
          <DialogTitle>ניתוחים</DialogTitle>
          <DialogContent>
            <List>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "SkyBlue" }}>
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
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography>No events</Typography>
              )}
            </List>
          </DialogContent>
        </Dialog>
      </Box>
      <FloatingChatButton />
    </>
  );
}
