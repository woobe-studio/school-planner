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
    private dateService: DateService // Inject DateService
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
      { validators: timeRangeValidator }
    );
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
    return this.dateService.getSelectedDate(new Date(this.data.date), this.selectedWeekday);
  }

  // Access the weekdays from DateService
  get weekdays() {
    return this.dateService.weekdays;

  }
  onCancelClick(): void {
    this.cancel.emit();
  }
}
