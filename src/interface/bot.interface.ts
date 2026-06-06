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
        attendanceTime: string;
        attendanceType: "checkIn" | "checkOut";
        employeeId: string;
        branchId: string;
        companyId: string;
    }
    
    export interface AttendanceMessagePayloads {
        employee: Employee;
        attendance: Attendance;
    }
    
}

export default BotInterface