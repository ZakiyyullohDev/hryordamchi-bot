import TelegramBot from "node-telegram-bot-api"

import DatabaseFunctions from "@database/functions.database";
import RegisterModel from "@module/register/register";
import CommandsUtil from "@util/commands.util";
import BotHelper from "@helper/bot.helper";

namespace EventsLib {
    
    export function runner(bot: TelegramBot) {
        chatListener(bot)
        RegisterModel.register(bot)
    }
    
    export async function chatListener(bot: TelegramBot) {
        bot.on('message', async msg => {
            if (msg.contact) {
                return
            }

            const isEmployeeFound = await DatabaseFunctions.select({
                filter: {
                    employeeChatId: msg.chat.id
                },
                tableName: 'employees'
            })
            
            let sendingText = 'Sizga qanday yordam bera olaman?';
            let keyboardMarkup
            
            if (!isEmployeeFound) {
                sendingText = 'Registratsiya qilish uchun Telefon Raqamingizni yuboring 📱'
                keyboardMarkup = BotHelper.setKeyboardMarkup([
                    [
                        {
                            text: 'Telefon raqamingizni yuboring 📱', 
                            request_contact: true
                        }
                    ]
                ])
            }
            
            await bot.sendSticker(msg.chat.id, './img/salom.webp')
            bot.sendMessage(msg.chat.id, sendingText, { reply_markup: keyboardMarkup })
            BotHelper.setCommand(CommandsUtil.listenerCommands, bot)
        })
    }
    
}

export default EventsLib