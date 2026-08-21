/**
 * Demo dataset for the admin portal.
 *
 * Fictional records used to populate the UI before the Firestore backend is
 * wired up. Names, emails and phone numbers are invented; any resemblance to
 * real people is coincidental. Replace with live queries per
 * planning/CRM-IMPLEMENTATION-PLAN.md.
 */

export type SessionStatus = "live" | "upcoming" | "completed" | "no-show";
export type LeadStatus = "new" | "contacted" | "trial" | "enrolled" | "lost";
export type UserStatus = "active" | "disabled" | "pending";
export type ComplaintStatus = "open" | "in-review" | "resolved" | "escalated";
export type Priority = "low" | "medium" | "high" | "urgent";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type InvoiceStatus = "paid" | "sent" | "overdue" | "draft";

/* ------------------------------- Dashboard ------------------------------- */

export const kpis = [
  { label: "Active students", value: "248", delta: "+12", trend: "up", href: "/admin/students" },
  { label: "Active teachers", value: "19", delta: "+1", trend: "up", href: "/admin/teachers" },
  { label: "Classes today", value: "64", delta: "8 live now", trend: "flat", href: "/admin/today" },
  { label: "Attendance (7d)", value: "91%", delta: "+3%", trend: "up", href: "/admin/attendance" },
  { label: "Revenue MTD", value: "$11,240", delta: "+8%", trend: "up", href: "/admin/finance" },
  { label: "Outstanding fees", value: "$1,860", delta: "9 accounts", trend: "down", href: "/admin/finance" },
  { label: "Open complaints", value: "4", delta: "1 urgent", trend: "down", href: "/admin/complaints" },
  { label: "Pending leave", value: "3", delta: "needs cover", trend: "flat", href: "/admin/leave" },
] as const;

export const enrolmentFunnel = [
  { stage: "Registered", count: 186 },
  { stage: "Contacted", count: 142 },
  { stage: "Trial booked", count: 98 },
  { stage: "Trial completed", count: 74 },
  { stage: "Enrolled", count: 41 },
] as const;

export const revenueByMonth = [
  { month: "Sep", value: 7200 }, { month: "Oct", value: 7850 },
  { month: "Nov", value: 8400 }, { month: "Dec", value: 8100 },
  { month: "Jan", value: 9300 }, { month: "Feb", value: 9750 },
  { month: "Mar", value: 10200 }, { month: "Apr", value: 9900 },
  { month: "May", value: 10650 }, { month: "Jun", value: 10980 },
  { month: "Jul", value: 11100 }, { month: "Aug", value: 11240 },
] as const;

export const attendanceTrend = [
  { day: "Mon", value: 93 }, { day: "Tue", value: 91 }, { day: "Wed", value: 88 },
  { day: "Thu", value: 92 }, { day: "Fri", value: 86 }, { day: "Sat", value: 95 },
  { day: "Sun", value: 94 },
] as const;

export const alerts = [
  { type: "urgent", text: "Ustadh Imran marked no-show for 2 classes today", href: "/admin/today" },
  { type: "warning", text: "Complaint QM-2026-0041 breaches SLA in 40 minutes", href: "/admin/complaints" },
  { type: "warning", text: "3 leave requests await cover assignment", href: "/admin/leave" },
  { type: "info", text: "9 invoices overdue by more than 7 days", href: "/admin/finance" },
] as const;

/* ----------------------------- Today's classes ---------------------------- */

export type TodaySession = {
  id: string;
  time: string;
  student: string;
  teacher: string;
  course: string;
  status: SessionStatus;
  attendance: "present" | "absent" | "late" | "pending";
};

