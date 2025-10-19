import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AcademicYears() {
  const { data: years, refetch } = trpc.academicYears.getAll.useQuery();
  const setActiveMutation = trpc.academicYears.setActive.useMutation({
    onSuccess: () => {
      toast.success("تم تفعيل السنة الدراسية بنجاح");
      refetch();
    },
  });

  const handleSetActive = (id: number) => {
    setActiveMutation.mutate({ id });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">السنوات الدراسية</h1>
            <p className="text-gray-600 mt-1">إدارة السنوات الدراسية وأرشفة البيانات</p>
          </div>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة سنة دراسية
          </Button>
        </div>

        <div className="grid gap-4">
          {years?.map((year) => (
            <Card key={year.id} className={year.isActive ? "border-blue-500 border-2" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{year.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(year.startDate).toLocaleDateString("ar-SA")} - {new Date(year.endDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {year.isActive ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-5 w-5" />
                        <span>السنة النشطة</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(year.id)}
                      >
                        تفعيل
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
