import { drizzle } from "drizzle-orm/mysql2";
import {
  academicYears,
  actionTypes,
  grades,
  sections,
  violationTypes,
} from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 بدء تعبئة البيانات الأولية...");

  // إنشاء السنة الدراسية الحالية
  const academicYear = await db.insert(academicYears).values({
    name: "2024-2025",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2025-06-30"),
    isActive: true,
    createdBy: "system",
  });

  console.log("✅ تم إنشاء السنة الدراسية");

  // إنشاء الصفوف الدراسية
  const gradeData = [
    { name: "الصف الأول الابتدائي", level: 1 },
    { name: "الصف الثاني الابتدائي", level: 2 },
    { name: "الصف الثالث الابتدائي", level: 3 },
  ];

  for (const grade of gradeData) {
    const result = await db.insert(grades).values({
      ...grade,
      academicYearId: 1,
    });

    // إنشاء الأقسام لكل صف
    const sectionNames = ["أ", "ب", "ج"];
    for (let i = 0; i < sectionNames.length; i++) {
      await db.insert(sections).values({
        name: sectionNames[i],
        gradeId: ((grade.level - 1) * 3) + i + 1,
      });
    }
  }

  console.log("✅ تم إنشاء الصفوف والأقسام");

  // إنشاء أنواع المخالفات
  const violationTypeData = [
    {
      name: "التأخر الصباحي",
      description: "التأخر عن الطابور الصباحي",
      severity: "minor" as const,
      points: 1,
      createdBy: "system",
    },
    {
      name: "الغياب بدون عذر",
      description: "الغياب عن المدرسة بدون عذر رسمي",
      severity: "moderate" as const,
      points: 3,
      createdBy: "system",
    },
    {
      name: "العنف الجسدي",
      description: "الاعتداء الجسدي على طالب آخر",
      severity: "severe" as const,
      points: 10,
      createdBy: "system",
    },
  ];

  for (const vt of violationTypeData) {
    await db.insert(violationTypes).values(vt);
  }

  console.log("✅ تم إنشاء أنواع المخالفات");

  // إنشاء أنواع الإجراءات التأديبية
  const actionTypeData = [
    {
      name: "إنذار شفوي",
      description: "توجيه إنذار شفوي للطالب",
      severity: "minor" as const,
    },
    {
      name: "استدعاء ولي الأمر",
      description: "استدعاء ولي الأمر لمناقشة سلوك الطالب",
      severity: "moderate" as const,
    },
  ];

  for (const at of actionTypeData) {
    await db.insert(actionTypes).values(at);
  }

  console.log("✅ تم إنشاء أنواع الإجراءات التأديبية");
  console.log("🎉 اكتملت تعبئة البيانات الأولية بنجاح!");
}

seed()
  .catch((error) => {
    console.error("❌ خطأ في تعبئة البيانات:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
