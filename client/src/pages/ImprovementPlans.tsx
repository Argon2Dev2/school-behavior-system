import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Plus, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ImprovementPlans() {
  const plans = [
    {
      id: 1,
      studentName: "أحمد عبدالله المتعثر",
      violations: 8,
      status: "قيد التنفيذ",
      startDate: "2024-10-01",
      targetDate: "2024-11-15",
      progress: 60
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">خطط التحسين السلوكي</h1>
            <p className="text-gray-600 mt-1">متابعة وإدارة خطط تحسين سلوك الطلاب</p>
          </div>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء خطة جديدة
          </Button>
        </div>

        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">{plan.studentName}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {plan.violations} مخالفات
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {plan.startDate} - {plan.targetDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={plan.status === "قيد التنفيذ" ? "default" : "secondary"}>
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">التقدم</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              لا توجد خطط تحسين أخرى حالياً
            </p>
            <Button variant="outline">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء خطة تحسين
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
