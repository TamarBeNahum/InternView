import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { getDetailedSyllabusOfIntern } from "./Server.jsx";
import MenuLogo from "../FFCompos/MenuLogo";
import "../App.css";
import FloatingChatButton from "./FloatingChatButton";
/* icons */
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
  VerticalAlignBottom as VerticalAlignBottomIcon,
  ImportExport as ImportExportIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
/* mui material */
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
//-----------------------------------------------------------

function displayColor(requiredAsPosition) {
  return requiredAsPosition === 0 ? "grey" : "black";
}

function displayBackground(pos1, pos2) {
  if (pos1 != 0) {
    return pos1 <= pos2 ? "#90ee90" : "white";
  }
  return "white";
}

//פונקציה להמרת מערך הנתונים
//ממירה את המערך הנתונים מהשרת לפורמט שניתן להציג כטבלה
function transformArray(procedures) {
  let result = [];
  // Iterate through the array while looking for consecutive pairs
  for (let i = 0; i < procedures.length; i++) {
    let currentP = procedures[i];
    let nextP = procedures[i + 1];
    if (currentP.category_Id == 0) {
      //למי שאין קטגוריה
      currentP["expandable"] = false;
      result.push(currentP);
      continue;
    } else if (currentP.category_Id === nextP.category_Id) {
      //למי שיש קטגוריה
      let combinedProcedure = {
        procedureName: currentP.categoryName,
        requiredAsMain: currentP.requiredAsMain + nextP.requiredAsMain,
        doneAsMain: currentP.doneAsMain + nextP.doneAsMain,
        requiredAsFirst: currentP.categoryRequiredFirst,
        doneAsFirst: currentP.doneAsFirst + nextP.doneAsFirst,
        requiredAsSecond: currentP.categoryRequiredSecond,
        doneAsSecond: currentP.doneAsSecond + nextP.doneAsSecond,
        expandable: true,
        category: [
          {
            id: currentP.procedure_Id,
            name: currentP.procedureName,
            requiredAsMain: currentP.requiredAsMain,
            doneAsMain: currentP.doneAsMain,
            doneAsFirst: currentP.doneAsFirst,
            doneAsSecond: currentP.doneAsSecond,
          },
          {
            id: nextP.procedure_Id,
            name: nextP.procedureName,
            requiredAsMain: nextP.requiredAsMain,
            doneAsMain: nextP.doneAsMain,
            doneAsFirst: nextP.doneAsFirst,
            doneAsSecond: nextP.doneAsSecond,
          },
        ],
      };
      result.push(combinedProcedure);
    }
  }
  return result;
}

