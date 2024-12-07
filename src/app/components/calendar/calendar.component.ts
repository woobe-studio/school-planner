import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { Appointment } from "../../models/appointment.model";
import { AppointmentService } from '../../services/appointment.service';

export enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedStartTime: string | undefined;
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  monthDays: Date[] = [];
  appointments: Appointment[] = [
    {
      uuid: '00000000-0000-0000-0000-000000000002',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 2),
      title: 'Lunch with Alice',
      teacher: 'Nobody',
      startTime: '12:00',
      endTime: '13:00',
    }
  ];
  currentView: CalendarView = CalendarView.Month;
  timeSlots: string[] = [];
  filteredAppointments: Appointment[] = [...this.appointments]; // Initialize filteredAppointments with all appointments
  selectedTeacher: string | null = null; // Store the selected teacher for filtering
  uniqueTeachers: string[] = [];
  showTeachersDropdown = false;

  constructor(
      public dialog: MatDialog,
      private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
    this.filteredAppointments = [...this.appointments];
    this.updateTeachersList();
  }

  updateTeachersList(): void {
    this.uniqueTeachers = this.appointmentService.getUniqueTeachers(this.appointments);
  }

  filterByTeacher(teacher: string): void {
    this.selectedTeacher = teacher;
  }

  clearTeacherFilter(): void {
    this.selectedTeacher = null;
    this.showTeachersDropdown = false;
  }

  getFilteredAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    const appointmentsForTimeSlot = this.appointmentService.getAppointmentsForDateTime(
        this.appointments,
        date,
        timeSlot
    );

    if (this.selectedTeacher) {
      return appointmentsForTimeSlot.filter(
          (appointment) => appointment.teacher === this.selectedTeacher
      );
    }

    return appointmentsForTimeSlot;
  }

  generateView(view: CalendarView, date: Date) {
    switch (view) {
      case CalendarView.Week:
        this.generateWeekView(date);
        break;
      case CalendarView.Day:
        this.generateDayView(date);
        break;
      default:
        this.generateWeekView(date);
    }
  }

  generateWeekView(date: Date) {
    const startOfWeek = this.startOfWeek(date);
    this.monthDays = [];

    for (let day = 0; day < 7; day++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + day);
      if (weekDate.getDay() !== 0 && weekDate.getDay() !== 6) { // Exclude weekends
        this.monthDays.push(weekDate);
      }
    }
  }

  generateDayView(date: Date) {
    this.monthDays = [date];
  }

  generateTimeSlots() {
    for (let hour = 0; hour <= 24; hour++) {
      const time = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      this.timeSlots.push(time);
    }
  }

  switchToView(view: CalendarView) {
    this.currentView = view;
    this.generateView(this.currentView, this.viewDate);
  }

  startOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate()
    );
  }

  selectDate(date?: Date, startTime?: string) {
    if (date) {
      this.selectedDate = date;
    } else {
      this.selectedDate = new Date();
    }
    this.selectedStartTime = startTime;
    this.openDialog();
  }

  calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  }

  calculateEndTime(startTime: string, duration: number): string {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration;

    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;

    return `${newHour.toString().padStart(2, '0')}:${newMinute
      .toString()
      .padStart(2, '0')}`;
  }

  openDialog(): void {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const h = hour < 10 ? `0${hour}` : hour;
    const m = minutes < 10 ? `0${minutes}` : minutes;
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: {
        date: this.selectedDate,
        title: '',
        teacher: '',
        startTime: this.selectedStartTime || `${h}:${m}`,
        endTime: this.selectedStartTime || `${h}:${m}`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointments = this.appointmentService.addAppointment(
          this.appointments,
          result.date,
          result.title,
          result.teacher,
          result.startTime,
          result.endTime
        );
        this.updateTeachersList();
      }
    });
  }

  drop(event: CdkDragDrop<Appointment[]>, date: Date, slot?: string) {
    const movedAppointment = event.item.data;

    // Calculate the duration of the original appointment in minutes
    const originalDuration = this.calculateDuration(
      movedAppointment.startTime,
      movedAppointment.endTime
    );

    movedAppointment.date = date; // Update to the new date

    if (slot) {
      movedAppointment.startTime = slot; // Update the start time
      // Calculate the new end time based on the original duration
      movedAppointment.endTime = this.calculateEndTime(slot, originalDuration);
    }

    this.appointments = this.appointmentService.editAppointment(
      this.appointments,
      movedAppointment
    );
  }

  editAppointment(appointment: Appointment, event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: appointment,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.remove) {
          this.appointments = this.appointments.filter(
            (appt) => appt.uuid !== result.uuid
          );
        } else {
          this.appointments = this.appointmentService.editAppointment(
            this.appointments,
            result
          );
        }
      }
    });
  }

  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    return this.appointmentService.getAppointmentsForDateTime(
      this.appointments,
      date,
      timeSlot
    );
  }
}
