import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { Appointment } from "../../models/appointment.model";
import { AppointmentService } from '../../services/appointment.service';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


export enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

export enum TeacherSortOrder {
  None = 'none',
  AscendingHours = 'asc',
  DescendingHours = 'desc'
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
  currentView: CalendarView = CalendarView.Week;
  timeSlots: string[] = [];
  filteredAppointments: Appointment[] = [...this.appointments];
  selectedTeacher: string | null = null;
  uniqueTeachers: string[] = [];
  showTeachersDropdown = false;
  showDialog = false;
  selectedAppointment: Appointment | null = null;


  // New properties for teacher sorting
  teacherSortOrder: TeacherSortOrder = TeacherSortOrder.None;
  teacherHoursMap: Map<string, number> = new Map();

  constructor(
    public dialog: MatDialog,
    private appointmentService: AppointmentService
  ) { }

  

  onDialogSave(data: any): void {
    // Sprawdź, czy spotkanie już istnieje (edycja istniejącego spotkania)
    if (this.selectedAppointment?.uuid) {
      // Edytuj istniejące spotkanie
      const index = this.appointments.findIndex(
        (a) => a.uuid === this.selectedAppointment?.uuid
      );
      if (index !== -1) {
        const updatedAppointment = { ...data, uuid: this.selectedAppointment.uuid };

        // Sprawdź konflikt z innymi spotkaniami przed zapisaniem
        const hasConflict = this.hasConflictingAppointment(
          updatedAppointment.teacher,
          updatedAppointment.date,
          updatedAppointment.startTime,
          updatedAppointment.endTime,
          updatedAppointment.uuid // Ignoruj aktualnie edytowane spotkanie
        );

        if (hasConflict) {
          alert('Nauczyciel ma już zajęcia w tym samym czasie!');
          return;
        }

        // Brak konfliktu - zapisujemy spotkanie
        this.appointments[index] = updatedAppointment;
        this.filteredAppointments = [...this.appointments];
      }
    } else {
      // Dodaj nowe spotkanie
      const newAppointment = { ...data, uuid: crypto.randomUUID() };

      // Sprawdź konflikt z innymi spotkaniami przed zapisaniem
      const hasConflict = this.hasConflictingAppointment(
        newAppointment.teacher,
        newAppointment.date,
        newAppointment.startTime,
        newAppointment.endTime
      );

      if (hasConflict) {
        alert('Nauczyciel ma już zajęcia w tym samym czasie!');
        return;
      }

      // Brak konfliktu - dodaj nowe spotkanie
      this.appointments.push(newAppointment);
      this.filteredAppointments = [...this.appointments];
    }

    this.closeDialog();
  }

  onDialogCancel(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedAppointment = null;
  }

  ngOnInit(): void {
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
    this.filteredAppointments = [...this.appointments];
    this.updateTeachersList();
  }

  // New method to generate view based on current view and date
  generateView(view: CalendarView, date: Date): void {
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

  // Generate week view
  generateWeekView(date: Date): void {
    // Implementation to generate week view days
    this.monthDays = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(date);
      day.setDate(date.getDate() - date.getDay() + i + 1);
      this.monthDays.push(day);
    }
  }

  // Generate day view
  generateDayView(date: Date): void {
    // Implementation to generate a single day view
    this.monthDays = [date];
  }

