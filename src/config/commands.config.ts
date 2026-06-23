import TelegramBot from "node-telegram-bot-api";

import DatabaseFunctions from "@database/functions.database";

namespace CommandsConfig {

    export async function runner(bot: TelegramBot) {
        bot.onText(/^\/start(@\w+)?$/, async msg => {
            
        })

        bot.onText(/^\/stop(@\w+)?$/, async msg => {
            const chatId = msg.chat.id
            const employee = await DatabaseFunctions.select({
                filter: {
                    employeeChatId: chatId
                },
                tableName: 'employees'
            })
            if (!employee) {
                return bot.sendMessage(chatId, 'Xodim Topilmadi ❌')
            }

            await DatabaseFunctions.update({
                tableName: 'employees',
                data: {
                    employeeChatId: null
                },
                targets: [
                    {
                        targetColumn: 'employeeChatId',
                        targetValue: null
                    }
                ]
            })
        })
    }

}

export default CommandsConfig