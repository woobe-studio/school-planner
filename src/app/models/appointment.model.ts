export interface Appointment {
  uuid?: string;
  date: Date;
  title: string;
  teacher: string;
  startTime: string;
  endTime: string;
  color?: string;
}
