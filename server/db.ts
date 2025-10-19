import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  academicYears,
  actionTypes,
  activityLogs,
  disciplinaryActions,
  grades,
  guardianCommunications,
  improvementPlans,
  InsertAcademicYear,
  InsertActionType,
  InsertActivityLog,
  InsertDisciplinaryAction,
  InsertGrade,
  InsertGuardianCommunication,
  InsertImprovementPlan,
  InsertNotification,
  InsertPlanFollowUp,
  InsertSection,
  InsertStudent,
  InsertUser,
  InsertViolation,
  InsertViolationType,
  notifications,
  planFollowUps,
  sections,
  students,
  users,
  violationTypes,
  violations,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ Users ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

// ============ Academic Years ============
export async function createAcademicYear(data: InsertAcademicYear) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // إذا كانت السنة نشطة، نلغي تنشيط السنوات الأخرى
  if (data.isActive) {
    await db
      .update(academicYears)
      .set({ isActive: false })
      .where(eq(academicYears.isActive, true));
  }

  const result = await db.insert(academicYears).values(data);
  return result;
}

export async function getActiveAcademicYear() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(academicYears)
    .where(eq(academicYears.isActive, true))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllAcademicYears() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(academicYears).orderBy(desc(academicYears.startDate));
}

export async function setActiveAcademicYear(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(academicYears)
    .set({ isActive: false })
    .where(eq(academicYears.isActive, true));

  await db
    .update(academicYears)
    .set({ isActive: true })
    .where(eq(academicYears.id, id));
}

// ============ Grades ============
export async function createGrade(data: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(grades).values(data);
}

export async function updateGrade(id: number, data: { name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(grades).set(data).where(eq(grades.id, id));
}

export async function getGradesByAcademicYear(academicYearId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: grades.id,
      name: grades.name,
      level: grades.level,
      academicYearId: grades.academicYearId,
      createdAt: grades.createdAt,
      studentCount: sql<number>`COUNT(${students.id})`,
    })
    .from(grades)
    .leftJoin(students, eq(grades.id, students.gradeId))
    .where(eq(grades.academicYearId, academicYearId))
    .groupBy(grades.id)
    .orderBy(grades.level);
  
  return result;
}

export async function deleteGrade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(grades).where(eq(grades.id, id));
}

// ============ Sections ============
export async function createSection(data: InsertSection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(sections).values(data);
}

export async function getSectionsByGrade(gradeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sections)
    .where(eq(sections.gradeId, gradeId));
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(sections).where(eq(sections.id, id));
}

// ============ Students ============
export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(students).values(data);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(students).where(eq(students.id, id));
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      student: students,
      grade: grades,
      section: sections,
      academicYear: academicYears,
    })
    .from(students)
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .leftJoin(academicYears, eq(students.academicYearId, academicYears.id))
    .where(eq(students.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getStudentsByAcademicYear(academicYearId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      student: students,
      grade: grades,
      section: sections,
    })
    .from(students)
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(eq(students.academicYearId, academicYearId))
    .orderBy(grades.level, sections.name, students.name);
}

export async function countStudentsBySection(sectionId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(eq(students.sectionId, sectionId));
  return result[0]?.count || 0;
}

export async function countStudentsByGrade(gradeId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(eq(students.gradeId, gradeId));
  return result[0]?.count || 0;
}

export async function searchStudents(
  academicYearId: number,
  searchTerm?: string,
  gradeId?: number,
  sectionId?: number
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(students.academicYearId, academicYearId)];

  if (searchTerm) {
    conditions.push(
      or(
        sql`${students.name} LIKE ${`%${searchTerm}%`}`,
        sql`${students.studentNumber} LIKE ${`%${searchTerm}%`}`
      )!
    );
  }

  if (gradeId) {
    conditions.push(eq(students.gradeId, gradeId));
  }

  if (sectionId) {
    conditions.push(eq(students.sectionId, sectionId));
  }

  const result = await db
    .select({
      student: students,
      grade: grades,
      section: sections,
      violationCount: sql<number>`COUNT(DISTINCT ${violations.id})`
    })
    .from(students)
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .leftJoin(violations, eq(students.id, violations.studentId))
    .where(and(...conditions))
    .groupBy(students.id, grades.id, sections.id)
    .orderBy(students.name);
  
  return result;
}

// ============ Violation Types ============
export async function createViolationType(data: InsertViolationType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(violationTypes).values(data);
}

export async function getActiveViolationTypes() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(violationTypes)
    .where(eq(violationTypes.isActive, true))
    .orderBy(violationTypes.severity, violationTypes.name);
}

export async function getAllViolationTypes() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(violationTypes)
    .orderBy(violationTypes.severity, violationTypes.name);
}

export async function updateViolationType(
  id: number,
  data: Partial<InsertViolationType>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(violationTypes)
    .set(data)
    .where(eq(violationTypes.id, id));
}

