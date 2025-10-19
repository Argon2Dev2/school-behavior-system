import { drizzle } from "drizzle-orm/mysql2";
import { students, grades, violations } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedDemoData() {
  console.log("🌱 بدء تعبئة البيانات التجريبية...");

  const gradeNames = [
    "الصف الأول الابتدائي",
    "الصف الثاني الابتدائي", 
    "الصف الثالث الابتدائي",
    "الصف الرابع الابتدائي",
    "الصف الخامس الابتدائي",
    "الصف السادس الابتدائي",
    "الصف الأول المتوسط",
    "الصف الثاني المتوسط",
    "الصف الثالث المتوسط"
  ];

  console.log("📚 إضافة الصفوف...");
  for (let i = 0; i < gradeNames.length; i++) {
    await db.insert(grades).values({
      name: gradeNames[i],
      level: i + 1,
      academicYearId: 1,
    }).onDuplicateKeyUpdate({ set: { name: gradeNames[i] } });
  }

  const studentNames = [
    "عبدالله محمد الأحمد", "سعود خالد العتيبي", "فهد عبدالعزيز القحطاني",
    "محمد سعد الغامدي", "عمر أحمد الشهري", "يوسف علي الدوسري",
    "خالد فهد المطيري", "ناصر سلطان الحربي", "تركي عبدالرحمن السبيعي",
    "بندر ماجد الزهراني", "سلطان فيصل العنزي", "راشد محمد الرشيدي",
    "مشعل عبدالله العمري", "نواف سعود الشمري", "عادل خالد البقمي",
    "ماجد فهد الجهني", "طلال عبدالعزيز الخالدي", "وليد أحمد السهلي",
    "حمد سعد اليامي", "عبدالرحمن علي الفهد", "صالح محمد النمري",
    "إبراهيم خالد الصالح", "أحمد عبدالله المنصور", "حسن سعود الحسن",
    "علي فهد العلي", "منصور عبدالعزيز المنصور", "سامي أحمد السامي",
    "زياد محمد الزياد", "فيصل خالد الفيصل", "عبدالإله سعد العبدالإله"
  ];

  console.log("👨‍🎓 إضافة الطلاب...");
  const studentIds: number[] = [];
  
  for (let i = 0; i < studentNames.length; i++) {
    const gradeId = (i % 9) + 1;
    const result = await db.insert(students).values({
      studentNumber: `STD${2024}${String(i + 1).padStart(4, '0')}`,
      name: studentNames[i],
      gradeId: gradeId,
      sectionId: 1,
      academicYearId: 1,
      guardianName: `ولي أمر ${studentNames[i].split(' ')[0]}`,
      guardianPhone: `05${Math.floor(Math.random() * 90000000 + 10000000)}`,
      isActive: true,
      createdBy: "system",
    });
    studentIds.push(Number(result[0].insertId));
  }

  console.log("⚠️ إضافة المخالفات...");
  
  const violationTypeIds = Array.from({ length: 33 }, (_, i) => i + 1);
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const randomStudent = studentIds[Math.floor(Math.random() * studentIds.length)];
    const randomViolationType = violationTypeIds[Math.floor(Math.random() * violationTypeIds.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const violationDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    let points = 1;
    if (randomViolationType <= 8) points = 1;
    else if (randomViolationType <= 24) points = 3;
    else if (randomViolationType <= 29) points = 5;
    else points = 10;
    
    await db.insert(violations).values({
      studentId: randomStudent,
      violationTypeId: randomViolationType,
      date: violationDate,
      points: points,
      description: `تم رصد المخالفة في ${violationDate.toLocaleDateString('ar-SA')}`,
      createdBy: "system",
    });
  }

  console.log("✅ تم إضافة البيانات التجريبية بنجاح!");
  console.log(`   - ${gradeNames.length} صف`);
  console.log(`   - ${studentNames.length} طالب`);
  console.log(`   - 50 مخالفة`);
  console.log("🎉 النظام جاهز للاستخدام!");
}

seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ خطأ في تعبئة البيانات:", error);
    process.exit(1);
  });
