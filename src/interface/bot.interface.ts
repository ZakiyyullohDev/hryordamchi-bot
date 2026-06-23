namespace BotInterface {
    
    export interface setCommand {
        command: string;
        description: string;
    }
    
    export interface setKeyboardMarkup {
        text: string;
        request_contact?: boolean;
    }
    
    export interface Employee {
        employeeId: string;
        employeeFirstName: string;
        employeeLastName: string;
        employeeFatherName: string;
        workshiftId: string;
        employeeChatId?: number;
        companyId: string;
    }
    
    export interface Attendance {
        attendanceId: string;
        attendanceTime: string;
        attendanceType: "checkIn" | "checkOut";
        attendanceMessageId: number | null;
    }
    
    export interface AttendanceMessagePayloads {
        employee: Employee;
        attendance: Attendance;
    }

    export interface AttendaneLateDetectPayloads {
        employeeId: string;
        workshiftId: string;
    }
    
}

export default BotInterface