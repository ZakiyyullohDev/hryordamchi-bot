namespace AttendancesInterface {
    
    export interface ICheckEmployeeOldAttendancesPayloads {
        employeeId: string;
        attendanceTime: string;
        attendanceType: 'checkIn' | 'checkOut';
    }
    
}

export default AttendancesInterface