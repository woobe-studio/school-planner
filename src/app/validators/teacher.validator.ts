import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AppointmentService } from "../services/appointment.service"; // Import AppointmentService
import { DateService } from "../services/date.service"; // Import DateService

export function teacherAvailabilityValidator(
  appointmentService: AppointmentService,
  dateService: DateService
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const teacher = control.get('teacher')?.value;
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;
    const weekday = control.get('date')?.value; // Assume this is a weekday name

    if (teacher && startTime && endTime && weekday) {
      // Convert the weekday and base date into an actual date
      const selectedDate = dateService.getSelectedDate(new Date(), weekday);

      // Retrieve appointments from localStorage using AppointmentService
      const appointments = appointmentService.getAppointments();

      // Check if there's a conflict
      const isTeacherUnavailable = appointmentService.hasAppointmentAtTime(
        appointments,
        teacher,
        selectedDate,
        startTime,
        endTime
      );

      if (isTeacherUnavailable) {
        return { teacherUnavailable: true }; // Custom error if teacher is unavailable
      }
    }

    return null; // No errors
  };
}
