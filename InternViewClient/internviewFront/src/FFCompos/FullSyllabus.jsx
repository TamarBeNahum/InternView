import { Box, TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { getSyllabus } from './Server.jsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
//------------------------------------------------------------

Chart.register(CategoryScale, LinearScale, BarElement);

function FullSyllabus() {
  const [containerWidth, setContainerWidth] = useState(0); // State to track container width
  const chartContainerRef = useRef(null); // Ref to access container element

  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('procedureName'); // Default sort by procedureName
  const [searchQuery, setSearchQuery] = useState(''); // Query to search
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    getSyllabus(JSON.parse(sessionStorage.getItem('currentUserID')))
      .then((data) => {
        setData(data);
        // console.info(data);
      })
      .catch((error) => {
        console.error("Error in getSyllabusDetails: ", error);
      });
  }, []);

  //עדכון האלמנט של הגרף- רוחב מסך בהתאם לדפדפן
  useEffect(() => {
    //מטרתה לעדכן את הרוחב של התרשים
    const updateContainerWidth = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();

    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  ///אם אין דאטה מחובר אז תעשה טעינה
  if (!data) {
    // Render loading state until data is fetched
    return <p>Loading...</p>;
  }

  // Filtered data based on search query
  const filteredData = data.filter(item =>
    item.procedureName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort the data based on the selected criteria
  let sortedData = filteredData.sort((a, b) => {
    if (sortBy === 'procedureName') {
      return a.procedureName.localeCompare(b.procedureName);
    } else if (sortBy === 'haveDone') {
      return b.haveDone - a.haveDone;
    } else {
      return b.need - a.need;
    }
  });

  // If we want to show all
  // Extracting procedureNames, haveDone counts, and left counts from the sorted data
  // const procedureNames = sortedData.map(item => item.procedureName);
  // const haveDones = sortedData.map(item => item.haveDone);
  // const needs = sortedData.map(item => item.need);

  // Start
  // Calculate how much is left to do for each item
  const sortedDataByNeed = sortedData.map(item => ({
    ...item,
    remaining: item.need - item.haveDone
  }));

  // Sort the items based on how much is left to do
  sortedDataByNeed.sort((a, b) => b.remaining - a.remaining);

  // Select the top 10 items
  //מקבלים את ה10 הניתוחים הכי גבוהים 
  //top 10
  const topTenData = sortedDataByNeed.slice(0, 10);

  // Sort the data based on the selected criteria
  sortedData = topTenData.sort((a, b) => {
    if (sortBy === 'procedureName') {
      return a.procedureName.localeCompare(b.procedureName);
    } else if (sortBy === 'haveDone') {
      return b.haveDone - a.haveDone;
    } else {
      return b.need - a.need;
    }
  });

  // Extracting procedureNames, haveDone counts, and left counts from the top 10 data
  const procedureNames = topTenData.map(item => item.procedureName);
  const haveDones = topTenData.map(item => item.haveDone);
  const needs = topTenData.map(item => item.need);

  // End 

  // Creating data for the chart
  const chartData = {
    labels: procedureNames,
    datasets: [
      {
        label: 'ניתוחים שנעשו',
        // backgroundColor: 'rgba(54, 162, 235, 0.5)',
        // borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'CornflowerBlue',
        borderColor: 'DarkBlue',
        borderWidth: 1,
        data: haveDones,
        barPercentage: 0.8, // Adjust the width of the bars relative to the category width (80%)

      },
      {
        label: 'ניתוחים שנשארו',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        // backgroundColor: '	CornflowerBlue',
        // borderColor: 'DarkBlue',
        borderWidth: 1,
        data: needs,
        barPercentage: 0.8, // Adjust the width of the bars relative to the category width (80%)

      },
    ],
  };

  // Options for the chart Horizontal
  const chartOptions = {
    indexAxis: 'y', // Set index axis to 'y' to make the chart horizontal
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          // You can further customize the ticks as needed
          font: {
            size: 14, // Adjust font size
          },
          // אם יש טקסט ארוך אז מופיע נקודות כשהמסך קטן
          callback: function(value, index, values) {
            const label = procedureNames[index];
            let maxLength = 80; 
            const windowWidth = window.innerWidth;//גודל מסך של האתר 
            if(windowWidth > 1100) return label;
            if (windowWidth < 1100) {
              const widthDifference = 1100 - windowWidth;
              const lengthDecrease = Math.floor(widthDifference / 100) * 10;
              maxLength -= lengthDecrease;
            }
              if (label.length > maxLength) {
              return label.substring(0, maxLength) + '...';
            }
            return label;
          }
  
        },

      },
    },
    onClick: function (event, chartElement) {
      if (chartElement.length > 0 && window.innerWidth > 600) {
        // Need to remember to modify this by sync with the index in that chart and the index in the array ( to tget the procedure_id)
        const clickedIndex = chartElement[0].index;
        // Extract the item ID associated with the clicked bar
        const procedureId = topTenData[clickedIndex]?.procedure_Id; // Assuming each item has a unique ID property
        navigate(`/details/${procedureId}`, { state: { procedureId: procedureId , role: 'intern'} }); // Navigate to the details page using the item ID
      }
    },
    plugins: {
      legend: {
        position: 'top', 
      },
    },

  };


  const handleSearchInputChange = event => {
    setSearchQuery(event.target.value);
  };



  return (
    <Box>
      <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          מעקב אחר הניתוחים
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <FormControl sx={{ width: '50%' }}>
            <Box dir="rtl">
              <InputLabel sx={{ textAlign: 'right' }}>סידור לפי</InputLabel>
            </Box>
            <Select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              label="sortedby"
            >
              <MenuItem value="procedureName"> א-ב</MenuItem>
              <MenuItem value="haveDone">ביצוע</MenuItem>
              <MenuItem value="left">חוסר</MenuItem>
            </Select>
          </FormControl>

          <TextField
            sx={{ width: '50%' }}
            type="text"
            dir='rtl'
            placeholder="חיפוש"
            value={searchQuery}
            onChange={handleSearchInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FontAwesomeIcon icon={faSearch} style={{ color: 'gray' }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

      </Box>
      <Box sx={{ overflowY: 'auto', overflowX: "hidden", height: '500px' }} ref={chartContainerRef}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
}

export default FullSyllabus;
