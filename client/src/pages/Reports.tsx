import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { FileText, Download, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [reportType, setReportType] = useState<string>("student");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  const { data: activeYear } = trpc.academicYears.getActive.useQuery();
  const { data: grades } = trpc.grades.getByAcademicYear.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );
  const { data: students } = trpc.students.search.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );

  useEffect(() => {
    if (activeYear) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear]);

  const [reportData, setReportData] = useState<any[] | null>(null);

  const { data: allViolations } = trpc.violations.search.useQuery(
    {
      academicYearId: academicYearId!,
      gradeId: reportType === "grade" && selectedGrade ? Number(selectedGrade) : undefined,
    },
    { 
      enabled: false
    }
  );

  const handleGenerateReport = async () => {
    if (reportType === "student" && !selectedStudent) {
      toast.error("الرجاء اختيار طالب");
      return;
    }
    if (reportType === "grade" && !selectedGrade) {
      toast.error("الرجاء اختيار صف");
      return;
    }
    
    // Simulate fetching - in real app would refetch
    if (allViolations) {
      if (reportType === "student" && selectedStudent) {
        setReportData(allViolations.filter((item: any) => item.violation.studentId === Number(selectedStudent)));
      } else {
        setReportData(allViolations);
      }
    }
    toast.success("تم إنشاء التقرير بنجاح");
  };

  const handleExportPDF = () => {
    toast.info("ميزة تصدير PDF قيد التطوير");
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
            <p className="text-gray-600 mt-1">إنشاء وتصدير التقارير المختلفة</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>نوع التقرير</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">تقرير طالب</SelectItem>
                    <SelectItem value="grade">تقرير صف</SelectItem>
                    <SelectItem value="school">تقرير المدرسة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === "student" && (
                <div className="space-y-2">
                  <Label>اختر الطالب</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((item) => (
                        <SelectItem key={item.student.id} value={item.student.id.toString()}>
                          {item.student.name} - {item.grade?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === "grade" && (
                <div className="space-y-2">
                  <Label>اختر الصف</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر صف" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades?.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleGenerateReport}>
                <FileText className="ml-2 h-4 w-4" />
                إنشاء التقرير
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="ml-2 h-4 w-4" />
                تصدير PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {reportData && reportData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>نتائج التقرير ({reportData.length} مخالفة)</CardTitle>
                <div className="text-sm text-gray-600">
                  <Calendar className="inline h-4 w-4 ml-1" />
                  {new Date().toLocaleDateString("ar-SA")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">إجمالي المخالفات</p>
                  <p className="text-2xl font-bold text-red-600">{reportData.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">إجمالي النقاط</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {reportData.reduce((sum, item) => sum + item.violation.points, 0)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">متوسط النقاط</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(reportData.reduce((sum, item) => sum + item.violation.points, 0) / reportData.length).toFixed(1)}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الطالب</TableHead>
                    <TableHead>نوع المخالفة</TableHead>
                    <TableHead>الدرجة</TableHead>
                    <TableHead>النقاط</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item) => (
                    <TableRow key={item.violation.id}>
                      <TableCell>
                        {new Date(item.violation.date).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.student?.name}
                      </TableCell>
                      <TableCell>{item.violationType?.name}</TableCell>
                      <TableCell>
                        {getSeverityBadge(item.violationType?.severity || "minor")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          {item.violation.points}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportData && reportData.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد بيانات للتقرير المحدد</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

