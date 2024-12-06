import {Component} from '@angular/core';

import {MatDialog} from '@angular/material/dialog';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {AppointmentDialogComponent} from '../appointment-dialog/appointment-dialog.component';

interface Appointment {
  uuid?: string;
  date: Date;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}

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
export class CalendarComponent {
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
      startTime: '12:00',
      endTime: '13:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000003',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 3),
      title: 'Project Deadline',
      startTime: '15:00',
      endTime: '16:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000007',
      date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 4
      ),
      title: 'Client Call',
      startTime: '09:30',
      endTime: '10:30',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000008',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
      title: 'Gym',
      startTime: '17:00',
      endTime: '18:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000009',
      date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 1
      ),
      title: 'Dentist Appointment',
      startTime: '11:30',
      endTime: '12:30',
    },
    {
      uuid: '00000000-0000-0000-0000-00000000000a',
      date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 2
      ),
      title: 'Birthday Party',
      startTime: '19:00',
      endTime: '21:00',
    },
    {
      uuid: '00000000-0000-0000-0000-00000000000b',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 11),
      title: 'Conference',
      startTime: '13:00',
      endTime: '14:00',
    },
    {
      uuid: '00000000-0000-0000-0000-00000000000c',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
      title: 'Workshop',
      startTime: '10:00',
      endTime: '12:00',
    },
    {
      uuid: '00000000-0000-0000-0000-00000000000e',
      date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 2
      ),
      title: 'Networking Event',
      startTime: '18:00',
      endTime: '20:00',
    },
    {
      uuid: '00000000-0000-0000-0000-00000000000f',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 16),
      title: 'Yoga Class',
      startTime: '07:00',
      endTime: '08:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000010',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 16),
      title: 'Strategy Meeting',
      startTime: '10:00',
      endTime: '11:30',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000011',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 17),
      title: 'Call with Investor',
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000012',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
      title: 'Team Lunch',
      startTime: '12:00',
      endTime: '13:00',
    },
    {
      uuid: '00000000-0000-0000-0000-000000000013',
      date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 3
      ),
      title: 'HR Meeting',
      startTime: '16:00',
      endTime: '17:00',
    },
  ];
  currentView: CalendarView = CalendarView.Month;
  timeSlots: string[] = [];

  weeks: Date[][] = [];

  constructor(public dialog: MatDialog) {
    this.appointments.forEach((appointment) => {
      appointment.color = this.getRandomColor();
    });
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
  }

  generateView(view: CalendarView, date: Date) {
    switch (view) {
      case CalendarView.Month:
        this.generateMonthView(date);
        break;
      case CalendarView.Week:
        this.generateWeekView(date);
        break;
      case CalendarView.Day:
        this.generateDayView(date);
        break;
      default:
        this.generateMonthView(date);
    }
  }

  generateMonthView(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.weeks = [];
    this.monthDays = [];
    let week: Date[] = [];

    for (let day = start.getDay(); day > 0; day--) {
      const prevDate = new Date(start);
      prevDate.setDate(start.getDate() - day);
      if (prevDate.getDay() !== 0 && prevDate.getDay() !== 6) { // Exclude weekends
        week.push(prevDate);
        this.monthDays.push(prevDate);
      }
    }

    for (let day = 1; day <= end.getDate(); day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Exclude weekends
        this.monthDays.push(currentDate);
        week.push(currentDate);
        if (week.length === 5) { // Only allow 5 days in a week
          this.weeks.push(week);
          week = [];
        }
      }
    }

    if (week.length > 0) {
      this.weeks.push(week);
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
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
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

  generateUUID(): string {
    let d = new Date().getTime(); //Timestamp
    let d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        let r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }

  addAppointment(
    date: Date,
    title: string,
    startTime: string,
    endTime: string
  ) {
    this.appointments.push({
      uuid: this.generateUUID(),
      date,
      title,
      startTime,
      endTime,
      color: this.getRandomColor(),
    });
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
        startTime: this.selectedStartTime || `${h}:${m}`,
        endTime: this.selectedStartTime || `${h}:${m}`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAppointment(
          result.date,
          result.title,
          result.startTime,
          result.endTime
        );
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
  }


  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    return this.appointments.filter(
      (appointment) =>
        this.isSameDate(appointment.date, date) &&
        appointment.startTime <= timeSlot &&
        appointment.endTime >= timeSlot
    );
  }

  getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 0.4;
    return `rgba(${r},${g},${b},${a})`;
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
        const index = this.appointments.findIndex(
          (appointment) => appointment.uuid === result.uuid
        );
        if (result.remove) {
          this.appointments.splice(index, 1);
        } else {
          this.appointments[index] = result;
        }
      }
    });
  }
}
