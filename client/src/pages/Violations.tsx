import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Violations() {
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteViolationId, setDeleteViolationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const [formData, setFormData] = useState({
    studentId: "",
    violationTypeId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    filterGradeId: "",
    selectedActions: [] as number[],
    otherAction: "",
    violationSeverityFilter: "all" as "all" | "minor" | "moderate" | "severe",
  });

  const { data: activeYear } = trpc.academicYears.getActive.useQuery();
  const { data: grades } = trpc.grades.getByAcademicYear.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );
  const { data: students } = trpc.students.getByAcademicYear.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );
  const { data: violationTypes } = trpc.violationTypes.getActive.useQuery();
  const { data: actionTypes } = trpc.actionTypes.getActive.useQuery();

  const { data: violations, refetch } = trpc.violations.search.useQuery(
    {
      academicYearId: academicYearId!,
      searchTerm: searchTerm || undefined,
      gradeId: selectedGrade !== "all" ? Number(selectedGrade) : undefined,
      severity: selectedSeverity !== "all" ? (selectedSeverity as "minor" | "moderate" | "severe") : undefined,
    },
    { enabled: !!academicYearId }
  );

  const createViolation = trpc.violations.create.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل المخالفة بنجاح");
      setIsAddDialogOpen(false);
      refetch();
      setFormData({
        studentId: "",
        violationTypeId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        filterGradeId: "",
        selectedActions: [],
        otherAction: "",
        violationSeverityFilter: "all",
      });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تسجيل المخالفة");
    },
  });

  const deleteViolation = trpc.violations.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المخالفة بنجاح");
      refetch();
      setDeleteViolationId(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المخالفة");
    },
  });

  useEffect(() => {
    if (activeYear) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedType = violationTypes?.find(
      (t) => t.id === Number(formData.violationTypeId)
    );
    if (!selectedType) return;

    createViolation.mutate({
      studentId: Number(formData.studentId),
      violationTypeId: Number(formData.violationTypeId),
      points: selectedType.points,
      description: formData.description,
      date: new Date(formData.date),
    });
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      minor: { label: "بسيطة", className: "bg-yellow-100 text-yellow-800" },
      moderate: { label: "متوسطة", className: "bg-orange-100 text-orange-800" },
      severe: { label: "خطيرة", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[severity as keyof typeof variants] || variants.minor;
    return (
      <Badge className={variant.className} variant="outline">
        {variant.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">المخالفات السلوكية</h1>
            <p className="text-gray-600 mt-1">تسجيل ومتابعة المخالفات السلوكية للطلاب</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                تسجيل مخالفة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تسجيل مخالفة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filterGradeId">فلتر حسب الصف</Label>
                  <Select
                    value={formData.filterGradeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, filterGradeId: value, studentId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الصفوف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الصفوف</SelectItem>
                      {grades?.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">الطالب *</Label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, studentId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
                          ?.filter((item) => 
                            !formData.filterGradeId || 
                            formData.filterGradeId === "all" || 
                            item.student.gradeId === Number(formData.filterGradeId)
                          )
                          .map((item) => (
                            <SelectItem key={item.student.id} value={item.student.id.toString()}>
                              {item.student.name} - {item.grade?.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="violationSeverity">درجة المخالفة</Label>
                  <Select
                    value={formData.violationSeverityFilter}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, violationSeverityFilter: value, violationTypeId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الدرجات</SelectItem>
                      <SelectItem value="minor">الدرجة الأولى - بسيطة</SelectItem>
                      <SelectItem value="moderate">الدرجة الثانية - متوسطة</SelectItem>
                      <SelectItem value="severe">الدرجة الثالثة والرابعة والخامسة - خطيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="violationType">نوع المخالفة *</Label>
                  <Select
                    value={formData.violationTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, violationTypeId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المخالفة" />
                    </SelectTrigger>
                    <SelectContent>
                      {violationTypes
                        ?.filter((type) => 
                          formData.violationSeverityFilter === "all" || 
                          type.severity === formData.violationSeverityFilter
                        )
                        .map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} ({type.points} نقاط)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف المخالفة</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="تفاصيل إضافية عن المخالفة..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>الإجراءات المتخذة (اختيار متعدد)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {actionTypes?.map((action) => (
                      <div key={action.id} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`action-${action.id}`}
                          checked={formData.selectedActions.includes(action.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedActions: [...formData.selectedActions, action.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedActions: formData.selectedActions.filter(
                                  (id) => id !== action.id
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`action-${action.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {action.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.selectedActions.some(
                  (id) => actionTypes?.find((a) => a.id === id)?.name === "أخرى"
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="otherAction">حدد الإجراء الآخر</Label>
                    <Input
                      id="otherAction"
                      value={formData.otherAction}
                      onChange={(e) =>
                        setFormData({ ...formData, otherAction: e.target.value })
                      }
                      placeholder="اكتب الإجراء..."
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createViolation.isPending}>
                    {createViolation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="بحث بالطالب أو نوع المخالفة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  {grades?.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المستويات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="minor">بسيطة</SelectItem>
                  <SelectItem value="moderate">متوسطة</SelectItem>
                  <SelectItem value="severe">خطيرة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <CardTitle>المخالفات المسجلة ({violations?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {violations && violations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الطالب</TableHead>
                    <TableHead>الصف</TableHead>
                    <TableHead>نوع المخالفة</TableHead>
                    <TableHead>الخطورة</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.violation.id}>
                      <TableCell>
                        {format(new Date(violation.violation.date), "dd/MM/yyyy", {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {violation.student?.name}
                      </TableCell>
                      <TableCell>{violation.grade?.name}</TableCell>
                      <TableCell>{violation.violationType?.name}</TableCell>
                      <TableCell>
                        {getSeverityBadge(violation.violationType?.severity || "minor")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{violation.violation.points}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {violation.violation.description || "-"}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteViolationId(violation.violation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد مخالفات مسجلة</p>
                <p className="text-sm mt-1">ابدأ بتسجيل مخالفة جديدة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteViolationId}
          onOpenChange={() => setDeleteViolationId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذه المخالفة؟ هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteViolationId && deleteViolation.mutate({ id: deleteViolationId })
                }
                className="bg-red-600 hover:bg-red-700"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

