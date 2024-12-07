// services/date.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Method to get the weekday name from a Date object
  getWeekdayFromDate(date: Date): string {
    const dayOfWeek = date.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.
    return this.weekdays[dayOfWeek - 1] || 'Monday'; // Default to Monday if undefined
  }

  // Method to convert a selected weekday to a Date object based on a reference date
  getSelectedDate(date: Date, selectedWeekday: string): Date {
    const targetDayOfWeek = this.weekdays.indexOf(selectedWeekday) + 1; // 1-5 for Monday to Friday
    const currentDayOfWeek = date.getDay(); // Get the day of the week (0-6, where 0 is Sunday)
    const diff = targetDayOfWeek - currentDayOfWeek; // Calculate the difference from current day of week

    date.setDate(date.getDate() + diff);
    return date;
  }
}
