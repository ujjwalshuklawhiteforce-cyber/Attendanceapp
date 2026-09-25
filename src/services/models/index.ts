export interface ICardItem {
  id: number;
  name: string;
  description: string;
  language: string;
  star: number;
  fork: number;
}

export interface ICalendarItem {
  id: number;
  date: string;
  day: string;
}

export interface ITodayAttendance {
  id: number;
  iconType: string;
  title: string;
  time: string;
  subtitle: string;
}

export interface activityData {
  id: number;
  iconType: string;
  title: string;
  time: string;
  subtitle: string;
  date: string;
}

export interface ILeaveCard {
  id: number;
  title: string;
  days: string;
  bgColor: string;
  borderColor: string;
}

export interface ILeaveDetailCard {
  id: number;
  type: string;
  date_from: string;
  date_to: string;
  apply_days: string;
  leave_balance: string;
  approved_by: string;
  status: string;
}

export interface ILeaveApply {
  id: number;
  profile_img: string;
  name: string;
  date_from: string;
  date_to: string;
}

export interface ITeamMember {
  id: number;
  profile_img: string;
  name: string;
  email_address: string;
  mobile_number: string;
}
