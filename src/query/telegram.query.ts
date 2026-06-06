import DbTableSchema from "@database/schema.database";
import { db } from "@database/pg.database";

namespace TelegramQuery {
    
    //! SELECT_START
    
    export async function getErroredMessages() {
        return await db.select()
        .from(DbTableSchema.telegramErroredMessages)
    }
    
    //! SELECT_END
    
    
    //! INSERT_START
    
    
    
    //! INSERT_END
    
    
    
    //! UPDATE_START
    
    
    
    //! UPDATE_END
    
    
    
    //! DELETE_START
    
    
    //! DELETE_END
    
}

export default TelegramQuery