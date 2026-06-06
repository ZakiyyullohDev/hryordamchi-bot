import TelegramBot from "node-telegram-bot-api";

import DatabaseFunctions from "@database/functions.database";
import WorkshiftsQuery from "@query/workshifts.query";
import BotInterface from "@interface/bot.interface";
import GlobalUtils from "@util/util";

namespace BotHelper {
    export function setCommand(commands: BotInterface.setCommand[], bot: TelegramBot) {
        bot.setMyCommands(commands)
    }
    
    export function setKeyboardMarkup(markup: BotInterface.setKeyboardMarkup[][]) {
        return {
            keyboard: markup,
            resize_keyboard: true,
            one_time_keyboard: false
        }
    }
    
    export async function sendAttendanceMessage(bot: TelegramBot, payloads: BotInterface.AttendanceMessagePayloads) {
        try {
            const {
                employee,
                attendance
            } = payloads
            
            if (!employee.employeeChatId) {
                return;
            }
            
            const workshiftTexts = await WorkshiftsQuery.getWorkshiftTexts(employee.workshiftId)
            
            const sendingText = attendance.attendanceType == 'checkIn' ? workshiftTexts.workshiftComeText : workshiftTexts.workshiftLeaveText;
            if (!sendingText) {
                return;
            }
            
            const fixedText = sendingText
            .replace('@ism', employee.employeeFirstName)
            .replace('@familiya', employee.employeeLastName)
            .replace('@sharif', employee.employeeFatherName)
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
            
            await bot.sendMessage(employee.employeeChatId, fixedText);
        } catch (error) {
            await DatabaseFunctions.insert({
                tableName: 'telegramErroredMessages',
                data: {
                    temChatId: payloads.employee.employeeChatId!,
                    temMessage: JSON.stringify(payloads),
                    temErrorMessage: error instanceof Error ? error.message : 'Unknown error',
                    employeeId: payloads.employee.employeeId,
                    companyId: payloads.employee.companyId
                }
            })
        }
    }
}

export default BotHelper