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
import { GetAllInternSurgeries } from "./Server.jsx";
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

export default function Calendar() {
  const internID = JSON.parse(sessionStorage.getItem("currentUserID"));
  const [events, setEvents] = useState({});
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    GetAllInternSurgeries(internID)
      .then((data) => {
        let allEvents = {};
        data.forEach((surgery) => {
          const dateKey = surgery.Surgery_date.slice(0, 10);
          if (!allEvents[dateKey]) {
            allEvents[dateKey] = [];
          }
          allEvents[dateKey].push({
            ...surgery,
            displayText: `ניתוח ב${surgery.Hospital_name}`,
            isNewMatch: surgery.newMatch === 1,
          });
        });
        setEvents(allEvents);
      })
      .catch((error) => {
        console.error("Error in GetAllInternSurgeries: ", error);
      });
  }, [internID]);

  const handleDayClick = (day) => {
    setSelectedDayEvents(events[day.format("YYYY-MM-DD")] || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const days = generateCalendar(currentMonth);

  const handlePrevMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const handleToday = () => setCurrentMonth(dayjs());

  return (
    <>
      <MenuLogo role="intern"/>
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
          sx={{ display: openDialog ? 'block' : 'none' }}
          onClose={handleCloseDialog} // Corrected to use the close handler
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
                        primary={event.secondaryText}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {`${event.Surgery_date.slice(11, 16)} ,${
                                event.Hospital_name
                              } (${event.Intern_role})  — `}
                            </Typography>
                            {`${event.procedureName.join(", ")}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography>אין ניתוחים</Typography>
              )}
            </List>
            <Button onClick={handleCloseDialog}>סגור</Button> {/* Corrected to use the close handler */}
          </DialogContent>
        </Dialog>
      </Box>
      <FloatingChatButton />
    </>
  );
}