export async function deleteViolationType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(violationTypes).where(eq(violationTypes.id, id));
}

// ============ Violations ============
export async function createViolation(data: InsertViolation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(violations).values(data);
}

export async function getViolationsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      violation: violations,
      violationType: violationTypes,
    })
    .from(violations)
    .leftJoin(
      violationTypes,
      eq(violations.violationTypeId, violationTypes.id)
    )
    .where(eq(violations.studentId, studentId))
    .orderBy(desc(violations.date));
}

export async function getRecentViolations(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      violation: violations,
      violationType: violationTypes,
      student: students,
      grade: grades,
      section: sections,
    })
    .from(violations)
    .leftJoin(
      violationTypes,
      eq(violations.violationTypeId, violationTypes.id)
    )
    .leftJoin(students, eq(violations.studentId, students.id))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .orderBy(desc(violations.createdAt))
    .limit(limit);
}

export async function getViolationsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      violation: violations,
      violationType: violationTypes,
      student: students,
      grade: grades,
      section: sections,
    })
    .from(violations)
    .leftJoin(
      violationTypes,
      eq(violations.violationTypeId, violationTypes.id)
    )
    .leftJoin(students, eq(violations.studentId, students.id))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(and(gte(violations.date, startDate), lte(violations.date, endDate)))
    .orderBy(desc(violations.date));
}

export async function searchViolations(
  academicYearId: number,
  searchTerm?: string,
  gradeId?: number,
  severity?: "minor" | "moderate" | "severe"
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(students.academicYearId, academicYearId)];

  if (searchTerm) {
    conditions.push(
      or(
        sql`${students.name} LIKE ${`%${searchTerm}%`}`,
        sql`${violationTypes.name} LIKE ${`%${searchTerm}%`}`
      )!
    );
  }

  if (gradeId) {
    conditions.push(eq(students.gradeId, gradeId));
  }

  if (severity) {
    conditions.push(eq(violationTypes.severity, severity));
  }

  return await db
    .select({
      violation: violations,
      violationType: violationTypes,
      student: students,
      grade: grades,
      section: sections,
    })
    .from(violations)
    .leftJoin(violationTypes, eq(violations.violationTypeId, violationTypes.id))
    .leftJoin(students, eq(violations.studentId, students.id))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(and(...conditions))
    .orderBy(desc(violations.date));
}

export async function deleteViolation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(violations).where(eq(violations.id, id));
}

export async function getStudentViolationStats(studentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      totalViolations: sql<number>`COUNT(*)`,
      totalPoints: sql<number>`SUM(${violations.points})`,
      minorCount: sql<number>`SUM(CASE WHEN ${violationTypes.severity} = 'minor' THEN 1 ELSE 0 END)`,
      moderateCount: sql<number>`SUM(CASE WHEN ${violationTypes.severity} = 'moderate' THEN 1 ELSE 0 END)`,
      severeCount: sql<number>`SUM(CASE WHEN ${violationTypes.severity} = 'severe' THEN 1 ELSE 0 END)`,
    })
    .from(violations)
    .leftJoin(
      violationTypes,
      eq(violations.violationTypeId, violationTypes.id)
    )
    .where(eq(violations.studentId, studentId));

  return result[0];
}

// ============ Action Types ============
export async function createActionType(data: InsertActionType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(actionTypes).values(data);
}

export async function getActiveActionTypes() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(actionTypes)
    .where(eq(actionTypes.isActive, true))
    .orderBy(actionTypes.severity, actionTypes.name);
}

// ============ Disciplinary Actions ============
export async function createDisciplinaryAction(data: InsertDisciplinaryAction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(disciplinaryActions).values(data);
}

export async function getDisciplinaryActionsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      action: disciplinaryActions,
      actionType: actionTypes,
      violation: violations,
    })
    .from(disciplinaryActions)
    .leftJoin(actionTypes, eq(disciplinaryActions.actionTypeId, actionTypes.id))
    .leftJoin(violations, eq(disciplinaryActions.violationId, violations.id))
    .where(eq(disciplinaryActions.studentId, studentId))
    .orderBy(desc(disciplinaryActions.date));
}

// ============ Improvement Plans ============
export async function createImprovementPlan(data: InsertImprovementPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(improvementPlans).values(data);
}

export async function updateImprovementPlan(
  id: number,
  data: Partial<InsertImprovementPlan>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(improvementPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(improvementPlans.id, id));
}

export async function getImprovementPlansByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(improvementPlans)
    .where(eq(improvementPlans.studentId, studentId))
    .orderBy(desc(improvementPlans.createdAt));
}

export async function getActivePlans() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      plan: improvementPlans,
      student: students,
      grade: grades,
      section: sections,
    })
    .from(improvementPlans)
    .leftJoin(students, eq(improvementPlans.studentId, students.id))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(eq(improvementPlans.status, "active"))
    .orderBy(improvementPlans.endDate);
}

