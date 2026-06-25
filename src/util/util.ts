namespace GlobalUtils {
    
    export function convertDateToDeviceFormat(dateString: string) {
        const date = new Date(dateString);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}.${month}.${year}`;
    }
    
    export function getNowTime() {
        const now = new Date();
        const nowTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (5 * 3600000));
        const todayDate = nowTime.toISOString().slice(0, 10);
        
        const nowHH = String(nowTime.getHours()).padStart(2, '0');
        const nowMM = String(nowTime.getMinutes()).padStart(2, '0');
        const nowTimeStr = `${nowHH}:${nowMM}`;
        
        return { nowTime, todayDate, nowTimeStr };
    }
    
    export function convertDateUzbekFormat(dateInput: string | Date): string {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        
        if (isNaN(date.getTime())) {
            return "Noto'g'ri sana";
        }
        
        const day = date.getDate();
        const year = date.getFullYear();
        
        const months: string[] = [
            "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
            "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
        ];
        
        const monthName = months[date.getMonth()];
        
        return `${day}-${monthName}, ${year}-yil`;
    }
    
    export function getDateAndTime(dateTime: Date) {
        const year = dateTime.getFullYear()
        const month = String(dateTime.getMonth() + 1).padStart(2, '0')
        const day = String(dateTime.getDate()).padStart(2, '0')
        
        const hours = String(dateTime.getHours()).padStart(2, '0')
        const minutes = String(dateTime.getMinutes()).padStart(2, '0')
        const seconds = String(dateTime.getSeconds()).padStart(2, '0')
        
        return {
            date: `${day}.${month}.${year}`,
            time: `${hours}:${minutes}:${seconds}`,
            timeWithoutSeconds: `${hours}:${minutes}`
        }
    }
    
}

export default GlobalUtils