export default function DetailedSyllabusTable({ propsInternId, role: propsRole }) {
  const [data, setData] = useState([]);
  const location = useLocation();
  const role = propsRole || (location.state && location.state.role) || "intern";


  let internIdFromBar = propsInternId;
  let internID =
    internIdFromBar == undefined
      ? JSON.parse(sessionStorage.getItem("currentUserID"))
      : internIdFromBar;

  useEffect(() => {
    getDetailedSyllabusOfIntern(internID) //הבאת הפרוצדורות של המתמחה
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error("Error in getDetailedSyllabusOfIntern: ", error);
      });
  }, [internID]);
  const rows = transformArray(data);

  function Row(props) {
    console.log(role, "role")
    const navigate = useNavigate();
    const { row } = props;
    const [open, setOpen] = useState(false);
    const handleRowClick = (procedureId) => {
      console.log('Row clicked', procedureId);  // Add this
      if (procedureId) {
        console.log("Navigating with role:", role);
        navigate(`/details/${procedureId}`, {
          state: {
            procedureId,
            internsID,
            role,
          },
        });
      }
    };

    let pName = row.procedureName;
    let reqAsAdmin = row.requiredAsMain;
    let doneAsAsmin = row.doneAsMain;
    let reqAsFirst = row.requiredAsFirst;
    let doneAsFirst = row.doneAsFirst;
    let reqAsSecond = row.requiredAsSecond;
    let doneAsSecond = row.doneAsSecond;
    return (
      <React.Fragment>
        <TableRow >
          {row.expandable ? (
            <TableCell align="right">
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
          ) : (
            <TableCell />
          )}
          <TableCell
            align="right"
            component="th"
            scope="row"
            className="borderLeft"
            style={{
              cursor: row.procedure_Id ? "pointer" : "default",
              color: row.procedure_Id ? "blue" : "black",
              textDecoration: row.procedure_Id ? "underline" : "none",
            }}
            onClick={() => {
              console.log('TableCell clicked');
              handleRowClick(row.procedure_Id);
            }}
          >
            {pName}
          </TableCell>


          <TableCell
            align="center"
            style={{
              padding: 0,
              color: displayColor(reqAsAdmin),
              background: displayBackground(reqAsAdmin, doneAsAsmin),
            }}
          >
            {reqAsAdmin || "▬▬▬"}{" "}
          </TableCell>
          <TableCell
            align="center"
            className="borderLeft"
            style={{
              padding: 0,
              color: displayColor(reqAsAdmin),
              background: displayBackground(reqAsAdmin, doneAsAsmin),
            }}
          >
            {/* {reqAsAdmin === 0 ? "▬▬▬" : doneAsAsmin}  */} {doneAsAsmin}
          </TableCell>

          <TableCell
            align="center"
            style={{
              padding: 0,
              color: displayColor(reqAsFirst),
              background: displayBackground(reqAsFirst, doneAsFirst),
            }}
          >
            {reqAsFirst || "▬▬▬"}{" "}
          </TableCell>
          <TableCell
            align="center"
            className="borderLeft"
            style={{
              padding: 0,
              color: displayColor(reqAsFirst),
              background: displayBackground(reqAsFirst, doneAsFirst),
            }}
          >
            {/* {reqAsFirst === 0 ? "▬▬▬" : doneAsFirst}  */} {doneAsFirst}
          </TableCell>

          <TableCell
            align="center"
            style={{
              padding: 0,
              color: displayColor(reqAsSecond),
              background: displayBackground(reqAsSecond, doneAsSecond),
            }}
          >
            {reqAsSecond || "▬▬▬"}{" "}
          </TableCell>
          <TableCell
            align="center"
            style={{
              padding: 0,
              color: displayColor(reqAsSecond),
              background: displayBackground(reqAsSecond, doneAsSecond),
            }}
          >
            {/* {reqAsSecond === 0 ? "▬▬▬" : doneAsSecond}  */} {doneAsSecond}
          </TableCell>
        </TableRow>

        {row.expandable && (
          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    component="div"
                    align="right"
                  >
                    קטגוריה
                  </Typography>
                  <Table size="small" aria-label="purchases">
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">שם ניתוח</TableCell>
                        <TableCell align="right">דרישה כראשי</TableCell>
                        <TableCell align="right">נעשה כראשי</TableCell>
                        <TableCell align="right">נעשה כעוזר ראשון</TableCell>
                        <TableCell align="right">נעשה כעוזר שני</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.category.map((categoryRow) => {
                        // console.log(categoryRow);
                        return (
                          <TableRow key={categoryRow.name}>
                            <TableCell
                              component="th"
                              scope="row"
                              align="right"
                              style={{
                                cursor: categoryRow.id ? "pointer" : "default",
                                color: categoryRow.id ? "blue" : "black",
                                textDecoration: categoryRow.id
                                  ? "underline"
                                  : "none",
                              }}
                              onClick={() =>
                                categoryRow.id
                                  ? navigate(`/details/${categoryRow.id}`, {
                                    state: {
                                      procedureId: categoryRow.id, internID, role
                                    },
                                  })
                                  : null
                              }
                            >
                              {" "}
                              {categoryRow.name}
                            </TableCell>
                            <TableCell align="right">
                              {categoryRow.requiredAsMain}
                            </TableCell>
                            <TableCell align="right">
                              {categoryRow.doneAsMain}
                            </TableCell>
                            <TableCell align="right">
                              {categoryRow.doneAsFirst}
                            </TableCell>
                            <TableCell align="right">
                              {categoryRow.doneAsSecond}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  }

  ///////// סינון ניתוחים /////////
  const [searchValue, setSearchValue] = useState("");

  const onChangeSearch = (event) => {
    setSearchValue(event.target.value.toLowerCase());
  };

  // מחזיר את כל השורות שיש בהם את הערך המוקלד בחיפוש
  const filteredRows = rows.filter((row) => {
    return row.procedureName.toLowerCase().includes(searchValue);
  });

  ///////// מיון ניתוחים /////////
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });

  //כמו יוז אפקט רק שמחזיר ערך ועדיף לחישובים במהלך רדנורים
  const sortedRows = useMemo(() => {
    let sortableItems = [...filteredRows]; //כדי שיהיה אפשר לעשות מיון על הסינון שהמשתמש בחר
    if (sortConfig.direction !== "none" && sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        //מיון לפי שם העמודה
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRows, sortConfig]); //מחושב מחדש בכל שינוי של המשתנים הללו

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      direction = "none"; // Resetting to default sorting
      key = "procedureName"; // Default sort key
    }
    setSortConfig({ key, direction });
  };

  function ButtonSort({ colName }) {
    return (
      <IconButton onClick={() => requestSort(colName)}>
        {/* השמה של החץ המתאים - עולה או יורד */}
        {sortConfig.key === colName ? (
          sortConfig.direction === "ascending" ? (
            <VerticalAlignTopIcon />
          ) : sortConfig.direction === "descending" ? (
            <VerticalAlignBottomIcon />
          ) : (
            <ImportExportIcon />
          )
        ) : (
          <ImportExportIcon />
        )}
      </IconButton>
    );
  }

  return (
    <>
      <MenuLogo role={role} />
      <Grid container spacing={2}>
        <Box display="flex" justifyContent="center">
          <Grid item xs={11} alignItems="center">
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: "86px",
                mb: "40px",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchValue("");
                }}
                sx={{ mr: 1 }}
              >
                נקה
              </Button>
              <TextField
                label="חיפוש ניתוח"
                variant="outlined"
                value={searchValue}
                onChange={onChangeSearch}
                sx={{ width: 250, direction: "rtl" }}
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
                  shrink: true, // This will make the label always appear above the TextField
                }}
              />
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 620,
                mb: "100px",
                direction: "rtl",
                overflowX: "auto",
              }}
            >
              <Table
                stickyHeader
                aria-label="collapsible table"
                sx={{ tableLayout: "fixed", overflow: "scroll" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="right"
                      width="2%"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    />
                    <TableCell
                      align="right"
                      width="20%"
                      className="custom-cell, borderLeft"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      שם הניתוח
                    </TableCell>
                    <TableCell
                      align="center"
                      width="11%"
                      className="custom-cell"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        {" "}
                        דרישה כראשי
                      </div>
                      <ButtonSort colName="requiredAsMain" />
                    </TableCell>
                    <TableCell
                      align="center"
                      width="11%"
                      className="custom-cell , borderLeft"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ display: "inline-block" }}>נעשה כראשי</div>
                      <ButtonSort colName="doneAsMain" />
                    </TableCell>
                    <TableCell
                      align="center"
                      width="14%"
                      className="custom-cell"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        דרישה כעוזר ראשון{" "}
                      </div>
                      <ButtonSort colName="requiredAsFirst" />
                    </TableCell>
                    <TableCell
                      align="center"
                      width="14%"
                      className="custom-cell , borderLeft"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        נעשה כעוזר ראשון
                      </div>
                      <ButtonSort colName="doneAsFirst" />
                    </TableCell>
                    <TableCell
                      align="center"
                      width="14%"
                      className="custom-cell"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        נדרש כעוזר שני
                      </div>
                      <ButtonSort colName="requiredAsSecond" />
                    </TableCell>
                    <TableCell
                      align="center"
                      width="11%"
                      className="custom-cell"
                      sx={{
                        backgroundColor: "#2083e4",
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      נעשה כעוזר שני
                      <ButtonSort colName="doneAsSecond" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows.map((row, index) => {
                    return <Row key={row.procedureId || index} row={row} />;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Box>

        <FloatingChatButton />
      </Grid>
    </>
  );
}
