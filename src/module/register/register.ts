import TelegramBot from "node-telegram-bot-api";

import DatabaseFunctions from "@database/functions.database";
import EmployeesQuery from "@query/employees.query";

namespace RegisterModel {
    export async function register(bot: TelegramBot) {
        bot.on("contact", async (msg) => {
            const chatId = msg.chat.id;

            if (!msg.contact) {
                return
            };

            if (msg.contact.user_id !== msg.from?.id) {
                return bot.sendMessage(chatId, "Faqat o'zingizning raqamingizni yuboring ❌");
            }

            const phoneNumber = msg.contact.phone_number.replace("+", "");
            const employees = await EmployeesQuery.getEmployeesByPhoneNumber(phoneNumber);

            if (!employees.length) {
                return bot.sendMessage(chatId, "Xodim topilmadi ❌");
            }
            
            for (const employee of employees) {
                if (!employee.employeeChatId) {
                    await DatabaseFunctions.update({
                        tableName: "employees",
                        data: {
                            employeeChatId: chatId,
                            employeeTelegramJoinedAt: new Date()
                        },
                        targets: [
                            {
                                targetColumn: "employeeId",
                                targetValue: employee.employeeId
                            }
                        ]
                    });
                }
            }

            return bot.sendMessage(chatId, `Tizimga muvaffaqiyatli kirdingiz ✅`, { reply_markup: { remove_keyboard: true } });
        });
    }
}

export default RegisterModel;