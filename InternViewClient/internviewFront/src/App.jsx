import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InternPage from "./FFCompos/InternPage";
import Login from "./FFCompos/Login";
import ProfileIntern from "./FFCompos/ProfileIntern";
import { useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TableFullSyllabus from "./FFCompos/TableFullSyllabus";
import ViewInterns from "./FFCompos/ViewInterns";
import MatchingAlgo from "./FFCompos/MatchingAlgo";
import CardsDetailsInterns from "./FFCompos/CardsDetailsInterns";
import Calendar from "./FFCompos/Calendar";
import ManagerOptions from "./FFCompos/ManagerOptions";
import MangerPage from "./FFCompos/MangerPage";
import AddInterns from "./FFCompos/AddInterns";
import ShowSyllabusPerIntern from "./FFCompos/ShowSyllabusPerIntern";
import CalenderAllSurgeries from "./FFCompos/CalenderAllSurgeries";

import InternScheduling from "./routingForAlgo/InternScheduling";
import AddSurgeries from "./FFCompos/AddSurgeries";
import SurgerySchedule from "./routingForAlgo/SurgerySchedule";
import WeightsSelection from "./routingForAlgo/WeightsSelection";
import WeeklySchedule from "./routingForAlgo/weeklySchedule";

const theme = createTheme({
  typography: {
    fontFamily: "Calibri",
  },
});

function App() {
  useEffect(() => {
    document.body.dir = "ltr";
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = "black";
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/ManagerOptions" element={<ManagerOptions />} />
          <Route path="/intern" element={<InternPage />} />
          <Route path="/MangerPage" element={<MangerPage />} />
          <Route path="/profile" element={<ProfileIntern />} />
          <Route path="/addIntern" element={<AddInterns />} />
          <Route path="/calender" element={<Calendar />} />
          <Route path="/TableFullSyllabus/:id" element={<TableFullSyllabus />} />
          <Route path="/ViewInterns" element={<ViewInterns />} />
          <Route path="/details/:id" element={<CardsDetailsInterns />} />
          <Route path="/MatchingAlgo" element={<MatchingAlgo />} />
          <Route path="/ShowSyllabusPerIntern" element={<ShowSyllabusPerIntern />} />
          <Route path="/ShowSyllabusPerIntern/:id" element={<ShowSyllabusPerIntern />} />
          <Route path="/CalenderAllSurgeries" element={<CalenderAllSurgeries />} />

          <Route path="/InternScheduling" element={<MatchingAlgo defaultComponent="internScheduling" />} />
          <Route path="/AddSurgeries" element={<AddSurgeries />} />
          <Route path="/SurgerySchedule" element={<MatchingAlgo defaultComponent="schedule" />} />
          <Route path="/WeeklySchedule" element={<MatchingAlgo defaultComponent="weeklySchedule" />} />
          <Route path="/weights" element={<MatchingAlgo defaultComponent="weights" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
