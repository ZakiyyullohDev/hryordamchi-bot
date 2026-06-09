import TelegramBot from 'node-telegram-bot-api';

import DatabaseFunctions from '@database/functions.database';
import WorkshiftsQuery from '@query/workshifts.query';
import AttendanceQuery from '@query/attendance.query';
import EmployeesQuery from "@query/employees.query";
import TelegramQuery from '@query/telegram.query';
import BotHelper from '@helper/bot.helper';
import GlobalUtils from '@util/util';

namespace TelegramCronjob {
    
    export async function runner(bot: TelegramBot) {
        await resendAttendanceMessages(bot)
        await sendNotComeWarningMessage(bot)
        await sendNotLeaveWarningMessage(bot)
    }

    export async function resendAttendanceMessages(bot: TelegramBot) {
        const erroredMessages = await TelegramQuery.getErroredMessages()
        
        for (const erroredMessage of erroredMessages) {
            try {
                const sendingMessage = typeof erroredMessage.temMessage === 'string' ? JSON.parse(erroredMessage.temMessage) : erroredMessage.temMessage
                
                await BotHelper.sendAttendanceMessage(bot, sendingMessage)
                await DatabaseFunctions.remove({
                    tableName: 'telegramErroredMessages',
                    targets: [
                        {
                            targetColumn: 'temId',
                            targetValue: erroredMessage.temId
                        }
                    ]
                })
            } catch (error) {
                continue;
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
                    await DatabaseFunctions.insert({
                        tableName: 'telegramErroredMessages',
                        data: {
                            temChatId: employee.employeeChatId!,
                            temMessage: sendingText,
                            temErrorMessage: error instanceof Error ? error.message : 'Unknown error',
                            employeeId: employee.employeeId,
                            companyId: employee.companyId
                        }
                    });
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
                    await DatabaseFunctions.insert({
                        tableName: 'telegramErroredMessages',
                        data: {
                            temChatId: employee.employeeChatId!,
                            temMessage: sendingText,
                            temErrorMessage: error instanceof Error ? error.message : 'Unknown error',
                            employeeId: employee.employeeId,
                            companyId: employee.companyId
                        }
                    });
                }
            }
        }
    }
}

export default TelegramCronjob