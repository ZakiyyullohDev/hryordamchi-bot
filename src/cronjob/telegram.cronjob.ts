import TelegramBot from 'node-telegram-bot-api';

import DatabaseFunctions from '@database/functions.database';
import WorkshiftsQuery from '@query/workshifts.query';
import AttendanceQuery from '@query/attendance.query';
import EmployeesQuery from "@query/employees.query";
import BotHelper from '@helper/bot.helper';
import S3Helper from '@helper/s3.helper';
import GlobalUtils from '@util/util';

namespace TelegramCronjob {
    
    export async function runner(bot: TelegramBot) {
        await sendNotComeWarningMessage(bot)
        await sendNotLeaveWarningMessage(bot)
    }
    
    export async function resendAttendanceMessages(bot: TelegramBot) {
        const notSendedAttendanceMessages = await AttendanceQuery.getNotSendedAttendancesMessages();

        if (!notSendedAttendanceMessages.length) {
            return;
        }

        const requests = notSendedAttendanceMessages.map(async item => {
            try {
                let lateTimeText = '';
                
                const { date, time } = GlobalUtils.getDateAndTime(item.attendanceTime);
                
                const checkType = item.attendanceType === 'checkIn' ? '✅ Ishga <b>Kelish</b> qayd etildi' : '👋 Ishdan <b>Ketish</b> qayd etildi';
                const genderEmoji = item.employeeGender ? "🧑‍💼" : "👩‍💼";
                
                const lateDetect = await BotHelper.attendanceLateDetect({
                    employeeId: item.employeeId,
                    workshiftId: item.workshiftId
                });
                
                if (lateDetect.isLate) {
                    lateTimeText = `⚠️ <b>Kechga qolingan vaqt</b>: ${lateDetect.lateText}`;
                }
                
                let fixedText = '';
                
                if (item.attendanceType === 'checkIn') {
                    fixedText = `
${checkType}

${genderEmoji} <b>Ism</b>: ${item.employeeFirstName} ${item.employeeLastName}
💼 <b>Lavozim</b>: ${item.roleName}
                    
📆 <b>Sana</b>: ${GlobalUtils.convertDateUzbekFormat(item.attendanceTime)} (${date})
🕘 <b>Vaqt</b>: ${time}
${lateTimeText}
                    
🚀 Ish kuningiz unumli o'tsin!
`;
                } else {
                    const checkInAttendance = await AttendanceQuery.getEmployeeTodayCheckIn(item.employeeId);

                    let checkInTime = '-';
                    let workedTime = '-';
                    
                    if (checkInAttendance) {
                        const { time: inTime } = GlobalUtils.getDateAndTime(
                            checkInAttendance.attendanceTime
                        );
                        
                        checkInTime = inTime;
                        
                        const diffMs =
                        new Date(item.attendanceTime).getTime() -
                        new Date(checkInAttendance.attendanceTime).getTime();
                        
                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                        const minutes = Math.floor(
                            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        
                        workedTime = `${hours} soat ${minutes} daqiqa`;
                    }
                    
                    fixedText = `
${checkType}
                    
${genderEmoji} <b>Ism</b>: ${item.employeeFirstName} ${item.employeeLastName}
💼 <b>Lavozim</b>: ${item.roleName}
                    
📆 <b>Sana</b>: ${GlobalUtils.convertDateUzbekFormat(item.attendanceTime)} (${date})
                    
🕘 <b>Kelgan vaqt</b>: ${checkInTime}
🕔 <b>Ketgan vaqt</b>: ${time}
⏱ <b>Ishlagan vaqt</b>: ${workedTime}
                    
😊 Yaxshi dam oling!
`;
                }
                
                const employeeImgDatas = await S3Helper.ImageRecieverById(
                    item.employeeImg
                );
                
                let sentMessage;
                
                if (!employeeImgDatas) {
                    sentMessage = await bot.sendMessage(
                        item.employeeChatId!,
                        fixedText
                    );
                } else {
                    const photoBuffer = Buffer.from(
                        employeeImgDatas.file_data,
                        "base64"
                    );
                    
                    sentMessage = await bot.sendPhoto(
                        item.employeeChatId!,
                        photoBuffer,
                        {
                            caption: fixedText,
                            parse_mode: 'HTML'
                        }
                    );
                }
                
                await DatabaseFunctions.update({
                    data: {
                        attendanceMessageId: sentMessage.message_id
                    },
                    tableName: "attendances",
                    targets: [
                        {
                            targetColumn: "attendanceId",
                            targetValue: item.attendanceId
                        }
                    ]
                });
                
                return true;
            } catch (error) {
                return false;
            }
        });
        
        await Promise.all(requests);
    }
    
    export async function sendNotComeWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        
        const matchedWorkshifts = await WorkshiftsQuery.getWorkshiftsByTime({ workshiftComeTime: nowTimeStr })
        if (!matchedWorkshifts.length) {
            return
        };
        
        for (const workshift of matchedWorkshifts) {
            const employees = await EmployeesQuery.getTelegramEmployeesByWorkshift(workshift.workshiftId);
            
            for (const employee of employees) {
                const todaysCheckin = await AttendanceQuery.checkEmployeeOldAttendances({
                    employeeId: employee.employeeId,
                    attendanceType: 'checkIn',
                    attendanceTime: todayDate
                });
                
                if (todaysCheckin.length) {
                    continue
                };
                
                const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Kelish ni bosmadingiz. Iltimos, tez orada kelishingizni so'raymiz!`;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText);
                } catch (error) {
                }
            }
        }
    }
    
    export async function sendNotLeaveWarningMessage(bot: TelegramBot) {
        const { todayDate, nowTimeStr } = GlobalUtils.getNowTime()
        
        const matchedWorkshifts = await WorkshiftsQuery.getWorkshiftsByTime({ workshiftLeaveTime: nowTimeStr })
        if (!matchedWorkshifts.length) {
            return
        };
        
        for (const workshift of matchedWorkshifts) {
            const employees = await EmployeesQuery.getTelegramEmployeesByWorkshift(workshift.workshiftId);
            
            for (const employee of employees) {
                const todaysCheckin = await AttendanceQuery.checkEmployeeOldAttendances({
                    employeeId: employee.employeeId,
                    attendanceType: 'checkIn',
                    attendanceTime: todayDate
                });
                
                if (todaysCheckin.length) {
                    continue
                };
                
                const sendingText = `Salom ${employee.employeeLastName} ${employee.employeeFirstName}, siz bugun Ketish ni bosmadingiz. Eslatma ketishni bosishni unutmang.`;
                
                try {
                    await bot.sendMessage(employee.employeeChatId!, sendingText);
                } catch (error) {
                }
            }
        }
    }
}

export default TelegramCronjob