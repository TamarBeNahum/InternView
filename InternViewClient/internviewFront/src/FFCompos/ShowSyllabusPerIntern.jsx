import React, { useEffect, useState, useMemo } from "react";
import MenuLogo from "./MenuLogo";
import HamburgerMenu from "./HamburgerMenu"; // Import the HamburgerMenu component
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { GetInterns } from "./Server.jsx";
import DetailedSyllabusTable from "./TableFullSyllabus.jsx";
import { useParams } from "react-router-dom";

export default function ShowSyllabusPerIntern() {
  const [data, setData] = useState([]); // Data from server
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [selectedInternDetails, setSelectedInternDetails] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const { id } = useParams(); // Get the internId from the URL, if provided
  
  useEffect(() => {
    // Fetch data from the server
    async function fetchData() {
      try {
        const result = await GetInterns();
        setData(result);
        if (id) {
          const selectedIntern = result.find((intern) => intern.id === parseInt(id));
          if (selectedIntern) {
            setSelectedInternId(selectedIntern.id);
            setSelectedInternDetails(selectedIntern);
          }
        }
      } catch (error) {
        setError("Failed to fetch interns");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleAutocompleteChange = (event, value) => {
    if (value === null) {
      setSelectedInternId(null);
      setSelectedInternDetails(null);
    } else {
      const selectedIntern = data.find(
        (intern) => `${intern.first_name} ${intern.last_name}` === value
      );
      if (selectedIntern) {
        setSelectedInternId(selectedIntern.id);
        setSelectedInternDetails(selectedIntern);
      }
    }
  };

  const options = useMemo(
    () => data.map((option) => `${option.first_name} ${option.last_name}`),
    [data]
  );

  return (
    <>
      <MenuLogo role="manager"/>
      {/* <HamburgerMenu  /> הצגת תפריט מותאם למנהל */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "240px",
          mt: 5,
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={600}>
          צפייה בסילבוס של מתמחה
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Autocomplete
            options={options}
            renderInput={(params) => (
              <TextField {...params} label="בחר מתמחה" variant="outlined" />
            )}
            sx={{ width: 300, m: 2, direction: "rtl" }}
            onChange={handleAutocompleteChange}
            value={
              selectedInternDetails
                ? `${selectedInternDetails.first_name} ${selectedInternDetails.last_name}`
                : null
            }
          />
        )}
      </Box>
      {selectedInternDetails && (
        <>
          <Box
            sx={{
              m: 4,
              display: "flex",
              justifyContent: "center",
              marginTop: -13,
            }}
          >
           <DetailedSyllabusTable propsInternId={selectedInternId} role="manager" /> {/* Updated prop name */}
          </Box>
        </>
      )}
    </>
  );
}
