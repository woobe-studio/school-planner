import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  // Ustawienie maksymalnego dopuszczalnego czasu 17:30
  const maxTime = new Date();
  maxTime.setHours(17, 30, 0, 0);

  // Jeśli startTime i endTime są ustawione
  if (startTime && endTime) {
    // Rozdzielamy godziny i minuty z obu czasów
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);

    // Sprawdzamy, czy startTime lub endTime przekraczają 17:30
    if (startDate > maxTime || endDate > maxTime) {
      return { timeExceedsLimit: true };
    }

    // Jeśli startTime jest większy lub równy endTime
    if (startDate >= endDate) {
      return { timeRangeInvalid: true };
    }
  }

  return null;
};
