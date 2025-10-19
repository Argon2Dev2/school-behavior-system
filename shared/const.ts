export const COOKIE_NAME = "session";
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "نظام إدارة السلوك المدرسي";
export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "/icon-192.png";

export const SEVERITY_COLORS = {
  بسيطة: "bg-yellow-100 text-yellow-800 border-yellow-300",
  متوسطة: "bg-orange-100 text-orange-800 border-orange-300",
  خطيرة: "bg-red-100 text-red-800 border-red-300",
};

export const VIOLATION_TYPE_COLORS = {
  بسيطة: "text-yellow-600",
  متوسطة: "text-orange-600",
  خطيرة: "text-red-600",
};
