import TelegramBot from 'node-telegram-bot-api';

import DatabaseFunctions from '@database/functions.database';
import WorkshiftsQuery from '@query/workshifts.query';
import AttendanceQuery from '@query/attendance.query';
import EmployeesQuery from "@query/employees.query";
import GlobalUtils from '@util/util';

namespace TelegramCronjob {
    
    export async function runner(bot: TelegramBot) {
        await sendNotComeWarningMessage(bot)
        await sendNotLeaveWarningMessage(bot)
    }
    
    export async function resendAttendanceMessages(bot: TelegramBot) {
        const notSendedAttendanceMessages = await AttendanceQuery.getNotSendedAttendancesMessages();
        if (!notSendedAttendanceMessages.length) {
            return;
        }
        
        for (const item of notSendedAttendanceMessages) {
            
            try {
                const { date, timeWithoutSeconds } = GlobalUtils.getDateAndTime(item.attendanceTime);
                const checkType = item.attendanceType === 'checkIn' ? '✅ <b>Ishga Kelish qayd etildi</b>' : '👋 <b>Ishdan Ketish qayd etildi</b>';

                let fixedText = '';
                
                if (item.attendanceType === 'checkIn') {
                    fixedText = `
${checkType}

👤 ${item.employeeFirstName} ${item.employeeLastName}
💼 ${item.roleName}
🏢 ${item.branchName}

🕘 <b>${date} ${timeWithoutSeconds}</b>
🚀 Ish kuningiz unumli o'tsin!
`;
                } else {
                    
                    fixedText = `
${checkType}

👤 ${item.employeeFirstName} ${item.employeeLastName}
💼 ${item.roleName}
🏢 ${item.branchName}
                
🕘 <b>${date} ${timeWithoutSeconds}</b>
😊 Yaxshi dam oling!
`;
                }
                
                let sentMessage = await bot.sendMessage(item.employeeChatId!, fixedText, {
                    parse_mode: 'HTML'
                });
                
                await DatabaseFunctions.update({
                    data: {
                        attendanceMessageId: sentMessage.message_id
                    },
                    tableName: "attendances",
                    targets: [
                        {
                            targetColumn: "attendanceId",
                            targetValue: item.attendanceId
                        }
                    ]
                });
                
                return true;
            } catch (error) {
                return false;
            }
        }
    }
    
    export async function sendNotComeWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        
        const matchedWorkshifts = await WorkshiftsQuery.getWorkshiftsByTime({ workshiftComeTime: nowTimeStr })
        if (!matchedWorkshifts.length) {
            return
        };
        
        for (const workshift of matchedWorkshifts) {
            const employees = await EmployeesQuery.getTelegramEmployeesByWorkshift(workshift.workshiftId);
            const { date, timeWithoutSeconds } = GlobalUtils.getDateAndTime(new Date());
            
            for (const employee of employees) {
                const todaysCheckin = await AttendanceQuery.checkEmployeeOldAttendances({
                    employeeId: employee.employeeId,
                    attendanceType: 'checkIn',
                    attendanceTime: todayDate
                });
                
                if (todaysCheckin.length) {
                    continue
                };
                
                const sendingText = `
⚠️ <b>Ishga kelish qayd etilmadi</b>

👤 ${employee.employeeFirstName} ${employee.employeeLastName}
💼 ${employee.roleName}
🏢 ${employee.branchName}
                
🕘 <b>${date} ${timeWithoutSeconds}</b>
                `;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText, { parse_mode: 'HTML' });
                } catch (error) {
                }
            }
        }
    }
    
    export async function sendNotLeaveWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        const { date, timeWithoutSeconds } = GlobalUtils.getDateAndTime(new Date());
        
        const matchedWorkshifts = await WorkshiftsQuery.getWorkshiftsByTime({ workshiftLeaveTime: nowTimeStr })
        if (!matchedWorkshifts.length) {
            return
        };
        
        for (const workshift of matchedWorkshifts) {
            const employees = await EmployeesQuery.getTelegramEmployeesByWorkshift(workshift.workshiftId);
            
            for (const employee of employees) {
                const todaysCheckin = await AttendanceQuery.checkEmployeeOldAttendances({
                    employeeId: employee.employeeId,
                    attendanceType: 'checkIn',
                    attendanceTime: todayDate
                });
                
                if (todaysCheckin.length) {
                    continue
                };
                
                const sendingText = `
⚠️ <b>Ishdan ketish qayd etilmadi</b>

👤 ${employee.employeeFirstName} ${employee.employeeLastName}
💼 ${employee.roleName}
🏢 ${employee.branchName}
                
🕘 <b>${date} ${timeWithoutSeconds}</b>
                `;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText, { parse_mode: 'HTML' });
                } catch (error) {
                }
            }
        }
    }
}

export default TelegramCronjob