const translations = {
  ar: {
    siteTitle: "هشام & وجدان",
    subtitle: "إدارة دعوات الزفاف",
    groomTab: "قائمة العريس",
    brideTab: "قائمة العروس",
    totalGuests: "إجمالي المدعوين",
    confirmed: "تم التأكيد",
    notConfirmed: "لم يتم التأكيد",
    communicated: "تم التواصل",
    notCommunicated: "لم يتم التواصل",
    totalChildren: "إجمالي الأطفال",
    name: "الاسم",
    phone: "رقم الجوال",
    children: "الأطفال",
    childrenCount: "عدد الأطفال",
    notes: "ملاحظات",
    addGuest: "إضافة مدعو",
    deleteGuest: "حذف",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    confirmDelete: "هل أنت متأكد من حذف هذا المدعو؟",
    importExcel: "استيراد من Excel",
    exportExcel: "تصدير إلى Excel",
    search: "بحث...",
    yes: "نعم",
    no: "لا",
    addChild: "إضافة طفل",
    childName: "اسم الطفل",
    noGuests: "لا يوجد مدعوين حتى الآن",
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",
    weddingDay: "يوم الزفاف! 🎉",
    importSuccess: "تم استيراد {count} مدعو بنجاح",
    importError: "حدث خطأ أثناء الاستيراد",
    requiredField: "هذا الحقل مطلوب",
    groom: "العريس",
    bride: "العروس",
    excelName: "الاسم",
    excelPhone: "رقم الجوال",
    excelCommunicated: "تم التواصل",
    excelConfirmed: "تم التأكيد",
    excelChildren: "الأطفال",
    excelNotes: "ملاحظات",
    loading: "جاري التحميل...",
    removeChild: "حذف",
  },
  en: {
    siteTitle: "Hesham & Wejdan",
    subtitle: "Wedding Invitation Manager",
    groomTab: "Groom's List",
    brideTab: "Bride's List",
    totalGuests: "Total Guests",
    confirmed: "Confirmed",
    notConfirmed: "Not Confirmed",
    communicated: "Communicated",
    notCommunicated: "Not Communicated",
    totalChildren: "Total Children",
    name: "Name",
    phone: "Phone",
    children: "Children",
    childrenCount: "Children",
    notes: "Notes",
    addGuest: "Add Guest",
    deleteGuest: "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this guest?",
    importExcel: "Import Excel",
    exportExcel: "Export Excel",
    search: "Search...",
    yes: "Yes",
    no: "No",
    addChild: "Add Child",
    childName: "Child Name",
    noGuests: "No guests yet",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    weddingDay: "Wedding Day! 🎉",
    importSuccess: "Successfully imported {count} guests",
    importError: "Error importing file",
    requiredField: "This field is required",
    groom: "Groom",
    bride: "Bride",
    excelName: "Name",
    excelPhone: "Phone",
    excelCommunicated: "Communicated",
    excelConfirmed: "Confirmed",
    excelChildren: "Children",
    excelNotes: "Notes",
    loading: "Loading...",
    removeChild: "Remove",
  },
};

let currentLang = "ar";

export function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.setAttribute("data-lang", lang);
}

export function t(key) {
  return translations[currentLang]?.[key] || key;
}

export function getLang() {
  return currentLang;
}

export function toggleLanguage() {
  const newLang = currentLang === "ar" ? "en" : "ar";
  setLanguage(newLang);
  return newLang;
}