// ============ Plan Follow Ups ============
export async function createPlanFollowUp(data: InsertPlanFollowUp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(planFollowUps).values(data);
}

export async function getFollowUpsByPlan(planId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(planFollowUps)
    .where(eq(planFollowUps.planId, planId))
    .orderBy(desc(planFollowUps.date));
}

// ============ Guardian Communications ============
export async function createGuardianCommunication(
  data: InsertGuardianCommunication
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(guardianCommunications).values(data);
}

export async function getGuardianCommunicationsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guardianCommunications)
    .where(eq(guardianCommunications.studentId, studentId))
    .orderBy(desc(guardianCommunications.date));
}

// ============ Notifications ============
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notifications).values(data);
}

export async function getNotificationsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      notification: notifications,
      student: students,
      sender: users,
    })
    .from(notifications)
    .leftJoin(
      students,
      eq(notifications.relatedStudentId, students.id)
    )
    .leftJoin(users, eq(notifications.senderId, users.id))
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function getUnreadNotificationCount(userId: string) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      )
    );

  return result[0]?.count || 0;
}

// ============ Activity Logs ============
export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(activityLogs).values(data);
}

export async function getRecentActivityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      log: activityLogs,
      user: users,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getActivityLogsByEntity(
  entityType: string,
  entityId: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      log: activityLogs,
      user: users,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(
      and(
        eq(activityLogs.entityType, entityType),
        eq(activityLogs.entityId, entityId)
      )
    )
    .orderBy(desc(activityLogs.createdAt));
}

// ============ Dashboard Stats ============
export async function getDashboardStats(academicYearId: number) {
  const db = await getDb();
  if (!db) return null;

  const totalStudents = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(
        eq(students.academicYearId, academicYearId),
        eq(students.isActive, true)
      )
    );

  const totalViolationsToday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(violations)
    .leftJoin(students, eq(violations.studentId, students.id))
    .where(
      and(
        eq(students.academicYearId, academicYearId),
        sql`DATE(${violations.date}) = CURDATE()`
      )
    );

  const totalViolationsThisMonth = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(violations)
    .leftJoin(students, eq(violations.studentId, students.id))
    .where(
      and(
        eq(students.academicYearId, academicYearId),
        sql`MONTH(${violations.date}) = MONTH(CURDATE())`,
        sql`YEAR(${violations.date}) = YEAR(CURDATE())`
      )
    );

  const activePlansCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(improvementPlans)
    .leftJoin(students, eq(improvementPlans.studentId, students.id))
    .where(
      and(
        eq(students.academicYearId, academicYearId),
        eq(improvementPlans.status, "active")
      )
    );

  return {
    totalStudents: totalStudents[0]?.count || 0,
    totalViolationsToday: totalViolationsToday[0]?.count || 0,
    totalViolationsThisMonth: totalViolationsThisMonth[0]?.count || 0,
    activePlans: activePlansCount[0]?.count || 0,
  };
}

export async function getViolationsByGrade(academicYearId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      gradeName: grades.name,
      gradeLevel: grades.level,
      violationCount: sql<number>`COUNT(${violations.id})`,
      totalPoints: sql<number>`SUM(${violations.points})`,
    })
    .from(violations)
    .leftJoin(students, eq(violations.studentId, students.id))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .where(eq(students.academicYearId, academicYearId))
    .groupBy(grades.id, grades.name, grades.level)
    .orderBy(grades.level);
}

export async function getTopViolators(academicYearId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      student: students,
      grade: grades,
      section: sections,
      violationCount: sql<number>`COUNT(${violations.id})`,
      totalPoints: sql<number>`SUM(${violations.points})`,
    })
    .from(students)
    .leftJoin(violations, eq(students.id, violations.studentId))
    .leftJoin(grades, eq(students.gradeId, grades.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(eq(students.academicYearId, academicYearId))
    .groupBy(
      students.id,
      students.studentNumber,
      students.name,
      students.gradeId,
      students.sectionId,
      students.academicYearId,
      students.guardianName,
      students.guardianPhone,
      students.notes,
      students.isActive,
      students.createdAt,
      students.createdBy,
      grades.id,
      grades.name,
      grades.level,
      grades.academicYearId,
      grades.createdAt,
      sections.id,
      sections.name,
      sections.gradeId,
      sections.createdAt
    )
    .orderBy(desc(sql`COUNT(${violations.id})`))
    .limit(limit);
}

export async function getMostCommonViolations(academicYearId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      violationType: violationTypes,
      count: sql<number>`COUNT(${violations.id})`,
    })
    .from(violations)
    .leftJoin(
      violationTypes,
      eq(violations.violationTypeId, violationTypes.id)
    )
    .leftJoin(students, eq(violations.studentId, students.id))
    .where(eq(students.academicYearId, academicYearId))
    .groupBy(violationTypes.id)
    .orderBy(desc(sql`COUNT(${violations.id})`))
    .limit(10);
}

