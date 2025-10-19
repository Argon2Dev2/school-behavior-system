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
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Eye, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocation } from "wouter";

export default function Students() {
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ id: number; name: string; gradeId: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    gradeId: "",
  });

  const { data: activeYear } = trpc.academicYears.getActive.useQuery();
  const { data: grades } = trpc.grades.getByAcademicYear.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );

  const { data: students, refetch } = trpc.students.search.useQuery(
    {
      academicYearId: academicYearId!,
      searchTerm: searchTerm || undefined,
      gradeId: selectedGrade && selectedGrade !== "all" ? Number(selectedGrade) : undefined,
    },
    { enabled: !!academicYearId }
  );

  const createStudent = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الطالب بنجاح");
      setIsAddDialogOpen(false);
      refetch();
      setFormData({
        name: "",
        gradeId: "",
      });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة الطالب");
    },
  });

  const updateStudent = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("تم تعديل الطالب بنجاح");
      setIsEditDialogOpen(false);
      refetch();
      setEditingStudent(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تعديل الطالب");
    },
  });

  const deleteMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الطالب بنجاح");
      refetch();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الطالب");
    },
  });

  useEffect(() => {
    if (activeYear) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.gradeId) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    
    const studentNumber = `STD${Date.now()}`;
    
    createStudent.mutate({
      studentNumber,
      name: formData.name,
      gradeId: Number(formData.gradeId),
      sectionId: 1,
      academicYearId: academicYearId!,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب "${name}"?\n\nسيتم حذف جميع المخالفات والإجراءات المرتبطة به.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
            <p className="text-gray-600 mt-1">إضافة ومتابعة بيانات الطلاب</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة طالب
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الطالب *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="أدخل اسم الطالب"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">الصف *</Label>
                  <Select
                    value={formData.gradeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gradeId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
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

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createStudent.isPending}>
                    {createStudent.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات الطالب</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingStudent) return;
              updateStudent.mutate({
                id: editingStudent.id,
                name: editingStudent.name,
                gradeId: editingStudent.gradeId,
              });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم الطالب *</Label>
                <Input
                  id="edit-name"
                  value={editingStudent?.name || ""}
                  onChange={(e) =>
                    setEditingStudent(editingStudent ? { ...editingStudent, name: e.target.value } : null)
                  }
                  placeholder="أدخل اسم الطالب"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-grade">الصف *</Label>
                <Select
                  value={editingStudent?.gradeId.toString() || ""}
                  onValueChange={(value) =>
                    setEditingStudent(editingStudent ? { ...editingStudent, gradeId: Number(value) } : null)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
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

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingStudent(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateStudent.isPending}>
                  {updateStudent.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالاسم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلاب ({students?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الصف</TableHead>
                  <TableHead>عدد المخالفات</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((item) => (
                  <TableRow key={item.student.id}>
                    <TableCell className="font-medium">{item.student.name}</TableCell>
                    <TableCell>{item.grade?.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        {item.violationCount || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/student/${item.student.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStudent({
                              id: item.student.id,
                              name: item.student.name,
                              gradeId: item.student.gradeId,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.student.id, item.student.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 ml-1 text-red-600" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!students || students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