  // Generate time slots for the calendar
  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${formattedHour}:00`);
      this.timeSlots.push(`${formattedHour}:30`);
    }
  }

  // Switch to a specific view
  switchToView(view: string): void {
    switch (view) {
      case 'week':
        this.currentView = CalendarView.Week;
        break;
      case 'day':
        this.currentView = CalendarView.Day;
        break;
      default:
        this.currentView = CalendarView.Week;
    }
    this.generateView(this.currentView, this.viewDate);
  }

  // Open appointment dialog
  openDialog(): void {
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '400px',
      data: {
        date: this.selectedDate,
        startTime: this.selectedStartTime,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const hasConflict = this.hasConflictingAppointment(
          result.teacher,
          result.date,
          result.startTime,
          result.endTime
        );

        if (hasConflict) {
          alert('Nauczyciel ma już zajęcia w tym samym czasie!');
          return;
        }

        const newAppointment: Appointment = {
          uuid: crypto.randomUUID(), // Generowanie unikalnego ID
          date: result.date,
          title: result.title,
          teacher: result.teacher,
          startTime: result.startTime,
          endTime: result.endTime,
        };

        this.appointments.push(newAppointment);
        this.filteredAppointments = [...this.appointments];
        this.updateTeachersList();
      }
    });
  }


  // Rest of the methods from the previous implementation remain the same...

  updateTeachersList(): void {
    // Calculate total hours for each teacher
    this.teacherHoursMap = this.calculateTeacherHours();

    // Get unique teachers and apply sorting if needed
    let teachers = this.appointmentService.getUniqueTeachers(this.appointments);

    if (this.teacherSortOrder !== TeacherSortOrder.None) {
      teachers = this.sortTeachersByHours(teachers);
    }

    this.uniqueTeachers = teachers;
  }

  calculateTeacherHours(): Map<string, number> {
    const hoursMap = new Map<string, number>();

    this.appointments.forEach(appointment => {
      const duration = this.calculateDuration(appointment.startTime, appointment.endTime);
      const currentHours = hoursMap.get(appointment.teacher) || 0;
      hoursMap.set(appointment.teacher, currentHours + (duration / 60));
    });

    return hoursMap;
  }

  sortTeachersByHours(teachers: string[]): string[] {
    return teachers.sort((a, b) => {
      const hoursA = this.teacherHoursMap.get(a) || 0;
      const hoursB = this.teacherHoursMap.get(b) || 0;

      return this.teacherSortOrder === TeacherSortOrder.AscendingHours
        ? hoursA - hoursB
        : hoursB - hoursA;
    });
  }

  toggleTeacherSort(): void {
    // Cycle through sort orders
    switch (this.teacherSortOrder) {
      case TeacherSortOrder.None:
        this.teacherSortOrder = TeacherSortOrder.AscendingHours;
        break;
      case TeacherSortOrder.AscendingHours:
        this.teacherSortOrder = TeacherSortOrder.DescendingHours;
        break;
      case TeacherSortOrder.DescendingHours:
        this.teacherSortOrder = TeacherSortOrder.None;
        break;
    }

    // Update teachers list with new sorting
    this.updateTeachersList();
  }

  filterByTeacher(teacher: string): void {
    this.selectedTeacher = teacher;
    // Optional: Filter appointments by selected teacher
    this.filteredAppointments = this.appointments.filter(
      appointment => appointment.teacher === teacher
    );
  }

  clearTeacherFilter(): void {
    this.selectedTeacher = null;
    this.showTeachersDropdown = false;
    this.filteredAppointments = [...this.appointments];
  }

  // Method to get display text for current sort order
  getTeacherSortLabel(): string {
    switch (this.teacherSortOrder) {
      case TeacherSortOrder.AscendingHours:
        return 'Sort ↑';
      case TeacherSortOrder.DescendingHours:
        return 'Sort ↓';
      default:
        return 'Sort';
    }
  }

  // Method to get total hours for a teacher (optional, can be used for display)
  getTeacherTotalHours(teacher: string): number {
    return Number((this.teacherHoursMap.get(teacher) || 0).toFixed(1));
  }

  calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
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
  // Add these methods to the CalendarComponent class in calendar.component.ts

  drop(event: CdkDragDrop<Appointment[]>, day: Date, timeSlot: string): void {
    if (event.previousContainer === event.container) {
      // Item dropped in the same container - no action needed
      return;
    }

    const appointment = event.item.data as Appointment;

    // Update the appointment's date and start time
    const updatedAppointment = {
      ...appointment,
      date: day,
      startTime: timeSlot,
      // Optionally adjust end time based on the dropped time slot
      endTime: this.calculateEndTime(timeSlot, appointment.startTime, appointment.endTime)
    };

    // Find and update the appointment in the list
    const index = this.appointments.findIndex(a => a.uuid === appointment.uuid);
    if (index !== -1) {
      this.appointments[index] = updatedAppointment;
      this.filteredAppointments = [...this.appointments];
    }
  }

  getFilteredAppointmentsForDateTime(day: Date, timeSlot: string): Appointment[] {
    return this.filteredAppointments.filter(appointment => {
      // Ensure the appointment matches both the day and time slot
      const isSameDate = this.isSameDay(appointment.date, day);
      const isInTimeSlot = appointment.startTime === timeSlot;

      return isSameDate && isInTimeSlot;
    });
  }

  editAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '400px',
      data: {
        ...appointment,
        isEdit: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const hasConflict = this.hasConflictingAppointment(
          result.teacher,
          result.date,
          result.startTime,
          result.endTime,
          appointment.uuid // Ignoruj aktualnie edytowane spotkanie
        );

        if (hasConflict) {
          alert('Nauczyciel ma już zajęcia w tym samym czasie!');
          return;
        }

        const index = this.appointments.findIndex((a) => a.uuid === appointment.uuid);
        if (index !== -1) {
          this.appointments[index] = {
            ...result,
            uuid: appointment.uuid, // Zachowanie oryginalnego UUID
          };
          this.filteredAppointments = [...this.appointments];
          this.updateTeachersList();
        }
      }
    });
  }


  // Helper method to check if two dates are on the same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Optional helper method to calculate end time when dragging
  private calculateEndTime(newStartTime: string, oldStartTime: string, oldEndTime: string): string {
    const [oldStartHour, oldStartMinute] = oldStartTime.split(':').map(Number);
    const [newStartHour, newStartMinute] = newStartTime.split(':').map(Number);

    const durationMinutes = this.calculateDuration(oldStartTime, oldEndTime);

    const newEndTime = new Date(0, 0, 0, newStartHour, newStartMinute);
    newEndTime.setMinutes(newEndTime.getMinutes() + durationMinutes);

    return `${newEndTime.getHours().toString().padStart(2, '0')}:${newEndTime.getMinutes().toString().padStart(2, '0')}`;
  }
  private hasConflictingAppointment(
    teacher: string,
    date: Date,
    startTime: string,
    endTime: string,
    ignoreUuid?: string // Opcjonalnie ignoruj spotkanie z określonym UUID (np. przy edycji)
  ): boolean {
    return this.appointments.some(appointment => {
      if (appointment.teacher !== teacher || (ignoreUuid && appointment.uuid === ignoreUuid)) {
        return false;
      }

      const isSameDay = this.isSameDay(appointment.date, date);

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const [appointmentStartHour, appointmentStartMinute] = appointment.startTime.split(':').map(Number);
      const [appointmentEndHour, appointmentEndMinute] = appointment.endTime.split(':').map(Number);

      const newStart = new Date(0, 0, 0, startHour, startMinute).getTime();
      const newEnd = new Date(0, 0, 0, endHour, endMinute).getTime();
      const existingStart = new Date(0, 0, 0, appointmentStartHour, appointmentStartMinute).getTime();
      const existingEnd = new Date(0, 0, 0, appointmentEndHour, appointmentEndMinute).getTime();

      return isSameDay && ((newStart < existingEnd && newEnd > existingStart));
    });
  }



}
