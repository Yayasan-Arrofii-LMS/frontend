export type DashboardPeriodPreset =
  | "today"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "custom";

export interface DashboardQueryParams {
  period?: DashboardPeriodPreset;
  year?: number | string;
  month?: number | string;
  startDate?: string;
  endDate?: string;
}

export interface MetricWithChange {
  current: number;
  previous: number;
  changePercent: number;
  totalCumulative?: number;
}

export interface PeriodInfo {
  label: string;
  granularity: "day" | "month";
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

export interface ActionItems {
  pendingClasses: number;
  pendingWorkshops: number;
  pendingWorkshopParticipants: number;
  pendingQuizGrading: number;
  pendingAssignmentGrading: number;
  totalPending: number;
}

export interface DashboardOverview {
  students: MetricWithChange;
  teachers: MetricWithChange;
  classes: MetricWithChange;
  materials: MetricWithChange;
  workshops: MetricWithChange;
  quizAttempts: MetricWithChange;
  assignmentsSubmitted: MetricWithChange;
  workshopRegistrations: MetricWithChange;
  averageQuizScore: MetricWithChange;
  totalUsers: {
    students: number;
    teachers: number;
    admins: number;
    total: number;
  };
}

export interface TimelineDataPoint {
  label: string;
  date?: string;
  students: number;
  teachers: number;
  classes: number;
  materials: number;
  quizAttempts: number;
  assignments: number;
  workshopRegistrations: number;
}

export interface WorkshopStatsSummary {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  participantsApproved: number;
  participantsPending: number;
  participantsRejected: number;
  participantsTotal: number;
}

export interface DashboardData {
  // Backward compatibility fields
  teacherCount: number;
  studentCount: number;
  classCount: number;
  Chart: {
    teacher: {
      oneYear: Record<string, number>;
      fiveYear: Record<string, number>;
    };
    student: {
      oneYear: Record<string, number>;
      fiveYear: Record<string, number>;
    };
  };

  // Rich Analytics Data
  periodInfo?: PeriodInfo;
  actionItems?: ActionItems;
  overview?: DashboardOverview;
  timeline?: TimelineDataPoint[];
  workshopStats?: WorkshopStatsSummary;
  insights?: string[];
}

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
