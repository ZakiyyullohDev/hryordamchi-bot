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
        const notSendedAttendanceMessages = await AttendanceQuery.getNotSendedAttendancesMessages()
        if (!notSendedAttendanceMessages.length) {
            return
        }
        
        const requests = notSendedAttendanceMessages.map(async attendance => {
            try {
                const workshiftTexts = await WorkshiftsQuery.getWorkshiftTexts(attendance.workshiftId)
                
                const sendingText = attendance.attendanceType == 'checkIn' ? workshiftTexts.workshiftComeText : workshiftTexts.workshiftLeaveText;
                if (!sendingText) {
                    return;
                }
                
                const fixedText = sendingText
                .replace('@ism', attendance.employeeFirstName)
                .replace('@familiya', attendance.employeeLastName)
                .replace('@sharif', attendance.employeeFatherName)
                .replace('@sana', GlobalUtils.convertDateToDeviceFormat(
                    attendance.attendanceTime.toString()
                ) || '')
                .replace('@vaqt', attendance.attendanceTime.slice(11, 16))
                .replace(/―/g, '-')
                .replace(/`/g, "'")
                .replace(/\(/g, '[')
                .replace(/\)/g, ']')
                .replace(/‘/g, "'")
                .replace(/№/g, 'No:')
                .replace(/[“”]/g, '"')
                
                const sentMessage = await bot.sendMessage(attendance.employeeChatId!, fixedText);
                
                await DatabaseFunctions.update({
                    data: {
                        attendanceMessageId: sentMessage.message_id
                    },
                    tableName: 'attendances',
                    targets: [
                        {
                            targetColumn: 'attendanceId',
                            targetValue: attendance.attendanceId
                        }
                    ]
                })

                return true;
            } catch {
                return false;
            }
        })
        
        await Promise.all(requests)
    }
    
    export async function sendNotComeWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        
        const matchedWorkshifts = await WorkshiftsQuery.getWorkshiftsByTime({ workshiftComeTime: nowTimeStr })
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
                
                const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Kelish ni bosmadingiz. Iltimos, tez orada kelishingizni so'raymiz!`;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText);
                } catch (error) {
                }
            }
        }
    }
    
    export async function sendNotLeaveWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        
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
                
                const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Ketish ni bosmadingiz. Eslatma ketishni bosishni unutmang.`;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText);
                } catch (error) {
                }
            }
        }
    }
}

export default TelegramCronjob