export const todaySessions: readonly TodaySession[] = [
  { id: "S-1041", time: "07:00", student: "Yusuf Ibrahim", teacher: "Ustadha Ayesha Siddiqa", course: "Quran Reading", status: "completed", attendance: "present" },
  { id: "S-1042", time: "07:30", student: "Maryam Khan", teacher: "Ustadha Ayesha Siddiqa", course: "Quran Memorization", status: "completed", attendance: "present" },
  { id: "S-1043", time: "08:00", student: "Ahmad Raza", teacher: "Ustadh Bilal Ahmed", course: "Quran Recitation", status: "completed", attendance: "late" },
  { id: "S-1044", time: "08:30", student: "Fatima Noor", teacher: "Ustadh Imran Malik", course: "Quran Reading", status: "no-show", attendance: "absent" },
  { id: "S-1045", time: "09:00", student: "Bilal Hassan", teacher: "Ustadha Zainab Ali", course: "Islamic Education", status: "live", attendance: "pending" },
  { id: "S-1046", time: "09:00", student: "Aisha Siddiq", teacher: "Ustadh Yusuf Qadri", course: "Quran Translation", status: "live", attendance: "pending" },
  { id: "S-1047", time: "09:30", student: "Omar Farooq", teacher: "Ustadha Ayesha Siddiqa", course: "Quran Memorization", status: "upcoming", attendance: "pending" },
  { id: "S-1048", time: "10:00", student: "Zainab Tariq", teacher: "Ustadh Bilal Ahmed", course: "Quran Reading", status: "upcoming", attendance: "pending" },
  { id: "S-1049", time: "10:30", student: "Ibrahim Sheikh", teacher: "Ustadha Zainab Ali", course: "Quran Recitation", status: "upcoming", attendance: "pending" },
  { id: "S-1050", time: "11:00", student: "Khadija Aslam", teacher: "Ustadh Yusuf Qadri", course: "Quran Memorization", status: "upcoming", attendance: "pending" },
] as const;

/* --------------------------------- Leads --------------------------------- */

export type Lead = {
  id: string; name: string; email: string; phone: string; country: string;
  course: string; status: LeadStatus; created: string; owner: string;
};

export const leads: readonly Lead[] = [
  { id: "L-2201", name: "Sarah Mahmood", email: "s.mahmood@example.com", phone: "+44 7700 900112", country: "United Kingdom", course: "Quran Reading", status: "new", created: "2026-08-17", owner: "Unassigned" },
  { id: "L-2200", name: "Hamza Aziz", email: "hamza.aziz@example.com", phone: "+1 202 555 0143", country: "United States", course: "Quran Memorization", status: "contacted", created: "2026-08-16", owner: "Bilal Ahmed" },
  { id: "L-2199", name: "Nadia Rahman", email: "nadia.r@example.com", phone: "+61 400 555 221", country: "Australia", course: "Islamic Education", status: "trial", created: "2026-08-15", owner: "Bilal Ahmed" },
  { id: "L-2198", name: "Tariq Javed", email: "t.javed@example.com", phone: "+1 416 555 0178", country: "Canada", course: "Quran Recitation", status: "trial", created: "2026-08-14", owner: "Ayesha Siddiqa" },
  { id: "L-2197", name: "Layla Hussein", email: "layla.h@example.com", phone: "+971 50 555 3321", country: "United Arab Emirates", course: "Quran Translation", status: "enrolled", created: "2026-08-12", owner: "Bilal Ahmed" },
  { id: "L-2196", name: "Imran Sattar", email: "imran.s@example.com", phone: "+44 7700 900884", country: "United Kingdom", course: "Quran Reading", status: "lost", created: "2026-08-10", owner: "Ayesha Siddiqa" },
] as const;

/* -------------------------------- Students -------------------------------- */

export type Student = {
  id: string; name: string; guardian: string; country: string; course: string;
  teacher: string; plan: string; attendance: number; status: UserStatus; joined: string;
};

