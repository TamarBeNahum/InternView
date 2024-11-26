import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import logoImage from "/src/Image/doctor1.png";

import { useState, useEffect } from "react";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import logoInternView from "/src/Image/InternViewW.png";
import { GetInternByID } from "./Server.jsx";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HamburgerMenu from "./HamburgerMenu"; // Import the Hamburger Menu component

const settings = [
  {
    label: "\u00A0\u00A0ניהול משתמש",
    icon: <SettingsIcon />,
    action: "profile",
  },
  { label: "צפייה כמתמחה", icon: <RemoveRedEyeIcon />, action: "intern" },
  {
    label: "\u00A0\u00A0צפייה כמנהל",
    icon: <SupervisorAccountIcon />,
    action: "manager",
  },
  {
    label: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0התנתקות",
    icon: <ExitToAppIcon sx={{}} />,
    action: "logout",
  },
];

export default function MenuLogo({ role }) { // Use role prop
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);

  useEffect(() => {
    const internID = JSON.parse(sessionStorage.getItem("currentUserID"));

    GetInternByID(internID)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error("Error in GetInternByID: ", error);
      });
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (action) => {
    if (action === "logout") {
      sessionStorage.removeItem("currentUserID");
      navigate("/");
    } else if (action === "profile") {
      navigate('/profile', {
        state: {
          role: role
        }
      });
    } else if (action === "intern") {
      navigate("/intern");
    } else if (action === "manager") {
      navigate("/MangerPage");
    }
    handleCloseUserMenu();
  };

  const handleLogoClick = () => {
    if (currentUser?.isManager) {
      navigate(role === "intern" ? "/intern" : "/MangerPage");
    } else {
      navigate("/intern");
    }
  };

  const filteredSettings = currentUser?.isManager
    ? role === "intern"
      ? settings.filter((setting) => setting.action !== "intern")
      : settings.filter((setting) => setting.action !== "manager")
    : settings.filter(
        (setting) => setting.action !== "intern" && setting.action !== "manager"
      );

  return (
    <AppBar sx={{ marginBottom: 12 }}>
      <Container maxWidth="100%" sx={{ paddingLeft: 0 }}>
        <Toolbar disableGutters sx={{ paddingLeft: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", paddingLeft: 0 }}>
            {/* Hamburger Menu Component */}
            <HamburgerMenu role={role} /> {/* Pass role directly to HamburgerMenu */}

            <IconButton
              onClick={handleLogoClick}
              sx={{ p: 0, "&:focus": { outline: "none" }, marginLeft: -2 }} // Add negative margin here
              disableRipple
            >
              <img width="100px" src={logoInternView} alt="logo" />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {currentUser && (
              <Typography variant="h6" sx={{ textAlign: "center", mr: 1, fontSize: "19px" }}>
                👋 שלום, {currentUser.first_name + " " + currentUser.last_name}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Tooltip title="פתח הגדרות">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 1, "&:focus": { outline: "none" } }}
              >
                <Avatar src={logoImage} />
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: "30px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {filteredSettings.map((setting) => (
                <MenuItem
                  key={setting.label}
                  onClick={() => handleMenuItemClick(setting.action)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row-reverse",
                  }}
                >
                  <ListItemIcon sx={{ mr: -2, paddingLeft: 1 }}>
                    {setting.icon}
                  </ListItemIcon>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <ListItemText primary={setting.label} />
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
