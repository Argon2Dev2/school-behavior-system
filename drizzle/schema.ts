import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين (المشرفين التربويين)
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول السنوات الدراسية
 */
export const academicYears = mysqlTable("academic_years", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(), // مثل: 2024-2025
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate").notNull(),
  isActive: boolean("isActive").default(false).notNull(), // السنة النشطة حالياً
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type AcademicYear = typeof academicYears.$inferSelect;
export type InsertAcademicYear = typeof academicYears.$inferInsert;

/**
 * جدول الصفوف الدراسية
 */
export const grades = mysqlTable("grades", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(), // مثل: الصف الأول الابتدائي
  level: int("level").notNull(), // 1, 2, 3... للترتيب
  academicYearId: int("academicYearId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;

/**
 * جدول الأقسام (الفصول)
 */
export const sections = mysqlTable("sections", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(), // مثل: أ، ب، ج
  gradeId: int("gradeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

/**
 * جدول الطلاب
 */
export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  studentNumber: varchar("studentNumber", { length: 50 }).notNull().unique(), // رقم الطالب
  name: varchar("name", { length: 200 }).notNull(),
  gradeId: int("gradeId").notNull(),
  sectionId: int("sectionId").notNull(),
  academicYearId: int("academicYearId").notNull(),
  guardianName: varchar("guardianName", { length: 200 }), // اسم ولي الأمر
  guardianPhone: varchar("guardianPhone", { length: 50 }), // رقم ولي الأمر
  notes: text("notes"), // ملاحظات عامة
  isActive: boolean("isActive").default(true).notNull(), // نشط أم محول
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * جدول أنواع المخالفات
 */
export const violationTypes = mysqlTable("violation_types", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 200 }).notNull(), // مثل: التأخر الصباحي
  description: text("description"),
  severity: mysqlEnum("severity", ["minor", "moderate", "severe"]).notNull(), // بسيط، متوسط، خطير
  points: int("points").notNull(), // عدد النقاط
  suggestedAction: text("suggestedAction"), // الإجراء المقترح
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type ViolationType = typeof violationTypes.$inferSelect;
export type InsertViolationType = typeof violationTypes.$inferInsert;

/**
 * جدول المخالفات
 */
export const violations = mysqlTable("violations", {
  id: int("id").primaryKey().autoincrement(),
  studentId: int("studentId").notNull(),
  violationTypeId: int("violationTypeId").notNull(),
  date: datetime("date").notNull(), // تاريخ ووقت المخالفة
  location: varchar("location", { length: 200 }), // مكان المخالفة
  description: text("description"), // وصف تفصيلي
  points: int("points").notNull(), // النقاط (منسوخة من نوع المخالفة)
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(), // المشرف الذي سجل المخالفة
});

export type Violation = typeof violations.$inferSelect;
export type InsertViolation = typeof violations.$inferInsert;

/**
 * جدول أنواع الإجراءات التأديبية
 */
export const actionTypes = mysqlTable("action_types", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 200 }).notNull(), // مثل: إنذار شفوي، إنذار كتابي
  description: text("description"),
  severity: mysqlEnum("severity", ["minor", "moderate", "severe"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ActionType = typeof actionTypes.$inferSelect;
export type InsertActionType = typeof actionTypes.$inferInsert;

/**
 * جدول الإجراءات التأديبية المتخذة
 */
export const disciplinaryActions = mysqlTable("disciplinary_actions", {
  id: int("id").primaryKey().autoincrement(),
  studentId: int("studentId").notNull(),
  actionTypeId: int("actionTypeId").notNull(),
  violationId: int("violationId"), // المخالفة المسببة (اختياري)
  date: datetime("date").notNull(),
  description: text("description"),
  documentUrl: varchar("documentUrl", { length: 500 }), // رابط المستند المرفق
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type DisciplinaryAction = typeof disciplinaryActions.$inferSelect;
export type InsertDisciplinaryAction = typeof disciplinaryActions.$inferInsert;

/**
 * جدول خطط التحسين السلوكي
 */
export const improvementPlans = mysqlTable("improvement_plans", {
  id: int("id").primaryKey().autoincrement(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate").notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"])
    .default("active")
    .notNull(),
  goals: text("goals"), // الأهداف (JSON)
  progress: text("progress"), // التقدم (JSON)
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ImprovementPlan = typeof improvementPlans.$inferSelect;
export type InsertImprovementPlan = typeof improvementPlans.$inferInsert;

/**
 * جدول متابعة خطط التحسين
 */
export const planFollowUps = mysqlTable("plan_follow_ups", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("planId").notNull(),
  date: datetime("date").notNull(),
  notes: text("notes").notNull(),
  rating: int("rating"), // تقييم من 1-5
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type PlanFollowUp = typeof planFollowUps.$inferSelect;
export type InsertPlanFollowUp = typeof planFollowUps.$inferInsert;

/**
 * جدول سجل التواصل مع أولياء الأمور
 */
export const guardianCommunications = mysqlTable("guardian_communications", {
  id: int("id").primaryKey().autoincrement(),
  studentId: int("studentId").notNull(),
  date: datetime("date").notNull(),
  method: mysqlEnum("method", ["phone", "meeting", "letter", "other"]).notNull(), // طريقة التواصل
  subject: varchar("subject", { length: 300 }).notNull(),
  notes: text("notes").notNull(),
  followUpRequired: boolean("followUpRequired").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
});

export type GuardianCommunication = typeof guardianCommunications.$inferSelect;
export type InsertGuardianCommunication =
  typeof guardianCommunications.$inferInsert;

/**
 * جدول الإشعارات الداخلية بين المشرفين
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(), // المستلم
  senderId: varchar("senderId", { length: 64 }).notNull(), // المرسل
  type: mysqlEnum("type", [
    "violation_alert",
    "plan_update",
    "general",
  ]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  message: text("message").notNull(),
  relatedStudentId: int("relatedStudentId"), // الطالب المتعلق بالإشعار
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * جدول سجل النشاطات (Activity Log)
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // مثل: create_violation, update_student
  entityType: varchar("entityType", { length: 50 }).notNull(), // مثل: violation, student
  entityId: int("entityId").notNull(),
  details: text("details"), // تفاصيل إضافية (JSON)
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// Relations
export const studentsRelations = relations(students, ({ one, many }) => ({
  grade: one(grades, {
    fields: [students.gradeId],
    references: [grades.id],
  }),
  section: one(sections, {
    fields: [students.sectionId],
    references: [sections.id],
  }),
  academicYear: one(academicYears, {
    fields: [students.academicYearId],
    references: [academicYears.id],
  }),
  violations: many(violations),
  disciplinaryActions: many(disciplinaryActions),
  improvementPlans: many(improvementPlans),
  guardianCommunications: many(guardianCommunications),
}));

export const violationsRelations = relations(violations, ({ one }) => ({
  student: one(students, {
    fields: [violations.studentId],
    references: [students.id],
  }),
  violationType: one(violationTypes, {
    fields: [violations.violationTypeId],
    references: [violationTypes.id],
  }),
}));

export const disciplinaryActionsRelations = relations(
  disciplinaryActions,
  ({ one }) => ({
    student: one(students, {
      fields: [disciplinaryActions.studentId],
      references: [students.id],
    }),
    actionType: one(actionTypes, {
      fields: [disciplinaryActions.actionTypeId],
      references: [actionTypes.id],
    }),
    violation: one(violations, {
      fields: [disciplinaryActions.violationId],
      references: [violations.id],
    }),
  })
);

export const improvementPlansRelations = relations(
  improvementPlans,
  ({ one, many }) => ({
    student: one(students, {
      fields: [improvementPlans.studentId],
      references: [students.id],
    }),
    followUps: many(planFollowUps),
  })
);

export const planFollowUpsRelations = relations(planFollowUps, ({ one }) => ({
  plan: one(improvementPlans, {
    fields: [planFollowUps.planId],
    references: [improvementPlans.id],
  }),
}));

export const guardianCommunicationsRelations = relations(
  guardianCommunications,
  ({ one }) => ({
    student: one(students, {
      fields: [guardianCommunications.studentId],
      references: [students.id],
    }),
  })
);

export const gradesRelations = relations(grades, ({ one, many }) => ({
  academicYear: one(academicYears, {
    fields: [grades.academicYearId],
    references: [academicYears.id],
  }),
  sections: many(sections),
  students: many(students),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  grade: one(grades, {
    fields: [sections.gradeId],
    references: [grades.id],
  }),
  students: many(students),
}));

