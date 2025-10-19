import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentProfile() {
  const [, params] = useRoute("/student/:id");
  const [, setLocation] = useLocation();
  const studentId = params?.id ? parseInt(params.id) : null;

  const { data: student, isLoading } = trpc.students.getById.useQuery(
    { id: studentId! },
    { enabled: !!studentId }
  );

  const { data: allViolations } = trpc.violations.search.useQuery(
    {
      academicYearId: 1,
    },
    { enabled: !!studentId }
  );
  
  const violations = allViolations?.filter(v => v.violation.studentId === studentId);

  // const { data: stats } = trpc.students.getViolationStats.useQuery(
  //   { studentId: studentId! },
  //   { enabled: !!studentId }
  // );
  const stats = { totalViolations: violations?.length || 0, totalPoints: 0, totalActions: 0 };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-gray-500 text-lg mb-4">الطالب غير موجود</div>
          <Button onClick={() => setLocation("/students")}>
            العودة لقائمة الطلاب
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      minor: { variant: "secondary", label: "بسيطة" },
      moderate: { variant: "default", label: "متوسطة" },
      severe: { variant: "destructive", label: "خطيرة" },
    };
    const config = variants[severity] || variants.minor;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/students")}
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.student.name}</h1>
              <p className="text-gray-600 mt-1">
                الصف: {student.grade?.name} | الرقم: {student.student.studentNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي المخالفات
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats?.totalViolations || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                خلال السنة الدراسية الحالية
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي النقاط
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats?.totalPoints || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.totalPoints && stats.totalPoints >= 20
                  ? "⚠️ تجاوز الحد المسموح"
                  : "ضمن الحد المسموح"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                الإجراءات المتخذة
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.totalActions || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                إجراء تأديبي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guardian Info */}
        {student.student.guardianName && (
          <Card>
            <CardHeader>
              <CardTitle>معلومات ولي الأمر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">الاسم</p>
                  <p className="font-medium">{student.student.guardianName}</p>
                </div>
                {student.student.guardianPhone && (
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{student.student.guardianPhone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Violations History */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المخالفات ({violations?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
                {violations && violations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>نوع المخالفة</TableHead>
                    <TableHead>الدرجة</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((item) => (
                    <TableRow key={item.violation.id}>
                      <TableCell>
                        {new Date(item.violation.date).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.violationType?.name}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(item.violationType?.severity || "minor")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          {item.violation.points}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {item.violation.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد مخالفات مسجلة لهذا الطالب</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {student.student.notes && (
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{student.student.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

