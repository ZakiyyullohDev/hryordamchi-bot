import TelegramBot from "node-telegram-bot-api";

import TelegramCronjob from "@cronjob/telegram.cronjob";
import newCronJob from "@lib/cronjob.lib";

async function runConfigCronJobs(bot: TelegramBot) {
    newCronJob('warningMessages', '* * * * *', () => TelegramCronjob.runner(bot))
    newCronJob('attendances', '*/2 * * * * *', () => TelegramCronjob.resendAttendanceMessages(bot))
}

export default runConfigCronJobs