export const students: readonly Student[] = [
  { id: "ST-401", name: "Yusuf Ibrahim", guardian: "Ibrahim Adeel", country: "United Kingdom", course: "Quran Reading", teacher: "Ustadha Ayesha Siddiqa", plan: "5 Days / Week", attendance: 96, status: "active", joined: "2025-11-02" },
  { id: "ST-402", name: "Maryam Khan", guardian: "Sana Khan", country: "Canada", course: "Quran Memorization", teacher: "Ustadha Ayesha Siddiqa", plan: "5 Days / Week", attendance: 92, status: "active", joined: "2025-09-18" },
  { id: "ST-403", name: "Ahmad Raza", guardian: "Raza Ali", country: "United States", course: "Quran Recitation", teacher: "Ustadh Bilal Ahmed", plan: "3 Days / Week", attendance: 88, status: "active", joined: "2026-01-12" },
  { id: "ST-404", name: "Fatima Noor", guardian: "Noor Ahmed", country: "Australia", course: "Quran Reading", teacher: "Ustadh Imran Malik", plan: "3 Days / Week", attendance: 71, status: "active", joined: "2026-02-25" },
  { id: "ST-405", name: "Bilal Hassan", guardian: "Hassan Sheikh", country: "United Kingdom", course: "Islamic Education", teacher: "Ustadha Zainab Ali", plan: "3 Days / Week", attendance: 94, status: "active", joined: "2025-12-05" },
  { id: "ST-406", name: "Aisha Siddiq", guardian: "Siddiq Rahman", country: "United Arab Emirates", course: "Quran Translation", teacher: "Ustadh Yusuf Qadri", plan: "5 Days / Week", attendance: 90, status: "active", joined: "2025-10-20" },
  { id: "ST-407", name: "Omar Farooq", guardian: "Farooq Malik", country: "Saudi Arabia", course: "Quran Memorization", teacher: "Ustadha Ayesha Siddiqa", plan: "5 Days / Week", attendance: 98, status: "active", joined: "2025-08-14" },
  { id: "ST-408", name: "Zainab Tariq", guardian: "Tariq Mehmood", country: "United Kingdom", course: "Quran Reading", teacher: "Ustadh Bilal Ahmed", plan: "Free Trial", attendance: 100, status: "pending", joined: "2026-08-15" },
] as const;

/* -------------------------------- Teachers -------------------------------- */

export type Teacher = {
  id: string; name: string; email: string; phone: string; admin: string;
  specializations: readonly string[]; students: number; load: number;
  rating: number; status: UserStatus; joined: string; gender: "male" | "female";
};

export const teachers: readonly Teacher[] = [
  { id: "T-101", name: "Ustadha Ayesha Siddiqa", email: "ayesha.s@quranmubarak.com", phone: "+92 300 5551201", admin: "AdminSuper", specializations: ["Tajweed", "Hifz"], students: 18, load: 26, rating: 4.9, status: "active", joined: "2019-03-11", gender: "female" },
  { id: "T-102", name: "Ustadh Bilal Ahmed", email: "bilal.a@quranmubarak.com", phone: "+92 300 5551202", admin: "AdminSuper", specializations: ["Tajweed", "Recitation"], students: 16, load: 24, rating: 4.8, status: "active", joined: "2018-07-02", gender: "male" },
  { id: "T-103", name: "Ustadha Zainab Ali", email: "zainab.a@quranmubarak.com", phone: "+92 300 5551203", admin: "Bilal Ahmed", specializations: ["Islamic Studies", "Tajweed"], students: 14, load: 21, rating: 4.7, status: "active", joined: "2020-01-20", gender: "female" },
  { id: "T-104", name: "Ustadh Yusuf Qadri", email: "yusuf.q@quranmubarak.com", phone: "+92 300 5551204", admin: "Bilal Ahmed", specializations: ["Tafseer", "Arabic"], students: 12, load: 19, rating: 4.9, status: "active", joined: "2021-05-09", gender: "male" },
  { id: "T-105", name: "Ustadh Imran Malik", email: "imran.m@quranmubarak.com", phone: "+92 300 5551205", admin: "Bilal Ahmed", specializations: ["Tajweed"], students: 9, load: 14, rating: 4.1, status: "active", joined: "2022-09-15", gender: "male" },
  { id: "T-106", name: "Ustadha Hafsa Noor", email: "hafsa.n@quranmubarak.com", phone: "+92 300 5551206", admin: "AdminSuper", specializations: ["Hifz"], students: 0, load: 0, rating: 4.6, status: "disabled", joined: "2023-02-01", gender: "female" },
] as const;

