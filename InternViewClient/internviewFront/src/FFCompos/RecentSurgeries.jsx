import * as React from 'react';
import { Typography, Box } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { api } from './Server';

// קומפוננטת 5 הניתוחים האחרונים
export default function RecentSurgeries() {
    const currentUserID = JSON.parse(sessionStorage.getItem('currentUserID'));
    const [timelineData, setTimelineData] = React.useState([]);

    React.useEffect(() => {
        fetch(`${api}Interns/FiveRecentInternSurgeries?internId=${currentUserID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json; charset=UTF-8',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setTimelineData(data.map(item => {
                    const [date, time] = item.surgery_date.split('T');
                    const [year, month, day] = date.split('-');
                    return {
                        ...item,
                        surgeryDate: `${day}-${month}-${year}`,
                        surgeryTime: time.split('.')[0] // Extract time and remove milliseconds
                    };
                }));
            })
            .catch(error => {
                console.error("Error in List 5 Recent Surgeries: ", error);
            });
    }, []);

    //פונקציה לצביעת הנקודות
    const getColor = (index) => {
        const colors = ['Plum', 'blue', 'green', 'SkyBlue', 'orange', 'yellow'];
        return colors[index % colors.length];
    };
    // רינדור של הקומפוננטה עם ציר הזמן והנתונים
    return (
        <>
            <h3>ניתוחים אחרונים</h3>
            <Box display="flex" justifyContent="flex-end" textAlign="right" sx={{ paddingTop: 1, paddingBottom: 3}}>
                <Timeline position="left">
                    {timelineData.map((item, index) => (
                        <TimelineItem key={index} style={{ minHeight: '0' }}>
                            <TimelineContent sx={{ py: '1px', px: 1, width: '100%' }}>
                                <Typography variant="h6" sx={{ fontSize: '1rem', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                                    {item.procedureName}
                                </Typography>
                                <Typography variant="h6" sx={{ fontSize: '0.85rem', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {`${item.surgeryTime} ${item.surgeryDate}`}
                                </Typography>
                            </TimelineContent>
                            <TimelineSeparator>
                                <TimelineDot style={{ backgroundColor: getColor(index), zIndex: '1' }} />
                                {index < timelineData.length - 1 && (
                                    <TimelineConnector style={{ position: 'absolute', height: '100%', top: '50%', transform: 'translateY(-50%)',paddingBottom:'25px' }} />
                                )}
                            </TimelineSeparator>
                        </TimelineItem>
                    ))}
                </Timeline>
            </Box>
        </>
    );
}