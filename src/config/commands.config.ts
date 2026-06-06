import TelegramBot from "node-telegram-bot-api";

namespace CommandsConfig {

    export async function runner(bot: TelegramBot) {
        bot.onText(/^\/start(@\w+)?$/, async msg => {
            
        })
    }

}

export default CommandsConfig