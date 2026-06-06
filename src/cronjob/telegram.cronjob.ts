import TelegramBot from 'node-telegram-bot-api';

import DatabaseFunctions from '@database/functions.database';
import AttendanceQuery from '@query/attendance.query';
import EmployeesQuery from "@query/employees.query";
import TelegramQuery from '@query/telegram.query';
import BotHelper from '@helper/bot.helper';

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
        const employees = await EmployeesQuery.getTelegramEmployees()
        const todayDate = new Date().toISOString().slice(0, 10)
        const nowTime = new Date()
        
        for (const employee of employees) {
            const workshift = await DatabaseFunctions.select({
                tableName: 'workshifts',
                filter: { 
                    workshiftId: employee.workshiftId
                }
            })
            
            const [hours, minutes] = workshift.workshiftComeTimeSms.split(':').map(Number)
            const comeSmsTime = new Date()
            comeSmsTime.setHours(hours, minutes, 0, 0)
            
            if (nowTime < comeSmsTime) {
                continue
            }
            
            const todaysCheckin = await AttendanceQuery.checkEmployeeOldAttendances({ 
                employeeId: employee.employeeId,
                attendanceType: 'checkIn', 
                attendanceTime: todayDate
            })
            
            if (todaysCheckin.length) {
                continue
            }
            
            const alreadySent = await DatabaseFunctions.select({
                tableName: 'telegramSentWarnings',
                filter: {
                    employeeId: employee.employeeId,
                    tswSentDate: todayDate,
                    tswWarningType: 'notCome'
                }
            })
            
            if (alreadySent) {
                continue
            }
            
            const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Kelish ni bosmadingiz. Iltimos, tez orada kelishingizni so'raymiz!`
            
            try {
                await bot.sendMessage(employee.employeeChatId!, sendingText)
                
                await DatabaseFunctions.insert({
                    tableName: 'telegramSentWarnings',
                    data: {
                        employeeId: employee.employeeId,
                        companyId: employee.companyId,
                        tswSentDate: todayDate,
                        tswWarningType: 'notCome'
                    }
                })
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
                })
            }
        }
    }
    
    export async function sendNotLeaveWarningMessage(bot: TelegramBot) {
        const employees = await EmployeesQuery.getTelegramEmployees()
        const todayDate = new Date().toISOString().slice(0, 10)
        const nowTime = new Date()
        
        for (const employee of employees) {
            const workshift = await DatabaseFunctions.select({
                tableName: 'workshifts',
                filter: { 
                    workshiftId: employee.workshiftId 
                }
            })
            
            const [hours, minutes] = workshift.workshiftLeaveTimeSms.split(':').map(Number)
            const leaveSmsTime = new Date()
            leaveSmsTime.setHours(hours, minutes, 0, 0)
            
            if (nowTime < leaveSmsTime) {
                continue
            }
            
            const todaysCheckout = await AttendanceQuery.checkEmployeeOldAttendances({ 
                employeeId: employee.employeeId,
                attendanceType: 'checkOut', 
                attendanceTime: todayDate
            })
            
            if (todaysCheckout.length) {
                continue
            }
            
            const alreadySent = await DatabaseFunctions.select({
                tableName: 'telegramSentWarnings',
                filter: {
                    employeeId: employee.employeeId,
                    tswSentDate: todayDate,
                    tswWarningType: 'notLeave'
                }
            })
            
            if (alreadySent) {
                continue
            }
            
            const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Ketish ni bosmadingiz. Eslatma: Ketishni bosishni unutmang`
            
            try {
                await bot.sendMessage(employee.employeeChatId!, sendingText)
                
                await DatabaseFunctions.insert({
                    tableName: 'telegramSentWarnings',
                    data: {
                        employeeId: employee.employeeId,
                        companyId: employee.companyId,
                        tswSentDate: todayDate,
                        tswWarningType: 'notLeave'
                    }
                })
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
                })
            }
        }
    }
}

export default TelegramCronjob