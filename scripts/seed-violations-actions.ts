import { drizzle } from "drizzle-orm/mysql2";
import { violationTypes, actionTypes } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const violations = [
  // الدرجة الأولى - بسيطة
  { name: "مخالفة الزي المدرسي", severity: "minor", points: 1 },
  { name: "النوم أثناء الحصة", severity: "minor", points: 1 },
  { name: "تناول الطعام أو الشراب أثناء الحصة", severity: "minor", points: 1 },
  { name: "الإهمال وعدم الكتابة مع المعلم", severity: "minor", points: 1 },
  { name: "عدم إحضار الكتب أو الدفاتر", severity: "minor", points: 1 },
  { name: "إعاقة سير الحصة بالحديث الجانبي", severity: "minor", points: 1 },
  { name: "التأخر بعد الفرصة", severity: "minor", points: 1 },
  { name: "الخروج من الفصل بين الحصتين", severity: "minor", points: 1 },
  
  // الدرجة الثانية - متوسطة
  { name: "الغش في الامتحانات", severity: "moderate", points: 3 },
  { name: "الهروب من الحصص", severity: "moderate", points: 3 },
  { name: "إثارة الفوضى في المدرسة", severity: "moderate", points: 3 },
  { name: "العبث بممتلكات المدرسة أو الكتابة على الجدران", severity: "moderate", points: 3 },
  { name: "التواجد في جناح غير مخصص للمرحلة الدراسية", severity: "moderate", points: 3 },
  { name: "الشجار أو التهديد أو التلفظ على الزملاء", severity: "moderate", points: 3 },
  { name: "تزوير توقيع ولي الأمر أو المعلمين", severity: "moderate", points: 3 },
  { name: "حيازة السجائر", severity: "moderate", points: 3 },
  { name: "مقاطعة شرح المعلم بقصد تعطيل سير الدرس", severity: "moderate", points: 3 },
  
  // الدرجة الثالثة - خطيرة
  { name: "تعمّد إتلاف تجهيزات المدرسة أو مبانيها", severity: "severe", points: 5 },
  { name: "إحضار مواد خطرة أو أسلحة حادة (دون استخدامها)", severity: "severe", points: 5 },
  { name: "التحرش الجنسي", severity: "severe", points: 5 },
  { name: "الإضرار المتعمد بممتلكات الزملاء", severity: "severe", points: 5 },
  { name: "التدخين داخل المدرسة أو في محيطها", severity: "severe", points: 5 },
  { name: "الخروج من الفصل دون إذن", severity: "severe", points: 5 },
  { name: "إحضار الهاتف المحمول إلى المدرسة", severity: "severe", points: 5 },
  
  // الدرجة الرابعة - خطيرة جداً
  { name: "تهديد المعلم أو الإضرار بممتلكاته", severity: "severe", points: 10 },
  { name: "التلفظ بألفاظ نابية أو القيام بحركات مخلة تجاه المعلم", severity: "severe", points: 10 },
  { name: "العبث بمواد خطرة داخل المدرسة", severity: "severe", points: 10 },
  { name: "مهاجمة طالب آخر والإضرار به عمدًا", severity: "severe", points: 10 },
  { name: "ارتكاب السرقة", severity: "severe", points: 10 },
  
  // الدرجة الخامسة - خطيرة للغاية
  { name: "الاستهزاء بشعائر الإسلام أو تبني معتقدات هدامة", severity: "severe", points: 15 },
  { name: "ارتكاب سلوك جنسي", severity: "severe", points: 15 },
  { name: "الاعتداء بالضرب على المعلم", severity: "severe", points: 15 },
  { name: "استخدام الأسلحة", severity: "severe", points: 15 },
];

const actions = [
  // إجراءات الدرجة الأولى
  { name: "تنبيه فردي من قبل المعلم", severity: "minor" },
  { name: "تنبيه ثانٍ فردي من قبل المعلم", severity: "minor" },
  { name: "أخذ تعهد خطي من الطالب بالانضباط", severity: "minor" },
  { name: "استدعاء ولي الأمر وأخذ تعهد خطي بعدم تكرار السلوك", severity: "minor" },
  { name: "حرمان الطالب من بعض المزايا", severity: "minor" },
  { name: "تكليف الطالب بمهمة غير مرغوبة", severity: "minor" },
  { name: "تنبيه الطالب من قبل وكيل المدرسة", severity: "minor" },
  
  // إجراءات الدرجة الثانية
  { name: "إصلاح ما أفسده الطالب أو دفع قيمته", severity: "moderate" },
  { name: "تقديم اعتذار للطرف المتضرر", severity: "moderate" },
  { name: "تغيير مكان جلوس الطالب في الفصل", severity: "moderate" },
  { name: "فصل الطالب لمدة يوم إلى يومين", severity: "moderate" },
  { name: "مصادرة الممنوعات وتسليمها لولي الأمر", severity: "moderate" },
  { name: "نقل الطالب إلى فصل آخر", severity: "moderate" },
  { name: "نقل الطالب إلى مدرسة أخرى", severity: "moderate" },
  
  // إجراءات الدرجة الثالثة والرابعة والخامسة
  { name: "مجلس نظام", severity: "severe" },
  { name: "أخرى", severity: "minor" },
];

async function seed() {
  console.log("🌱 بدء تعبئة البيانات...");
  
  // حذف البيانات القديمة
  await db.delete(violationTypes);
  await db.delete(actionTypes);
  
  // إضافة أنواع المخالفات
  for (const violation of violations) {
    await db.insert(violationTypes).values({
      ...violation,
      severity: violation.severity as any,
      isActive: true,
      createdBy: "system",
    });
  }
  
  // إضافة أنواع الإجراءات
  for (const action of actions) {
    await db.insert(actionTypes).values({
      ...action,
      severity: action.severity as any,
      isActive: true,
      createdBy: "system",
    });
  }
  
  console.log("✅ تم إضافة المخالفات والإجراءات بنجاح!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ خطأ:", error);
  process.exit(1);
});