/* ------------------------------- Complaints ------------------------------- */

export type Complaint = {
  id: string; subject: string; category: string; raisedBy: string; against: string;
  priority: Priority; status: ComplaintStatus; created: string; sla: string; assignee: string;
};

export const complaints: readonly Complaint[] = [
  { id: "QM-2026-0041", subject: "Teacher repeatedly late to morning class", category: "Punctuality", raisedBy: "Noor Ahmed (parent)", against: "Ustadh Imran Malik", priority: "urgent", status: "escalated", created: "2026-08-17", sla: "40 min left", assignee: "Bilal Ahmed" },
  { id: "QM-2026-0040", subject: "Audio quality poor during Zoom sessions", category: "Technical", raisedBy: "Sana Khan (parent)", against: "—", priority: "high", status: "in-review", created: "2026-08-16", sla: "4 h left", assignee: "AdminSuper" },
  { id: "QM-2026-0039", subject: "Requesting change to female teacher", category: "Teaching Quality", raisedBy: "Siddiq Rahman (parent)", against: "—", priority: "medium", status: "open", created: "2026-08-15", sla: "18 h left", assignee: "Unassigned" },
  { id: "QM-2026-0038", subject: "Invoice charged twice in July", category: "Billing", raisedBy: "Raza Ali (parent)", against: "—", priority: "high", status: "resolved", created: "2026-08-11", sla: "Met", assignee: "AdminSuper" },
  { id: "QM-2026-0037", subject: "Student disruptive during group session", category: "Behaviour", raisedBy: "Ustadha Zainab Ali (teacher)", against: "ST-404", priority: "low", status: "resolved", created: "2026-08-09", sla: "Met", assignee: "Bilal Ahmed" },
] as const;

/* --------------------------------- Leave ---------------------------------- */

export type Leave = {
  id: string; teacher: string; type: string; from: string; to: string;
  days: number; reason: string; status: LeaveStatus; affected: number; cover: string;
};

export const leaveRequests: readonly Leave[] = [
  { id: "LV-088", teacher: "Ustadh Yusuf Qadri", type: "Sick", from: "2026-08-18", to: "2026-08-19", days: 2, reason: "Fever, advised rest", status: "pending", affected: 12, cover: "Not assigned" },
  { id: "LV-087", teacher: "Ustadha Zainab Ali", type: "Annual", from: "2026-08-24", to: "2026-08-28", days: 5, reason: "Family travel", status: "pending", affected: 21, cover: "Partially assigned" },
  { id: "LV-086", teacher: "Ustadh Imran Malik", type: "Emergency", from: "2026-08-17", to: "2026-08-17", days: 1, reason: "Family emergency", status: "pending", affected: 6, cover: "Not assigned" },
  { id: "LV-085", teacher: "Ustadha Ayesha Siddiqa", type: "Annual", from: "2026-08-03", to: "2026-08-05", days: 3, reason: "Personal", status: "approved", affected: 15, cover: "Ustadha Hafsa Noor" },
  { id: "LV-084", teacher: "Ustadh Bilal Ahmed", type: "Unpaid", from: "2026-07-20", to: "2026-07-24", days: 5, reason: "Extended travel", status: "rejected", affected: 24, cover: "—" },
] as const;

/* -------------------------------- Finance --------------------------------- */

export type Invoice = {
  id: string; student: string; period: string; amount: string; currency: string;
  status: InvoiceStatus; due: string; method: string;
};

