import BotInterface from "@interface/bot.interface"

namespace CommandsUtil {
    export const beforeRegister: BotInterface.setCommand[] = [
        {
            command: 'start',
            description: 'Bot ni qayta ishga tushirish ♻️'
        }
    ]

    export const listenerCommands: BotInterface.setCommand[] = [
        {
            command: 'start',
            description: 'Bot ni qayta ishga tushirish ♻️'
        },
        {
            command: 'stop',
            description: `Bot ni To'xtatish 🛑`
        }
    ]
}

export default CommandsUtil