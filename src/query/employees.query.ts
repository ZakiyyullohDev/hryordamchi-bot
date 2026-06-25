import { and, eq, isNotNull, or } from "drizzle-orm"

import DbTableSchema from "@database/schema.database"
import { db } from "@database/pg.database"

namespace EmployeesQuery {
    
    export async function getEmployeesByPhoneNumber(phoneNumber: string) {
        return await db.select()
        .from(DbTableSchema.employees)
        .where(
            eq(DbTableSchema.employees.employeePhoneNumberMain, phoneNumber)
        )
    }
    
    export async function getTelegramEmployees() {
        return await db.select({
            employeeId: DbTableSchema.employees.employeeId,
            employeeFirstName: DbTableSchema.employees.employeeFirstName,
            employeeLastName: DbTableSchema.employees.employeeLastName,
            employeeFatherName: DbTableSchema.employees.employeeFatherName,
            employeeChatId: DbTableSchema.employees.employeeChatId,
            workshiftId: DbTableSchema.employees.workshiftId,
            companyId: DbTableSchema.employees.companyId
        })
        .from(DbTableSchema.employees)
        .where(
            and(
                eq(DbTableSchema.employees.employeeIsDelete, false),
                isNotNull(DbTableSchema.employees.employeeChatId)
            )
        )
    }

    export async function getTelegramEmployeesByWorkshift(workshiftId: string) {
        return await db.select({
            employeeId: DbTableSchema.employees.employeeId,
            employeeFirstName: DbTableSchema.employees.employeeFirstName,
            employeeLastName: DbTableSchema.employees.employeeLastName,
            employeeFatherName: DbTableSchema.employees.employeeFatherName,
            employeeChatId: DbTableSchema.employees.employeeChatId,
            workshiftId: DbTableSchema.employees.workshiftId,
            roleName: DbTableSchema.roles.roleName,
            branchName: DbTableSchema.branches.branchName,
            companyId: DbTableSchema.employees.companyId
        })
        .from(DbTableSchema.employees)
        .innerJoin(DbTableSchema.roles, eq(DbTableSchema.employees.roleId, DbTableSchema.roles.roleId))
        .innerJoin(DbTableSchema.branches, eq(DbTableSchema.employees.branchId, DbTableSchema.branches.branchId))
        .where(
            and(
                eq(DbTableSchema.employees.employeeIsDelete, false),
                eq(DbTableSchema.employees.workshiftId, workshiftId),
                isNotNull(DbTableSchema.employees.employeeChatId)
            )
        )
    }
    
}

export default EmployeesQuery