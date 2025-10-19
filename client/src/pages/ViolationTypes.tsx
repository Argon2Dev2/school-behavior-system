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
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function ViolationTypes() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    severity: "minor" as "minor" | "moderate" | "severe",
    points: "",
    description: "",
    suggestedAction: "",
  });

  const { data: violationTypes, refetch } = trpc.violationTypes.getAll.useQuery();
  const { data: actionTypes } = trpc.actionTypes.getActive.useQuery();

  const createViolationType = trpc.violationTypes.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة نوع المخالفة بنجاح");
      setIsAddDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة نوع المخالفة");
    },
  });

  const updateViolationType = trpc.violationTypes.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث نوع المخالفة بنجاح");
      setIsEditDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث نوع المخالفة");
    },
  });

  const deleteViolationType = trpc.violationTypes.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف نوع المخالفة بنجاح");
      refetch();
      setDeleteId(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف نوع المخالفة");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      severity: "minor",
      points: "",
      description: "",
      suggestedAction: "",
    });
    setEditingType(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createViolationType.mutate({
      name: formData.name,
      severity: formData.severity,
      points: Number(formData.points),
      description: formData.description || undefined,
      suggestedAction: formData.suggestedAction || undefined,
      isActive: true,
    });
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      severity: type.severity,
      points: type.points.toString(),
      description: type.description || "",
      suggestedAction: type.suggestedAction || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    
    updateViolationType.mutate({
      id: editingType.id,
      name: formData.name,
      severity: formData.severity,
      points: Number(formData.points),
      description: formData.description || undefined,
      suggestedAction: formData.suggestedAction || undefined,
      isActive: editingType.isActive,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة أنواع المخالفات</h1>
            <p className="text-gray-600 mt-1">تصنيف المخالفات وتحديد الإجراءات المناسبة</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة نوع مخالفة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة نوع مخالفة جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المخالفة *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="مثال: التأخر الصباحي"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">مستوى الخطورة *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">بسيطة</SelectItem>
                        <SelectItem value="moderate">متوسطة</SelectItem>
                        <SelectItem value="severe">خطيرة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">عدد النقاط *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    placeholder="مثال: 5"
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
                    placeholder="وصف تفصيلي للمخالفة..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestedAction">الإجراء المقترح</Label>
                  <Textarea
                    id="suggestedAction"
                    value={formData.suggestedAction}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestedAction: e.target.value })
                    }
                    placeholder="مثال: إنذار شفوي للمرة الأولى، إنذار كتابي للمرة الثانية..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createViolationType.isPending}>
                    {createViolationType.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>أنواع المخالفات ({violationTypes?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {violationTypes && violationTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المخالفة</TableHead>
                    <TableHead>مستوى الخطورة</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراء المقترح</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violationTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{getSeverityBadge(type.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{type.points}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {type.description || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {type.suggestedAction || "-"}
                      </TableCell>
                      <TableCell>
                        {type.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(type)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(type.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">لا توجد أنواع مخالفات مسجلة</p>
                <p className="text-sm mt-1">ابدأ بإضافة نوع مخالفة جديد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل نوع المخالفة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">اسم المخالفة *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-severity">مستوى الخطورة *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">بسيطة</SelectItem>
                      <SelectItem value="moderate">متوسطة</SelectItem>
                      <SelectItem value="severe">خطيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-points">عدد النقاط *</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">وصف المخالفة</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-suggestedAction">الإجراء المقترح</Label>
                <Textarea
                  id="edit-suggestedAction"
                  value={formData.suggestedAction}
                  onChange={(e) =>
                    setFormData({ ...formData, suggestedAction: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateViolationType.isPending}>
                  {updateViolationType.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف نوع المخالفة هذا؟ هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteViolationType.mutate({ id: deleteId })}
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

