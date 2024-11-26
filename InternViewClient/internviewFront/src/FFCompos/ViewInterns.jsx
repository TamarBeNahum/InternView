import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuLogo from "./MenuLogo";
import { GetCountProceduresByIntern } from "./Server.jsx";
import DetailedSyllabusTable from "./TableFullSyllabus.jsx";
import FloatingChatButton from "./FloatingChatButton.jsx";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export default function ViewInterns() {
  const [data, setData] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [sortBy, setSortBy] = useState("ProcedureCount"); 
  const [selectedInternId, setSelectedInternId] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null); 

  const isXs = useMediaQuery("(max-width:600px)");
  const isMd = useMediaQuery("(min-width:600px) and (max-width:960px)");

  const navigate = useNavigate(); 

  let marginTop = "5%";
  if (isXs) {
    marginTop = "15%";
  } else if (isMd) {
    marginTop = "10%";
  }

  useEffect(() => {
    GetCountProceduresByIntern()
      .then((fetchedData) => {
        setData(fetchedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const userId = JSON.parse(sessionStorage.getItem("currentUserID"));
    setCurrentUserId(userId);
  }, []);

  const filteredData = data
    .filter(
      (item) =>
        item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        item.internId !== currentUserId
    )
    .sort((a, b) => {
      if (sortBy === "ProcedureCount") {
        return b.procedureCount - a.procedureCount;
      } else if (sortBy === "RemainingNeed") {
        return (
          b.overallNeed - b.procedureCount - (a.overallNeed - a.procedureCount)
        );
      }
    });

  const chartData = {
    labels: filteredData.map((item) => item.firstName),
    datasets: [
      {
        label: "בוצע",
        backgroundColor: "CornflowerBlue",
        borderColor: "DarkBlue",
        data: filteredData.map((item) => item.procedureCount),
        barThickness: 20,
      },
      {
        label: "חוסר",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        barThickness: 20,
        data: filteredData.map(
          (item) => item.overallNeed - item.procedureCount
        ),
      },
    ],
  };

  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        min: 0,
        max: 900,
        ticks: {
          stepSize: 100,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutCubic",
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const internId = filteredData[elementIndex].internId;
        navigate(`/ShowSyllabusPerIntern/${internId}`);
      }
    },
  };

  return (
    <>
      <MenuLogo />
      <h3 style={{ marginTop }}>התקדמות המתמחים</h3>
      <Box sx={{ m: 2, display: "flex", justifyContent: "center" }}>
        <FormControl sx={{ width: 300, m: 1 }}>
          <InputLabel>מיון</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="ProcedureCount">מספר פרודצורות שבוצעו</MenuItem>
            <MenuItem value="RemainingNeed">מספר פרודצורות שחסר</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="חיפוש שם מתמחה"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 200, m: 1, direction: "rtl" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Box
        sx={{
          display: "block",
          justifyContent: "center",
          width: "90%",
          maxWidth: "1200px",
          height: "400px",
          overflowX: "auto",
          overflowY: "visible",
          mb: 2,
          mx: "auto",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <Box
          sx={{
            minWidth: `${filteredData.length * 80}px`,
            margin: "0 auto",
            height: "100%",
          }}
        >
          <Bar data={chartData} options={options} />
        </Box>
      </Box>
      <FloatingChatButton />
    </>
  );
}
