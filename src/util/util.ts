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
    
}

export default GlobalUtils