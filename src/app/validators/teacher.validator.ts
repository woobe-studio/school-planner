import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AppointmentService} from "../services/appointment.service"; // Import AppointmentService
import { DateService} from "../services/date.service"; // Import DateService

// Create a factory function for the validator that allows you to inject dependencies
export function teacherAvailabilityValidator(
  appointmentService: AppointmentService,
  dateService: DateService
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const teacher = control.get('teacher')?.value;
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;
    const date = control.get('date')?.value;

    if (teacher && startTime && endTime && date) {
      // Convert the selected weekday and date to actual date object
      const selectedDate = dateService.getSelectedDate(new Date(), date); // Adjust this if needed

      // Call hasAppointmentAtTime from AppointmentService
      if (appointmentService.hasAppointmentAtTime(
        [], // Pass the actual list of appointments
        teacher,
        selectedDate,
        startTime,
        endTime
      )) {
        return { teacherUnavailable: true }; // Custom error if the teacher is unavailable
      }
    }
    return null;
  };
}
