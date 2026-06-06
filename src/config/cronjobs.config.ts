import TelegramBot from "node-telegram-bot-api";

import TelegramCronjob from "@cronjob/telegram.cronjob";
import newCronJob from "@lib/cronjob.lib";

async function runConfigCronJobs(bot: TelegramBot) {
    newCronJob('attendances', '0 */1 * * * *', () => TelegramCronjob.runner(bot))
}

export default runConfigCronJobs