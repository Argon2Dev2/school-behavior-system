import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "طالب تجاوز حد التنبيه",
      message: "الطالب أحمد عبدالله المتعثر وصل إلى 8 نقاط مخالفات",
      time: "منذ ساعتين",
      read: false
    },
    {
      id: 2,
      type: "info",
      title: "مخالفة جديدة",
      message: "تم تسجيل مخالفة جديدة للطالب محمد سعد الغامدي",
      time: "منذ 5 ساعات",
      read: true
    },
    {
      id: 3,
      type: "success",
      title: "تحسن سلوكي",
      message: "الطالب خالد فهد المطيري لم يسجل مخالفات منذ أسبوعين",
      time: "منذ يوم",
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-gray-600 mt-1">جميع التنبيهات والإشعارات الخاصة بالنظام</p>
          </div>
          <Bell className="h-8 w-8 text-gray-400" />
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${getBgColor(notification.type)} ${
                !notification.read ? "border-2" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="default" className="mr-2">
                          جديد
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mt-1">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              لا توجد إشعارات أخرى
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
