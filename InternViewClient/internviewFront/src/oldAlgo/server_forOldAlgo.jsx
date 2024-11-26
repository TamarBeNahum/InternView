
export const GetFutureSurgeries = () => {
    return fetch(`${api}Surgeries/GetFutureSurgeries`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json; charset=UTF-8',
        }
    }).then(response => {
        console.log("HTTP Status:", response.status); // Log the HTTP status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
        .then(data => {
            console.log("Response Data:", data); // Log the actual data received
            return data;
        })
        .catch(error => {
            console.error("Error in GetFutureSurgeries: ", error);
            throw error;
        });
};

//the interns of given ssurgery
export const GetSurgeryRoles = (surgeryID) => {
    return fetch(`${api}Surgeries/GetSurgeryRoles?surgery_id=${surgeryID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json; charset=UTF-8',
        }
    }).then(response => {
        console.log("HTTP Status:", response.status); // Log the HTTP status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error("Error in GetAllInternSurgeries: ", error);
            throw error;
        });
};

export const UpdateInternInSurgery = (match) => {
    console.log("match" ,JSON.stringify(match))
    return fetch(`${api}Interns/UpdateInternInSurgery`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json; charset=UTF-8',
        },
        
        body: JSON.stringify(match)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error in UpdateInternInSurgery: ", error.message);
            throw error;
        });
};