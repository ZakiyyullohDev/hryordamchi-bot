import { alias } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";

import DbTableSchema from "@database/schema.database";
import { db } from "@database/pg.database";

namespace WorkshiftsQuery {
    
    //! SELECT_START
    
    export async function getWorkshift(payloads: DbTableSchema.InferSelectType<typeof DbTableSchema.workshifts, true>) {
        
        const {
            workshiftId,
            workshiftName,
            workshiftComeTime,
            workshiftComeTimeSms,
            workshiftLeaveTime,
            workshiftLeaveTimeSms,
            workshiftComeTextId,
            workshiftLeaveTextId,
            workshiftIfnotComeTextId,
            workshiftIfnotLeaveTextId,
            companyId,
            workshiftCreatedAt,
        } = payloads
        
        const conditions = []
        
        if (workshiftId) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftId, workshiftId))
        }
        if (workshiftName) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftName, workshiftName))
        }
        if (workshiftComeTime) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftComeTime, workshiftComeTime))
        }
        if (workshiftComeTimeSms) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftComeTimeSms, workshiftComeTimeSms))
        }
        if (workshiftLeaveTime) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftLeaveTime, workshiftLeaveTime))
        }
        if (workshiftLeaveTimeSms) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftLeaveTimeSms, workshiftLeaveTimeSms))
        }
        if (workshiftComeTextId) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftComeTextId, workshiftComeTextId))
        }
        if (workshiftLeaveTextId) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftLeaveTextId, workshiftLeaveTextId))
        }
        if (workshiftIfnotComeTextId) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftIfnotComeTextId, workshiftIfnotComeTextId))
        }
        if (workshiftIfnotLeaveTextId) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftIfnotLeaveTextId, workshiftIfnotLeaveTextId))
        }
        if (companyId) {
            conditions.push(eq(DbTableSchema.workshifts.companyId, companyId))
        }
        if (workshiftCreatedAt) {
            conditions.push(eq(DbTableSchema.workshifts.workshiftCreatedAt, workshiftCreatedAt))
        }
        
        return await db.select()
        .from(DbTableSchema.workshifts)
        .where(
            and(...conditions)
        )
        .then(data => data[0])
    }
    
    export async function getWorkshiftTexts(workshiftId: string) {
        const comeText = alias(DbTableSchema.myTexts, 'comeText');
        const leaveText = alias(DbTableSchema.myTexts, 'leaveText');
        
        return await db.select({
            workshiftComeText: comeText.mtText,
            workshiftLeaveText: leaveText.mtText,
        })
        .from(DbTableSchema.workshifts)
        .leftJoin(comeText, eq(comeText.mtId, DbTableSchema.workshifts.workshiftComeTextId))
        .leftJoin(leaveText, eq(leaveText.mtId, DbTableSchema.workshifts.workshiftLeaveTextId))
        .where(
            eq(DbTableSchema.workshifts.workshiftId, workshiftId)
        )
        .then(data => data[0])
    }
    
    //! SELECT_END
    
    
    
    //! INSERT_START
    
    
    
    //! INSERT_END
    
    
    
    //! UPDATE_START
    
    
    
    //! UPDATE_END
    
}

export default WorkshiftsQuery