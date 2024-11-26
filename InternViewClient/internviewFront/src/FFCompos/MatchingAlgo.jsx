import React, { useState, useEffect } from "react";
import { Container, Grid, Box } from "@mui/material";
import MenuLogo from "../FFCompos/MenuLogo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PeopleIcon from "@mui/icons-material/People";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import WeightsSelection from "../routingForAlgo/WeightsSelection";
import SurgerySchedule from "../routingForAlgo/SurgerySchedule";
import InternScheduling from "../routingForAlgo/InternScheduling";
import WeeklySchedule from "../routingForAlgo/weeklySchedule";
import ScaleIcon from '@mui/icons-material/Scale';
import { CalendarMonth } from "@mui/icons-material";
import FloatingChatButton from "./FloatingChatButton";

export default function MatchingAlgo({ defaultComponent }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedComponent, setSelectedComponent] = useState(
    defaultComponent || "schedule"
  );

  // Watch for changes in the defaultComponent prop
  useEffect(() => {
    if (defaultComponent) {
      setSelectedComponent(defaultComponent);
    }
  }, [defaultComponent]);

  const handleComponentChange = (component) => {
    setSelectedComponent(component);
  };

  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "weights":
        return <WeightsSelection />;
      case "weeklySchedule":
        return <WeeklySchedule />;
      case "schedule":
        return <SurgerySchedule />;
      case "internScheduling":
        return <InternScheduling />;
      default:
        return null;
    }
  };

  const renderButtons = () => {
    const buttonOrder = [
      "weeklySchedule",
      "weights",
      "internScheduling",
      "schedule",
    ];

    return buttonOrder.map((buttonType, index) => (
      <React.Fragment key={buttonType}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            width: { xs: "45%", sm: "170px" },
            height: { xs: "45px", sm: "45px" },
            borderRadius: "15px",
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: selectedComponent === buttonType ? "#1976d2" : "#90caf9",
            padding: "5px 10px",
            cursor: "pointer",
            textAlign: "center",
            lineHeight: "1",
            fontWeight: "bold",
            fontSize: { xs: "13px", sm: "14px" },
            transition: "background-color 0.3s, border-color 0.3s",
            gap: "8px",
            color: "#000",
            backgroundColor: selectedComponent === buttonType ? "#85beed" : "transparent",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            margin: isMobile ? "5px" : "0",
          }}
          onClick={() => handleComponentChange(buttonType)}
        >
          {getIconForButton(buttonType)}
          {getLabelForButton(buttonType)}
        </Box>

        {!isMobile && index < buttonOrder.length - 1 && (
          <Box
            sx={{ width: "80px", height: "2px", backgroundColor: "#90caf9" }}
          />
        )}
      </React.Fragment>
    ));
  };

  const getIconForButton = (buttonType) => {
    switch (buttonType) {
      case "weeklySchedule":
        return <CalendarMonth />;
      case "weights":
        return <ScaleIcon />;
      case "internScheduling":
        return <PeopleIcon />;
      case "schedule":
        return <DashboardCustomizeIcon />;
      default:
        return null;
    }
  };

  const getLabelForButton = (buttonType) => {
    switch (buttonType) {
      case "weeklySchedule":
        return "התאמות הניתוחים";
      case "weights":
        return "בחירת משקלים לשיבוץ";
      case "internScheduling":
        return "הוספת תורנויות";
      case "schedule":
        return "לוח ניתוחים לשיבוץ";
      default:
        return "";
    }
  };

  return (
    <>
      <MenuLogo />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: { xs: "row", sm: "row" },
              flexWrap: "wrap",
              gap: { xs: 2, md: 3 },
            }}
          >
            {renderButtons()}
          </Box>

          <Grid item xs={12}>
            {renderSelectedComponent()}
          </Grid>
        </Grid>
      </Container>
      <FloatingChatButton />
    </>
  );
}
