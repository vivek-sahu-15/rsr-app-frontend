export interface StudentProfile {
    id: number;
    fullName: string;
    email: string;
    contactNumber: string;
    admissionDate: string;
    dateOFBirth: string;
    gender: string;
    course: string;
    semester: string;
    motherName: string;
    fatherName: string;
    profilePicture: string | null;
}

export interface ProfileResponse {
    profile: StudentProfile;
}

export interface TeacherProfile {
    id: number;
    fullName: string;
    email: string;
    contactNumber: string;
    subject: string;
    profilePicture: string | null;
}

export interface TeacherProfileResponse {
    profile: TeacherProfile;
}

export interface AttendanceSubject {
    subject: string;
    total: number;
    present: number;
    absent: number;
    percentage: number;
}

export interface AttendanceResponse {
    overall: number;
    subjects: AttendanceSubject[];
}

export interface TimetableSlot {
    id: number;
    day: string;
    period: string;
    subject: string;
    teacherName?: string; // present in the student-facing response
    course?: string;      // present in the teacher-facing response
    semester?: string;    // present in the teacher-facing response
}

export interface TimetableResponse {
    timetable: TimetableSlot[];
}

export interface Notice {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    postedBy?: string;
}

export interface NoticesResponse {
    notices: Notice[];
}

export interface TeacherStudent {
    id: number;
    fullName: string;
    email: string;
    course: string;
    semester: string;
    contactNumber: string;
}

export interface StudentsResponse {
    students: TeacherStudent[];
}

export interface SyllabusItem {
    id: number;
    subject: string;
    content: string;
}

export interface SyllabusResponse {
    syllabus: SyllabusItem[];
}

export interface Fee {
    id: number;
    amount: number;
    status: 'paid' | 'unpaid';
    due_date: string;
}

export interface FeesResponse {
    summary: { totalAmount: number; paid: number; pending: number };
    fees: Fee[];
}