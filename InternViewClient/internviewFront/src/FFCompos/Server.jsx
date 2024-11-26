// Define the base URLs for API endpoints
 const localHost = "https://localhost:7220/api/";
const ruppinApi = "https://proj.ruppin.ac.il/cgroup14/test2/tar1/api/";
//const railwayApi = "https://finalprojserver-production.up.railway.app/swagger/index.html";

///sfbfbdd
// Set the API to use, in this case, the local host API
export const api = localHost;

// Function to get intern details 
export const GetAllIntern = () => {
  return fetch(`${api}Interns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetAllIntern: ", error);
      throw error;
    });
};


// Function to get intern details by their ID
export const GetInternByID = (iternID) => {
  return fetch(`${api}Interns/GetInternByID/${iternID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetInternByID: ", error);
      throw error;
    });
};

// Function to get the syllabus for an intern by their ID
export const getSyllabus = (internId) => {
  return fetch(`${api}Interns/GetSyllabusOfIntern?internId=${internId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in getSyllabus: ", error);
      throw error;
    });
};

// Function to log in an intern
export const LogInIntern = (internId, password) => {
  const internObjectLogIn = {
    Id: internId,
    Password_i: password,
    First_name: "",
    Last_name: "",
    Interns_year: "",
    Interns_rating: 0,
    isManager: false,
    Email_i: "",
  };
  return fetch(`${api}Interns/LogInIntern`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
    body: JSON.stringify(internObjectLogIn),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      throw error;
    });
};

// Function to update intern details
export const updateIntern = (internID, formData, newPass) => {
  const internObjectUpdate = {
    Id: 0,
    Password_i: newPass,
    First_name: formData.first_name,
    Last_name: formData.last_name,
    Interns_year: "",
    Interns_rating: 0,
    isManager: false,
    Email_I: formData.email_i,
  };
  //console.log(internObjectUpdate);
  return fetch(`${api}Interns/updateIntern/${internID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(internObjectUpdate),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in updateIntern: ", error);
      throw error;
    });
};

// Function to update an intern's password
export const updateInternPassword = (email, password) => {
  return fetch(`${api}Interns/UpdateInternPassword/${email}/${password}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in updateIntern: ", error);
      throw error;
    });
};

// Function to get the count of procedures by intern
export const GetCountProceduresByIntern = () => {
  return fetch(`${api}Interns/GetInternProcedureCounter`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetCountProceduresByIntern: ", error);
      throw error;
    });
};

// Function to get the detailed syllabus for an intern
export const getDetailedSyllabusOfIntern = (internId) => {
  return fetch(
    `${api}Interns/fullDetailedSyllabusOfIntern?internID=${internId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in getDetailedSyllabusOfIntern: ", error);
      throw error;
    });
};

// Function to get surgeries by intern and procedure
export const GetInternSurgeriesByProcedure = (internId, procedure_Id) => {
  return fetch(
    `${api}Interns/GetInternSurgeriesByProcedure/${procedure_Id}/${internId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
      },
    }
  )
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response Data:", data); // Log the actual data received
      return data;
    })
    .catch((error) => {
      console.error("Error in GetInternSurgeriesByProcedure: ", error);
      throw error;
    });
};

// Function to get a list of interns for chat
export const GetInternsForChat = (internId) => {
  return fetch(`${api}Interns/GetInternsForChat?id=${internId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetInternSurgeriesByProcedure: ", error);
      throw error;
    });
};

// Function to get all procedure names
export const GetAllProcedure = () => {
  return fetch(`${api}Procedure/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetAllNameProcedure: ", error);
      throw error;
    });
};

// Function to get surgeries by intern and procedure name
export const GetInternSurgeriesByProcedureName = (internId, procedure_Name) => {
  return fetch(
    `${api}Interns/GetInternSurgeriesByProcedureName/${procedure_Name}/${internId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
      },
    }
  )
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response Data:", data); // Log the actual data received
      return data;
    })
    .catch((error) => {
      console.error("Error in GetInternSurgeriesByProcedureName: ", error);
      throw error;
    });
};

// Function to get all interns
export const GetInterns = () => {
  return fetch(`${api}Interns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response Data:", data); // Log the actual data received
      return data;
    })
    .catch((error) => {
      console.error("Error in GetFutureSurgeries: ", error);
      throw error;
    });
};

// Function to get all surgeries for an intern
export const GetAllInternSurgeries = (internID) => {
  return fetch(`${api}Interns/AllInternSurgeries?internId=${internID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response Data:", data); // Log the actual data received
      return data;
    })
    .catch((error) => {
      console.error("Error in GetAllInternSurgeries: ", error);
      throw error;
    });
};

// Function to add a new intern
export const AddIntern = (intern) => {
  const internObjectToAdd = {
    Id: intern.internId,
    Password_i: intern.password,
    First_name: intern.first_name,
    Last_name: intern.last_name,
    Interns_year: intern.InternshipDate,
    Interns_rating: intern.rating,
    isManager: intern.isManager,
    Email_i: intern.email_i,
  };
  return fetch(`${api}Interns/AddIntern`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
    body: JSON.stringify(internObjectToAdd),
  })
    .then((response) => {
     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      throw error;
    });
};