export const invoices: readonly Invoice[] = [
  { id: "INV-3312", student: "Yusuf Ibrahim", period: "Aug 2026", amount: "50.00", currency: "USD", status: "paid", due: "2026-08-01", method: "Card" },
  { id: "INV-3313", student: "Maryam Khan", period: "Aug 2026", amount: "50.00", currency: "USD", status: "paid", due: "2026-08-01", method: "Card" },
  { id: "INV-3314", student: "Ahmad Raza", period: "Aug 2026", amount: "40.00", currency: "USD", status: "sent", due: "2026-08-20", method: "—" },
  { id: "INV-3315", student: "Fatima Noor", period: "Jul 2026", amount: "40.00", currency: "USD", status: "overdue", due: "2026-07-20", method: "—" },
  { id: "INV-3316", student: "Bilal Hassan", period: "Aug 2026", amount: "30.00", currency: "GBP", status: "paid", due: "2026-08-01", method: "Bank" },
  { id: "INV-3317", student: "Aisha Siddiq", period: "Aug 2026", amount: "50.00", currency: "USD", status: "sent", due: "2026-08-25", method: "—" },
  { id: "INV-3318", student: "Omar Farooq", period: "Jul 2026", amount: "50.00", currency: "USD", status: "overdue", due: "2026-07-15", method: "—" },
] as const;

export type Payout = {
  id: string; teacher: string; period: string; sessions: number;
  hours: number; gross: string; net: string; status: "pending" | "approved" | "paid";
};

export const payouts: readonly Payout[] = [
  { id: "PO-221", teacher: "Ustadha Ayesha Siddiqa", period: "Jul 2026", sessions: 104, hours: 52, gross: "780.00", net: "780.00", status: "paid" },
  { id: "PO-222", teacher: "Ustadh Bilal Ahmed", period: "Jul 2026", sessions: 96, hours: 48, gross: "720.00", net: "720.00", status: "paid" },
  { id: "PO-223", teacher: "Ustadha Zainab Ali", period: "Aug 2026", sessions: 84, hours: 42, gross: "630.00", net: "630.00", status: "approved" },
  { id: "PO-224", teacher: "Ustadh Yusuf Qadri", period: "Aug 2026", sessions: 76, hours: 38, gross: "570.00", net: "545.00", status: "pending" },
] as const;

/* -------------------------------- Policies -------------------------------- */

export const policies = [
  { id: "P-01", title: "Child Safeguarding Policy", category: "Safeguarding", version: 3, audience: "All staff", acknowledged: 17, total: 19, updated: "2026-06-01" },
  { id: "P-02", title: "Teacher Code of Conduct", category: "Conduct", version: 2, audience: "Teachers", acknowledged: 19, total: 19, updated: "2026-03-14" },
  { id: "P-03", title: "Attendance & Punctuality Policy", category: "Operations", version: 4, audience: "Teachers, Students", acknowledged: 15, total: 19, updated: "2026-07-22" },
  { id: "P-04", title: "Fee & Refund Policy", category: "Finance", version: 2, audience: "All", acknowledged: 19, total: 19, updated: "2026-01-08" },
  { id: "P-05", title: "Online Class Etiquette", category: "Operations", version: 1, audience: "Students", acknowledged: 12, total: 19, updated: "2026-08-02" },
] as const;

/* -------------------------------- Teacher --------------------------------- */

export const teacherProgress = [
  { student: "Yusuf Ibrahim", surah: "Al-Baqarah", ayah: "1–20", tajweed: 4, fluency: 4, note: "Improving on madd rules" },
  { student: "Maryam Khan", surah: "An-Naba", ayah: "1–40", tajweed: 5, fluency: 5, note: "Excellent revision, ready for next juz" },
  { student: "Omar Farooq", surah: "Al-Mulk", ayah: "1–15", tajweed: 4, fluency: 3, note: "Needs work on ghunnah" },
] as const;
