import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { SEVERITY_COLORS, SEVERITY_LABELS } from "@shared/const";
import { AlertTriangle, BookOpen, FileText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  const { data: activeYear } = trpc.academicYears.getActive.useQuery();
  const { data: stats } = trpc.dashboard.getStats.useQuery(
    { academicYearId: academicYearId! },
    { enabled: !!academicYearId }
  );
  const { data: recentViolations } = trpc.violations.getRecent.useQuery({ limit: 5 });
  const { data: topViolators } = trpc.dashboard.getTopViolators.useQuery(
    { academicYearId: academicYearId!, limit: 5 },
    { enabled: !!academicYearId }
  );

  useEffect(() => {
    if (activeYear) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            مرحباً، {user?.name || "مشرف"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            نظرة عامة على السلوك والنظام المدرسي
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي الطلاب
              </CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-gray-500 mt-1">للسنة الدراسية الحالية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                مخالفات اليوم
              </CardTitle>
              <FileText className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalViolationsToday || 0}</div>
              <p className="text-xs text-gray-500 mt-1">تم تسجيلها اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                مخالفات الشهر
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalViolationsThisMonth || 0}</div>
              <p className="text-xs text-gray-500 mt-1">خلال الشهر الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                خطط التحسين النشطة
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activePlans || 0}</div>
              <p className="text-xs text-gray-500 mt-1">قيد المتابعة</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Violations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>أحدث المخالفات</CardTitle>
                <Link href="/violations">
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentViolations && recentViolations.length > 0 ? (
                <div className="space-y-4">
                  {recentViolations.map((item) => (
                    <div
                      key={item.violation.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {item.student?.name || "غير معروف"}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              SEVERITY_COLORS[
                                item.violationType?.severity || "minor"
                              ]
                            }`}
                          >
                            {SEVERITY_LABELS[
                              item.violationType?.severity || "minor"
                            ]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.violationType?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.grade?.name} - {item.section?.name}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {item.violation.points} نقطة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد مخالفات مسجلة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Violators */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الطلاب الأكثر مخالفات</CardTitle>
                <Link href="/reports">
                  <Button variant="ghost" size="sm">
                    التقرير الكامل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topViolators && topViolators.length > 0 ? (
                <div className="space-y-4">
                  {topViolators.map((item, index) => (
                    <div
                      key={item.student.id}
                      className="flex items-center gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {item.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.grade?.name} - {item.section?.name}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-red-600">
                          {item.violationCount} مخالفة
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.totalPoints} نقطة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد بيانات متاحة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/students">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  إضافة طالب
                </Button>
              </Link>
              <Link href="/violations">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  تسجيل مخالفة
                </Button>
              </Link>
              <Link href="/improvement-plans">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  إنشاء خطة تحسين
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="w-4 h-4" />
                  عرض التقارير
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