// Function to update algorithm weights
export const Update_Algorithm_Weights = (weights) => {
  const weightObjectUpdate = {
    Skills: weights.Skills,
    YearWeight: weights.YearWeight,
    YearDifficulty: weights.YearDifficulty,
    SyllabusWeight: weights.SyllabusWeight,
  };

  return fetch(`${api}Algorithm/updateAlgorithmWeights/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(weightObjectUpdate),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in Update_Algorithm_Weights: ", error);
      throw error;
    });
};

// Function to get algorithm weights
export const Get_Algorithm_Weights = () => {
  return fetch(`${api}Algorithm/Get_All_Algorithm_Weights`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  })
    .then((response) => {
      console.log("HTTP Status:", response.status); // Log the HTTP status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response Data:", data); // Log the actual data received
      return data;
    })
    .catch((error) => {
      console.error("Error fetching weights:", error);
      throw error;
    });
};

// Function to get all surgeries With Procedures
export const GetAllSurgeriesWithProcedures = () => {
  
  return fetch(`${api}Surgeries/GetAllSurgeriesWithProcedures`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetAllSurgeriesWithProcedures: ", error);
      throw error;
    });
};


// Function to get all surgeries
export const GetAllSurgeries = () => {
  
  return fetch(`${api}Surgeries/GetAllSurgeries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetAllSurgeries: ", error);
      throw error;
    });
};


//function to ADD surgery
export const InsertSurgery = (Surgery) => {
  //console.log("Surgery" , Surgery);
  return fetch(`${api}Surgeries/AddSurgery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Surgery),   
  })
    .then((response) => {
      console.log(Surgery)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in InsertSurgery: ", error);
      throw error;
    });
  
};

//function to ADD surgery
export const AddProcedureInSurgery = (surgery_id , procedure_Id) => {
  //console.log("surgery_id , procedure_Id" ,surgery_id ,procedure_Id );
  return fetch(`${api}Surgeries/AddProcedureInSurgery/${surgery_id}/${procedure_Id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },  
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in InsertSurgery: ", error);
      throw error;
    });
  
};


//function to ADD Intern Duty Schedule
export const AddInternDutySchedule = (Scheduling) => {
  return fetch(`${api}InternsShiftsSchedule/AddInternDutySchedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Scheduling),   
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in InsertSurgery: ", error);
      throw error;
    });
};

//function to get all Intern Duty Schedule
export const GetAllInternsDutySchedule = () => {
  return fetch(`${api}InternsShiftsSchedule/GetAllInternsDutySchedule`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },  
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in InsertSurgery: ", error);
      throw error;
    });
  
};

//function to get all Intern Duty Schedule
export const RemoveInternDutySchedule = (obj) => {
  return fetch(`${api}InternsShiftsSchedule/DeleteInternDutySchedule`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },  
    body: JSON.stringify(obj),   
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in InsertSurgery: ", error);
      throw error;
    });
  
};



//function Delete Surgery From Surgeries Schedule
export const DeleteSurgeryFromSurgeriesSchedule = (surgery_id) => {
  return fetch(`${api}Surgeries/DeleteSurgeryFromSurgeriesSchedule/${surgery_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },  
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in DeleteSurgeryFromSurgeriesSchedule: ", error);
      throw error;
    });
  
};


// Function to update Surgeries details
export const UpdateSurgeries = (Surgery_id, formData) => {
  const SurgeryObjectUpdate = {
    Surgery_id: Surgery_id,
    Patient_age: formData.Patient_age,
    Difficulty_level: formData.Difficulty_level,
    Case_number: formData.Case_number,
    Surgery_date: formData.Surgery_date,
    Hospital_name: formData.Hospital_name || "הלל יפה",
  };

  return fetch(`${api}Surgeries/UpdateSurgeries/${Surgery_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(SurgeryObjectUpdate),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in UpdateSurgeries: ", error);
      throw error;
    });
};


//function add or update interns in gurgery made by the algorithm
export const PutOptimalAssignmentsAlgo = (startDate, endDate) => {
  console.log(startDate, endDate);

  const formattedStartDate = encodeURIComponent(startDate);
  const formattedEndDate = encodeURIComponent(endDate);

  const url = `${api}Algorithm/GetOptimalAssignments/${formattedStartDate}/${formattedEndDate}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in PutOptimalAssignmentsAlgo: ", error);
      throw error;
    });
};

export const GetAllSurgeriesWithInterns = () => {
  const url = `${api}Surgeries/AllSurgeriesWithInterns`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in GetAllSurgeriesWithInterns: ", error);
      throw error;
    });
};


//function to update interns in gurgery by the user
export const PutOptimalAssignmentsForUser = (internInSurgery) => {
  return fetch(`${api}Interns/UpdateOrAddInternInSurgery`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },  
    body: JSON.stringify(internInSurgery),   
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error in PutOptimalAssignmentsForUser: ", error);
      throw error;
    });
};
