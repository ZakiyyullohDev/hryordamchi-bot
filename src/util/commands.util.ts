import BotInterface from "@interface/bot.interface"

namespace CommandsUtil {
    export const beforeRegister: BotInterface.setCommand[] = [
        {
            command: 'start',
            description: 'Bot ni qayta ishga tushirish'
        }
    ]

    export const listenerCommands: BotInterface.setCommand[] = [
        {
            command: 'start',
            description: 'Bot ni qayta ishga tushirish'
        },
        {
            command: 'clear',
            description: 'Bot ni tozalash'
        }
    ]
}

export default CommandsUtil