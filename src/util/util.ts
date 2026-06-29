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
        
        const nowTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        const isoString = nowTime.toISOString(); 
        const todayDate = isoString.slice(0, 10);
        
        const nowTimeStr = isoString.slice(11, 16);
        
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
        const utc5Time = new Date(dateTime.getTime() + 18000000);

        const year = utc5Time.getUTCFullYear()
        const month = String(utc5Time.getUTCMonth() + 1).padStart(2, '0')
        const day = String(utc5Time.getUTCDate()).padStart(2, '0')
        const hours = String(utc5Time.getUTCHours()).padStart(2, '0')
        const minutes = String(utc5Time.getUTCMinutes()).padStart(2, '0')
        const seconds = String(utc5Time.getUTCSeconds()).padStart(2, '0')

        return {
            date: `${day}.${month}.${year}`,
            time: `${hours}:${minutes}:${seconds}`,
            timeWithoutSeconds: `${hours}:${minutes}`
        }
    }

}

export default GlobalUtils