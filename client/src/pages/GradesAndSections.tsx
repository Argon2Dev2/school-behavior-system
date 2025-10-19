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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2 } from "lucide-react";
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

export default function GradesAndSections() {
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false);
  const [deleteGradeId, setDeleteGradeId] = useState<number | null>(null);
  const [editingGrade, setEditingGrade] = useState<{ id: number; name: string } | null>(null);

  const [gradeFormData, setGradeFormData] = useState({
    name: "",
  });

  const { data: activeYear } = trpc.academicYears.getActive.useQuery();
  const { data: grades, refetch: refetchGrades } = trpc.grades.getByAcademicYear.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );

  const createGrade = trpc.grades.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الصف بنجاح");
      setIsAddGradeDialogOpen(false);
      refetchGrades();
      setGradeFormData({ name: "" });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة الصف");
    },
  });

  const updateGrade = trpc.grades.update.useMutation({
    onSuccess: () => {
      toast.success("تم تعديل الصف بنجاح");
      setIsEditGradeDialogOpen(false);
      refetchGrades();
      setEditingGrade(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تعديل الصف");
    },
  });

  const deleteGrade = trpc.grades.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصف بنجاح");
      refetchGrades();
      setDeleteGradeId(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الصف");
    },
  });

  useEffect(() => {
    if (activeYear) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear]);

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYearId) {
      toast.error("لا توجد سنة دراسية نشطة");
      return;
    }
    
    const nextLevel = grades ? grades.length + 1 : 1;
    
    createGrade.mutate({
      name: gradeFormData.name,
      level: nextLevel,
      academicYearId,
    });
  };

  const handleEditGrade = (grade: { id: number; name: string }) => {
    setEditingGrade(grade);
    setIsEditGradeDialogOpen(true);
  };

  const handleSubmitEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    
    updateGrade.mutate({
      id: editingGrade.id,
      name: editingGrade.name,
    });
  };

  const handleDeleteGrade = (gradeId: number) => {
    setDeleteGradeId(gradeId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الصفوف</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">إدارة الصفوف الدراسية</p>
          </div>
          <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة صف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة صف جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitGrade} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم الصف</Label>
                  <Input
                    id="name"
                    value={gradeFormData.name}
                    onChange={(e) =>
                      setGradeFormData({ ...gradeFormData, name: e.target.value })
                    }
                    placeholder="مثال: الصف الأول الابتدائي"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddGradeDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">إضافة</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditGradeDialogOpen} onOpenChange={setIsEditGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الصف</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEditGrade} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">اسم الصف</Label>
                <Input
                  id="edit-name"
                  value={editingGrade?.name || ""}
                  onChange={(e) =>
                    setEditingGrade(editingGrade ? { ...editingGrade, name: e.target.value } : null)
                  }
                  placeholder="مثال: الصف الأول الابتدائي"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditGradeDialogOpen(false);
                    setEditingGrade(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">حفظ التعديلات</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الصفوف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الصف</TableHead>
                    <TableHead className="text-right">عدد الطلاب</TableHead>
                    <TableHead className="text-right w-[120px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades && grades.length > 0 ? (
                    grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.name}</TableCell>
                        <TableCell>{grade.studentCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGrade({ id: grade.id, name: grade.name })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrade(grade.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        لا توجد صفوف مسجلة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteGradeId} onOpenChange={() => setDeleteGradeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا الصف؟ سيتم حذف جميع البيانات المرتبطة به.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteGradeId && deleteGrade.mutate({ id: deleteGradeId })}
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
