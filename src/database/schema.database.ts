import { bigint, json, pgTable, smallint, text, timestamp, uuid, varchar, boolean, integer, unique, serial, pgEnum, index, numeric, bigserial } from 'drizzle-orm/pg-core';
import { Table } from 'drizzle-orm';

export const warningMessageTypes = pgEnum('warning_message_types', [ 'notCome', 'notLeave' ]);
export const requestLogsRlTypeEnum = pgEnum('request_logs_rl_type_enum', [ 'SUCCESS', 'ERROR' ]);
export const devicesDeviceStatusEnum = pgEnum('devices_device_status_enum', [ 'online', 'offline' ]);
export const addressesAddressTypeEnum = pgEnum('addresses_address_type_enum', [ 'region', 'district', 'street' ]);
export const attendancesAttendanceTypeEnum = pgEnum('attendances_attendance_type_enum', [ 'checkIn', 'checkOut' ]);
export const devicesDeviceTypeEnum = pgEnum('devices_device_type_enum', [ 'checkIn', 'checkOut', 'checkIn,checkOut' ]);
export const pendingJobsPjTypeEnum = pgEnum('pending_jobs_pj_type_enum', [ 'ADD', 'DELETE', 'UPDATE', 'UPDATE_FACE' ]);
export const enabledSmsNumbersEsnNumberTypeEnum = pgEnum('enabled_sms_numbers_esn_number_type_enum', [ 'main', 'optional' ]);
export const myTextsMtStatusEnum = pgEnum('my_texts_mt_status_enum', [ 'moderation', 'inproccess', 'service', 'reklama', 'rejected' ]);
export const smsMessagesSmStatusTypeEnum = pgEnum('sms_messages_sm_status_type_enum', [ 'NEW', 'STORED', 'ACCEPTED', 'PARTDELIVERED', 'DELIVERED', 'REJECTED' ]);
export const smsMessagesSmPhoneNumberCompanyNameEnum = pgEnum('sms_messages_sm_phone_number_company_name_enum', [ 'Mobiuz', 'Beeline', 'Ucell', 'Humans', 'Uzmobile', 'Perfectum', 'OQ' ]);

