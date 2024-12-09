// appointment-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import {  Input, Output, EventEmitter } from '@angular/core';

import { DateService} from "../../services/date.service";
import { timeRangeValidator} from "../../validators/time-range.validator";
import {teacherAvailabilityValidator} from "../../validators/teacher.validator";
import {AppointmentService} from "../../services/appointment.service";

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;
  selectedWeekday: string;
  showValidTimeMessage: boolean = false;
  private readonly localStorageKey = 'appointments';

  @Input() appointmentData!: {
    uuid: string;
    date: Date;
    title: string;
    teacher: string;
    startTime: string;
    endTime: string;
  };
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      uuid: string;
      date: Date;
      title: string;
      teacher: string;
      startTime: string;
      endTime: string;
      color: string;
    },
    private formBuilder: FormBuilder,
    private dateService: DateService, // Inject DateService
    private appointmentService: AppointmentService
    
  ) {
    // Initialize the form and determine the initial weekday selection
    this.selectedWeekday = this.dateService.getWeekdayFromDate(this.data.date || new Date());

    this.appointmentForm = this.formBuilder.group(
      {
        title: [this.data.title || '', Validators.required],
        teacher: [this.data.teacher || '', Validators.required],
        date: [this.selectedWeekday, Validators.required], // Weekday selected instead of date
        startTime: [this.data.startTime || '', Validators.required],
        endTime: [this.data.endTime || '', Validators.required],
      },
      {         validators: [
          timeRangeValidator,
          teacherAvailabilityValidator(this.appointmentService, this.dateService)
          // Pass services here
        ]

      }
    );
    this.appointmentForm.valueChanges.subscribe(() => {
      this.checkValidTimes();
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  checkValidTimes(): void {
    const startTime = this.appointmentForm.get('startTime')?.value;
    const endTime = this.appointmentForm.get('endTime')?.value;

    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);

      // Time cannot exceed 17:30
      const maxTime = new Date();
      maxTime.setHours(17, 30, 0, 0);

      // If both times are valid, set flag to show the message
      this.showValidTimeMessage = startDate <= maxTime && endDate <= maxTime;
    }
  }

  onSaveClick(): void {
  if (this.appointmentForm.valid) {
    const data = {
      title: this.appointmentForm.controls['title'].value,
      teacher: this.appointmentForm.controls['teacher'].value,
      date: this.getSelectedDate(), // Convert weekday to actual date
      startTime: this.appointmentForm.controls['startTime'].value,
      endTime: this.appointmentForm.controls['endTime'].value,
      uuid: this.data.uuid || crypto.randomUUID(), // Generate UUID if not provided
    };

    // Pobierz istniejące dane z localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    // Zaktualizuj lub dodaj nowe dane do listy
    const updatedAppointments = existingAppointments.filter((appt: any) => appt.uuid !== data.uuid);
    updatedAppointments.push(data);

    // Zapisz zaktualizowaną listę do localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    this.save.emit(data); // Emit the data
    this.dialogRef.close(data);
  }
}


  onDeleteClick(): void {
    this.dialogRef.close({ remove: true, uuid: this.data.uuid });
  }

  // Convert selected weekday to a Date object based on the original date
  getSelectedDate(): Date {
    return this.dateService.getSelectedDate(new Date(this.data.date), this.selectedWeekday);
  }

  // Access the weekdays from DateService
  get weekdays() {
    return this.dateService.weekdays;

  }
  onCancelClick(): void {
  localStorage.removeItem(this.localStorageKey); // Usuń dane z local storage
  this.cancel.emit(); // Emitowanie zdarzenia "cancel"
  this.dialogRef.close(); // Zamknięcie dialogu
}
generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


}
