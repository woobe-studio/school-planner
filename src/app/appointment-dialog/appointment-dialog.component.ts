import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

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
  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  selectedWeekday: string;

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
    private formBuilder: FormBuilder
  ) {
    // Initialize the form and determine the initial weekday selection
    this.selectedWeekday = this.getWeekdayFromDate(this.data.date || new Date());

    this.appointmentForm = this.formBuilder.group(
      {
        title: [this.data.title || '', Validators.required],
        teacher: [this.data.teacher || '', Validators.required],
        date: [this.selectedWeekday, Validators.required], // Weekday selected instead of date
        startTime: [this.data.startTime || '', Validators.required],
        endTime: [this.data.endTime || '', Validators.required],
      },
      { validators: this.timeRangeValidator }
    );
  }

  // Automatically determine the weekday from a given date
  getWeekdayFromDate(date: Date): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayOfWeek = date.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.
    return days[dayOfWeek -1] || 'Monday'; // Ensure we default to Monday if undefined
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.appointmentForm.valid) {
      const data = {
        title: this.appointmentForm.controls['title'].value,
        teacher: this.appointmentForm.controls['teacher'].value,
        date: this.getSelectedDate(), // Convert weekday to actual date
        startTime: this.appointmentForm.controls['startTime'].value,
        endTime: this.appointmentForm.controls['endTime'].value,
        uuid: this.data.uuid,
      };
      this.dialogRef.close(data);
    }
  }

  onDeleteClick(): void {
    this.dialogRef.close({ remove: true, uuid: this.data.uuid });
  }

  // Convert selected weekday to a Date object based on the original date
  getSelectedDate(): Date {
    const targetDayOfWeek = this.weekdays.indexOf(this.selectedWeekday) +1; // 1-5 for Monday to Friday
    const currentDate = new Date(this.data.date); // Use the original date for calculation
    const currentDayOfWeek = currentDate.getDay(); // Get the day of week (0-6, where 0 is Sunday)
    const diff = targetDayOfWeek - currentDayOfWeek; // Calculate difference from current day of week


    currentDate.setDate(currentDate.getDate() + diff);
    return currentDate;
  }

  // Time range validator for ensuring start time is before end time
  timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;

    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);

      if (startDate >= endDate) {
        return { timeRangeInvalid: true };
      }
    }
    return null;
  };
}