export const requestsLOGSTable = pgTable('requests_logs', {
    rlId: uuid('rl_id').defaultRandom().primaryKey(),
    rlType: requestLogsRlTypeEnum('rl_type').notNull(),
    rlMethod: varchar('rl_method', { length: 32 }).notNull(),
    rlRoute: text('rl_route').notNull(),
    rlHost: text('rl_host').notNull(),
    rlUserAgent: text('rl_user_agent').notNull(),
    rlBody: json('rl_body').notNull(),
    rlResponseStatus: smallint('rl_response_status').notNull(),
    rlResponseBody: text('rl_response_body').notNull(),
    rlCreatedAt: timestamp('rl_created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const internalErrorsLOGSTable = pgTable('internal_errors_logs', {
    ielId: uuid('iel_id').defaultRandom().primaryKey(),
    ielDescription: text('iel_description').notNull(),
    ielStack: text('iel_stack').notNull(),
    ielCreatedAt: timestamp('iel_created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cronJobsLOGSTable = pgTable('cron_jobs_logs', {
    cjlId: uuid('cjl_id').defaultRandom().primaryKey(),
    cjlName: text('cjl_name').notNull(),
    cjlCreatedAt: timestamp('cjl_created_at', { withTimezone: true }).notNull().defaultNow(),
})


export const companiesTable = pgTable('companies', {
    companyId: uuid('company_id').defaultRandom().primaryKey(),
    companySerialId: serial('company_serial_id').notNull(),
    companyName: varchar('company_name', { length: 64 }).notNull(),
    companyLogo: varchar('company_logo', { length: 64 }),
    companyIsActive: boolean('company_is_active').default(true),
    companyCreatedAt: timestamp('company_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueCompanyName: unique().on(table.companyName), 
    uniqueCompanySerialId: unique().on(table.companySerialId), 
}));

export const rolesTable = pgTable('roles', {
    roleId: uuid('role_id').defaultRandom().primaryKey(),
    roleName: varchar('role_name', { length: 64 }).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    roleCreatedAt: timestamp('role_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueUserRoleName: unique().on(table.roleName, table.companyId)
}));

export const addressRegionsTable = pgTable('address_regions', {
    arId: uuid('ar_id').defaultRandom().primaryKey(),
    arName: varchar('ar_name', { length: 64 }).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    arCreatedAt: timestamp('ar_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueRegionName: unique().on(table.arName, table.companyId)
}));

export const addressDistrictsTable = pgTable('address_districts', {
    adId: uuid('ad_id').defaultRandom().primaryKey(),
    adName: varchar('ad_name', { length: 64 }).notNull(),
    arId: uuid('ar_id').references(() => addressRegionsTable.arId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    adCreatedAt: timestamp('ad_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueDistrictName: unique().on(table.adName, table.companyId)
}));

export const addressStreetsTable = pgTable('address_streets', {
    asId: uuid('as_id').defaultRandom().primaryKey(),
    asName: varchar('as_name', { length: 50 }).notNull(),
    adId: uuid('ad_id').references(() => addressDistrictsTable.adId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    asCreatedAt: timestamp('as_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueStreetName: unique().on(table.asName, table.companyId)
}));

export const addressesTable = pgTable('addresses', {
    addressId: uuid('address_id').defaultRandom().primaryKey(),
    addressType: addressesAddressTypeEnum('address_type').notNull(),
    addressSourceId: uuid('address_source_id').notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    addressCreatedAt: timestamp('address_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueAddress: unique().on(table.addressType, table.addressSourceId, table.companyId)
}));

export const branchesTable = pgTable('branches', {
    branchId: uuid('branch_id').defaultRandom().primaryKey(),
    branchName: varchar('branch_name', { length: 32 }).notNull(),
    branchImg: varchar('branch_img', { length: 64 }).notNull(),
    branchHomeNumber: text('branch_home_number').notNull(),
    addressId: uuid('address_id').references(() => addressesTable.addressId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    branchCreatedAt: timestamp('branch_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueBranchName: unique().on(table.branchName, table.companyId),
}));

export const myTextsTable = pgTable('my_texts', {
    mtId: uuid('mt_id').defaultRandom().primaryKey(),
    mtEskizId: bigint('mt_eskiz_id', { mode: 'number' }),
    mtStatus: myTextsMtStatusEnum('mt_status').notNull().default('moderation'),
    mtTemplate: varchar('mt_template'),
    mtText: varchar('mt_text').notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    mtCreatedAt: timestamp('mt_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueEskizId: unique().on(table.mtEskizId),
    uniqueText: unique().on(table.mtText)
}));

export const workshiftsTable = pgTable('workshifts', {
    workshiftId: uuid('workshift_id').defaultRandom().primaryKey(),
    workshiftName: varchar('workshift_name', { length: 64 }).notNull(),
    workshiftLunchTime: varchar('workshift_lunch_time', { length: 5 }).notNull(),
    workshiftComeTime: varchar('workshift_come_time', { length: 5 }).notNull(),
    workshiftComeTimeSms: varchar('workshift_ifnot_come_time', { length: 5 }).notNull(),
    workshiftLeaveTime: varchar('workshift_leave_time', { length: 5 }).notNull(),
    workshiftLeaveTimeSms: varchar('workshift_ifnot_leave_time', { length: 5 }).notNull(),
    workshiftComeTextId: uuid('workshift_come_text_id').references(() => myTextsTable.mtId).notNull(),
    workshiftLeaveTextId: uuid('workshift_leave_text_id').references(() => myTextsTable.mtId).notNull(),
    workshiftIfnotComeTextId: uuid('workshift_ifnot_come_text_id').references(() => myTextsTable.mtId).notNull(),
    workshiftIfnotLeaveTextId: uuid('workshift_ifnot_leave_text_id').references(() => myTextsTable.mtId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    workshiftCreatedAt: timestamp('workshift_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueWorkshiftName: unique().on(table.workshiftName, table.companyId)
}));

export const departmentsTable = pgTable('departments', {
    departmentId: uuid('department_id').defaultRandom().primaryKey(),
    departmentName: varchar('department_name', { length: 32 }).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    departmentCreatedAt: timestamp('department_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueDepartmentName: unique().on(table.departmentName, table.companyId)
}));

export const employeesTable = pgTable('employees', {
    employeeId: uuid('employee_id').defaultRandom().primaryKey(),
    employeeFirstName: varchar('employee_first_name', { length: 30 }).notNull(),
    employeeLastName: varchar('employee_last_name', { length: 30 }).notNull(),
    employeeFatherName: varchar('employee_father_name', { length: 30 }).notNull(),
    employeeBirthDate: varchar('employee_birth_date', { length: 10 }).notNull(),
    employeeGender: boolean('employee_gender').notNull(),
    employeePhoneNumberMain: varchar('employee_phone_number_main', { length: 12 }).notNull(),
    employeePhoneNumberOptional: varchar('employee_phone_number_optional', { length: 12 }),
    employeeImg: varchar('employee_img', { length: 64 }).notNull(),
    employeeIsAdmin: boolean('employee_is_admin').notNull().default(false),
    employeeLogin: varchar('employee_login', { length: 64 }),
    employeePassword: varchar('employee_password', { length: 64 }),
    employeeIsDelete: boolean('employee_delete').notNull().default(false),
    employeeHomeNumber: text('employee_home_number').notNull(),
    employeeDescription: text('employee_description'),
    employeeDeviceDisplayId: text('employee_device_display_id').notNull(),
    employeeChatId: bigint('employee_chat_id', { mode: 'number' }),
    roleId: uuid('role_id').references(() => rolesTable.roleId).notNull(),
    branchId: uuid('branch_id').references(() => branchesTable.branchId).notNull(),
    addressId: uuid('address_id').references(() => addressesTable.addressId).notNull(),
    departmentId: uuid('department_id').references(() => departmentsTable.departmentId).notNull(),
    workshiftId: uuid('workshift_id').references(() => workshiftsTable.workshiftId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    employeeCreatedAt: timestamp('employee_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueLogin: unique().on(table.employeeLogin),
    uniqueMainPhoneNumber: unique().on(table.employeePhoneNumberMain, table.companyId),
    uniqueDeviceDisplayId: unique().on(table.employeeDeviceDisplayId),
}));

export const enabledSmsNumbersTable = pgTable('enabled_sms_numbers', {
    esnId: uuid('esn_id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesTable.employeeId).notNull(),
    esnNumberType: enabledSmsNumbersEsnNumberTypeEnum('esn_number_type').notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    esnCreatedAt: timestamp('esn_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueEnabledSmsNumber: unique().on(table.employeeId, table.esnNumberType)
}));

export const branchEmployeesTable = pgTable('branch_employees', {
    beId: uuid('be_id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').references(() => branchesTable.branchId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    employeeId: uuid('employee_id').references(() => employeesTable.employeeId).notNull(),
    beCreatedAt: timestamp('be_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueEnabledSmsNumber: unique().on(table.employeeId, table.branchId)
}));

export const devicesTable = pgTable('devices', {
    deviceId: uuid('device_id').defaultRandom().primaryKey(),
    deviceName: varchar('device_name', { length: 64 }).notNull(),
    deviceSerialName: text('device_serial_name').notNull(),
    deviceType: devicesDeviceTypeEnum('device_type').notNull(),
    deviceStatus: devicesDeviceStatusEnum('device_status').notNull().default('offline'),
    deviceStatusTime: timestamp('device_status_time').notNull().defaultNow(),
    deviceLastAttendanceTime: timestamp('device_last_attendance_time').notNull().defaultNow(),
    deviceGatewayId: varchar('device_gateway_id').notNull(),
    branchId: uuid('branch_id').references(() => branchesTable.branchId),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    deviceCreatedAt: timestamp('device_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueDeviceName: unique().on(table.deviceName, table.companyId),
    uniqueDeviceSerialName: unique().on(table.deviceSerialName, table.companyId),
    uniqueDeviceGatewayId: unique().on(table.deviceGatewayId, table.companyId),
}));

export const attendancesTable = pgTable('attendances', {
    attendanceId: uuid('attendance_id').defaultRandom().primaryKey(),
    attendanceTime: timestamp('attendance_time', { withTimezone: true }).notNull(),
    attendanceType: attendancesAttendanceTypeEnum('attendance_type').notNull(),
    employeeId: uuid('employee_id').references(() => employeesTable.employeeId).notNull(),
    branchId: uuid('branch_id').references(() => branchesTable.branchId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    attendanceCreatedAt: timestamp('attendance_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueAttendance: unique().on(table.attendanceTime, table.attendanceType, table.employeeId),
    idxEmployeeTime: index().on(table.employeeId, table.attendanceTime),
    idxCompanyTime: index().on(table.companyId, table.attendanceTime),
    idxBranchTime: index().on(table.branchId, table.attendanceTime),
    idxEmployee: index().on(table.employeeId),
}));

export const smsMessagesTable = pgTable('sms_messages', {
    smId: uuid('sm_id').defaultRandom().primaryKey(),
    smText: text('sm_text').notNull(),
    smPhoneNumber: text('sm_phone_number').notNull(),
    smEskizUuid: text('sm_eskiz_uuid').notNull(),
    smEskizSerialId: integer('sm_eskiz_serial_id'),
    smOriginalPrice: smallint('sm_original_price').notNull().default(0),
    smOriginalTotalPrice: smallint('sm_original_total_price').notNull().default(0),
    smPhoneNumberCompanyName: smsMessagesSmPhoneNumberCompanyNameEnum('sm_phone_number_company_name').notNull(),
    smPrice: smallint('sm_price').notNull().default(0),
    smCount: smallint('sm_count').notNull().default(0),
    smStatusType: smsMessagesSmStatusTypeEnum('sm_status_type').notNull(),
    smStatusTime: timestamp('sm_status_time').notNull().defaultNow(),
    employeeId: uuid('employee_id').references(() => employeesTable.employeeId).notNull(),
    companyId: uuid('company_id').references(() => companiesTable.companyId).notNull(),
    smCreatedAt: timestamp('sm_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniqueSmEskizUuid: unique().on(table.smEskizUuid),
    uniqueSmEskizSerialId: unique().on(table.smEskizSerialId),
}));

export const paymentTransactionsTable = pgTable('payment_transactions', {
    ptId: uuid('pt_id').defaultRandom().primaryKey(),
    ptAmount: integer('pt_amount').notNull(),
    companyId: uuid('company_id').notNull().references(() => companiesTable.companyId),
    ptCreatedAt: timestamp('sm_created_at', { withTimezone: true }).notNull().defaultNow()
});

export const eskizTokensTable = pgTable('eskiz_token', {
    etId: uuid('et_id').defaultRandom().primaryKey(),
    etToken: text('et_token').notNull(),
    updatedAt: timestamp('et_updated_at').notNull().defaultNow(),
    etCreatedAt: timestamp('et_created_at', { withTimezone: true }).notNull().defaultNow()
});

export const pendingJobsTable = pgTable('pending_jobs', {
    pjId: uuid('pj_id').defaultRandom().primaryKey(),
    pjType: pendingJobsPjTypeEnum('pj_type').notNull(),
    pjErrorMessage: text('pj_error_message'),
    deviceId: uuid('device_id').notNull().references(() => devicesTable.deviceId),
    employeeId: uuid('employee_id').notNull().references(() => employeesTable.employeeId),
    companyId: uuid('company_id').notNull().references(() => companiesTable.companyId),
    pjCreatedAt: timestamp('pj_created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    uniquePending: unique().on(table.pjType, table.deviceId, table.employeeId)
}));

export const telegramErroredMessagesTable = pgTable('telegram_errored_messages', {
    temId: uuid('tem_id').defaultRandom().primaryKey(),
    temChatId: bigint('tem_chat_id', { mode: 'number' }).notNull(),
    temMessage: text('tem_message').notNull(),
    temErrorMessage: text('tem_error_message').notNull(),
    employeeId: uuid('employee_id').notNull().references(() => employeesTable.employeeId),
    companyId: uuid('company_id').notNull().references(() => companiesTable.companyId),
    temCreatedAt: timestamp('tem_created_at', { withTimezone: true }).notNull().defaultNow()
});

namespace DbTableSchema {
    export const requestsLOGS = requestsLOGSTable
    export const internalErrorsLOGS = internalErrorsLOGSTable
    export const cronJobsLOGS = cronJobsLOGSTable
    
    export const companies = companiesTable
    export const roles = rolesTable
    export const addressRegions = addressRegionsTable
    export const addressDistricts = addressDistrictsTable
    export const addressStreets = addressStreetsTable
    export const addresses = addressesTable
    export const branches = branchesTable
    export const myTexts = myTextsTable
    export const workshifts = workshiftsTable
    export const departments = departmentsTable
    export const employees = employeesTable
    export const enabledSmsNumbers = enabledSmsNumbersTable
    export const branchEmployees = branchEmployeesTable
    export const devices = devicesTable
    export const attendances = attendancesTable
    export const smsMessages = smsMessagesTable
    export const paymentTransactions = paymentTransactionsTable
    export const eskizTokens = eskizTokensTable
    export const pendingJobs = pendingJobsTable
    export const telegramErroredMessages = telegramErroredMessagesTable

    export const requestLogsRlTypeEnumList = requestLogsRlTypeEnum.enumValues
    export const devicesDeviceStatusEnumList = devicesDeviceStatusEnum.enumValues
    export const addressesAddressTypeEnumList = addressesAddressTypeEnum.enumValues
    export const attendancesAttendanceTypeEnumList = attendancesAttendanceTypeEnum.enumValues
    export const devicesDeviceTypeEnumList = devicesDeviceTypeEnum.enumValues
    export const pendingJobsPjTypeEnumList = pendingJobsPjTypeEnum.enumValues
    export const enabledSmsNumbersEsnNumberTypeEnumList = enabledSmsNumbersEsnNumberTypeEnum.enumValues
    export const myTextsMtStatusEnumList = myTextsMtStatusEnum.enumValues
    export const smsMessagesSmStatusTypeEnumList = smsMessagesSmStatusTypeEnum.enumValues
    export const smsMessagesSmPhoneNumberCompanyNameEnumList = smsMessagesSmPhoneNumberCompanyNameEnum.enumValues

    export type TRequestLogsRlTypeEnum = typeof requestLogsRlTypeEnum.enumValues[number]
    export type TDevicesDeviceStatusEnum = typeof devicesDeviceStatusEnum.enumValues[number]
    export type TAddressesAddressTypeEnum = typeof addressesAddressTypeEnum.enumValues[number]
    export type TAttendancesAttendanceTypeEnum = typeof attendancesAttendanceTypeEnum.enumValues[number]
    export type TDevicesDeviceTypeEnum = typeof devicesDeviceTypeEnum.enumValues[number]
    export type TPendingJobsPjTypeEnum = typeof pendingJobsPjTypeEnum.enumValues[number]
    export type TEnabledSmsNumbersEsnNumberTypeEnum = typeof enabledSmsNumbersEsnNumberTypeEnum.enumValues[number]
    export type TMyTextsMtStatusEnum = typeof myTextsMtStatusEnum.enumValues[number]
    export type TSmsMessagesSmStatusTypeEnum = typeof smsMessagesSmStatusTypeEnum.enumValues[number]
    export type TSmsMessagesSmPhoneNumberCompanyNameEnum = typeof smsMessagesSmPhoneNumberCompanyNameEnum.enumValues[number]

    export type InferInsertType<T extends Table> = T['_']['inferInsert'];
    export type InferUpdateType<T extends Table> = Partial<InferInsertType<T>>;
    export type InferSelectType<T extends Table, P extends boolean | null = null> = P extends true ? Partial<T['_']['inferSelect']> : T['_']['inferSelect'];
}

export default DbTableSchema