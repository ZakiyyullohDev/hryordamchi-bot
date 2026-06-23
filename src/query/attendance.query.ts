import { and, asc, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";

import AttendancesInterface from "@interface/attendances.interface";
import DbTableSchema from "@database/schema.database";
import { db } from "@database/pg.database";

namespace AttendanceQuery {
    
    //! SELECT_START
    
    export async function getAttendance(payloads: DbTableSchema.InferSelectType<typeof DbTableSchema.attendances, true>) {
        const {
            attendanceId,
            attendanceTime,
            attendanceType,
            employeeId,
            branchId,
            companyId,
            attendanceCreatedAt
        } = payloads
        
        const conditions = []
        
        if (attendanceId) {
            conditions.push(eq(DbTableSchema.attendances.attendanceId, attendanceId))
        }
        if (attendanceTime) {
            conditions.push(eq(DbTableSchema.attendances.attendanceTime, attendanceTime))
        }
        if (attendanceType) {
            conditions.push(eq(DbTableSchema.attendances.attendanceType, attendanceType))
        }
        if (employeeId) {
            conditions.push(eq(DbTableSchema.attendances.employeeId, employeeId))
        }
        if (branchId) {
            conditions.push(eq(DbTableSchema.attendances.branchId, branchId))
        }
        if (companyId) {
            conditions.push(eq(DbTableSchema.attendances.companyId, companyId))
        }
        if (attendanceCreatedAt) {
            conditions.push(eq(DbTableSchema.attendances.attendanceCreatedAt, attendanceCreatedAt))
        }
        
        return await db.select()
        .from(DbTableSchema.attendances)
        .where(
            and(...conditions)
        )
        .then(data => data[0])
        
    }
    
    export async function checkEmployeeOldAttendances(payloads: AttendancesInterface.ICheckEmployeeOldAttendancesPayloads) {
        const {
            employeeId,
            attendanceTime,
            attendanceType
        } = payloads
        
        return await db.select()
        .from(DbTableSchema.attendances)
        .where(
            and(
                eq(DbTableSchema.attendances.employeeId, employeeId),
                gte(DbTableSchema.attendances.attendanceTime, new Date(attendanceTime.split('T')[0]+'T00:00:00+00:00')),
                lte(DbTableSchema.attendances.attendanceTime, new Date(attendanceTime.split('T')[0]+'T23:59:59+00:00')),
                eq(DbTableSchema.attendances.attendanceType, attendanceType),
            )
        )
    }
    
    export async function getNotSendedAttendancesMessages(limit: number = 20) {
        return await db.select({
            attendanceId: DbTableSchema.attendances.attendanceId,
            attendanceTime: DbTableSchema.attendances.attendanceTime,
            attendanceType: DbTableSchema.attendances.attendanceType,
            employeeId: DbTableSchema.employees.employeeId,
            employeeFirstName: DbTableSchema.employees.employeeFirstName,
            employeeLastName: DbTableSchema.employees.employeeLastName,
            employeeGender: DbTableSchema.employees.employeeGender,
            employeeImg: DbTableSchema.employees.employeeImg,
            employeeChatId: DbTableSchema.employees.employeeChatId,
            workshiftId: DbTableSchema.employees.workshiftId,
            roleName: DbTableSchema.roles.roleName
        })
        .from(DbTableSchema.attendances)
        .innerJoin(DbTableSchema.employees, eq(DbTableSchema.attendances.employeeId, DbTableSchema.employees.employeeId))
        .innerJoin(DbTableSchema.roles, eq(DbTableSchema.employees.roleId, DbTableSchema.roles.roleId))
        .where(
            and(
                eq(DbTableSchema.employees.employeeIsDelete, false),
                gte(DbTableSchema.attendances.attendanceTime, new Date('2026-06-10T00:00:00+00:00')),
                isNotNull(DbTableSchema.employees.employeeChatId),
                isNull(DbTableSchema.attendances.attendanceMessageId),
            )
        )
        .limit(limit)
    }
    
    export async function getEmployeeTodayCheckIn(employeeId: string) {
        return await db.select()
        .from(DbTableSchema.attendances)
        .where(
            and(
                eq(DbTableSchema.attendances.employeeId, employeeId),
                eq(DbTableSchema.attendances.attendanceType, 'checkIn'),
                sql`${DbTableSchema.attendances.attendanceTime}::date = CURRENT_DATE`
            )
        )
        .orderBy(
            asc(DbTableSchema.attendances.attendanceTime)
        )
        .then(data => data[0]);
    }
    
    //! SELECT_END
    
    
    
    //! INSERT_START
    
    
    
    //! INSERT_END
    
    
    
    //! UPDATE_START
    
    
    
    //! UPDATE_END
    
}

export default AttendanceQuery