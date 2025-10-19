import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Save, Database, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const [schoolName, setSchoolName] = useState("مدرسة النموذجية الابتدائية");
  const [warningThreshold, setWarningThreshold] = useState("5");
  const [dangerThreshold, setDangerThreshold] = useState("10");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);

  const handleSave = () => {
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const handleExportData = () => {
    toast.info("جاري تصدير البيانات...");
    setTimeout(() => {
      toast.success("تم تصدير البيانات بنجاح");
    }, 2000);
  };

  const handleImportData = () => {
    toast.info("ميزة استيراد البيانات قيد التطوير");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
            <p className="text-gray-600 mt-1">إدارة إعدادات النظام والتفضيلات</p>
          </div>
          <SettingsIcon className="h-8 w-8 text-gray-400" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المدرسة</CardTitle>
            <CardDescription>البيانات الأساسية للمدرسة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المدرسة</Label>
              <Input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="أدخل اسم المدرسة"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input placeholder="011-1234567" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" placeholder="info@school.edu.sa" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات المخالفات</CardTitle>
            <CardDescription>حدود التنبيه والإجراءات التلقائية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>حد التنبيه (نقاط)</Label>
                <Input
                  type="number"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  placeholder="5"
                />
                <p className="text-sm text-gray-500">
                  يتم إرسال تنبيه عند وصول الطالب لهذا العدد من النقاط
                </p>
              </div>
              <div className="space-y-2">
                <Label>حد الخطر (نقاط)</Label>
                <Input
                  type="number"
                  value={dangerThreshold}
                  onChange={(e) => setDangerThreshold(e.target.value)}
                  placeholder="10"
                />
                <p className="text-sm text-gray-500">
                  يتم اتخاذ إجراءات عاجلة عند وصول الطالب لهذا العدد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات
            </CardTitle>
            <CardDescription>إدارة تفضيلات الإشعارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل الإشعارات</Label>
                <p className="text-sm text-gray-500">
                  استقبال إشعارات عند تسجيل مخالفات جديدة
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات المخالفات الخطيرة</Label>
                <p className="text-sm text-gray-500">
                  إشعار فوري عند تسجيل مخالفات خطيرة
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              النسخ الاحتياطي والأرشفة
            </CardTitle>
            <CardDescription>إدارة البيانات والنسخ الاحتياطية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الأرشفة التلقائية</Label>
                <p className="text-sm text-gray-500">
                  أرشفة البيانات تلقائياً في نهاية كل سنة دراسية
                </p>
              </div>
              <Switch
                checked={autoArchive}
                onCheckedChange={setAutoArchive}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleExportData} variant="outline">
                <Database className="ml-2 h-4 w-4" />
                تصدير البيانات
              </Button>
              <Button onClick={handleImportData} variant="outline">
                <Database className="ml-2 h-4 w-4" />
                استيراد البيانات
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="ml-2 h-5 w-5" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

