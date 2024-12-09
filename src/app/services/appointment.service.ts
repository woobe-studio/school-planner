import { Injectable } from '@angular/core';
import { Appointment } from "../models/appointment.model";
import { UuidService } from './uuid.service';
import { ColorService } from './color.service';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    private readonly localStorageKey = 'appointments';

    constructor(
        private uuidService: UuidService,
        private colorService: ColorService
    ) {}

    getAppointments(): Appointment[] {
        const storedAppointments = localStorage.getItem(this.localStorageKey);
        return storedAppointments ? JSON.parse(storedAppointments) : [];
    }

    saveAppointments(appointments: Appointment[]): void {
        localStorage.setItem(this.localStorageKey, JSON.stringify(appointments));
    }

    hasAppointmentAtTime(
  appointments: Appointment[],
  teacher: string,
  date: Date,
  startTime: string,
  endTime: string
): boolean {
  return appointments.some(appointment =>
    appointment.teacher === teacher &&
    this.isSameDate(appointment.date, date) &&
    !(appointment.endTime <= startTime || appointment.startTime >= endTime)
  );
}


    addAppointment(
        date: Date,
        title: string,
        teacher: string,
        startTime: string,
        endTime: string
    ): Appointment {
        const appointments = this.getAppointments();
        const newAppointment: Appointment = {
            uuid: this.uuidService.generateUUID(),
            date,
            title,
            teacher,
            startTime,
            endTime,
            color: this.colorService.getRandomColor(),
        };
        const updatedAppointments = [...appointments, newAppointment];
        this.saveAppointments(updatedAppointments);
        return newAppointment;
    }

    editAppointment(updatedAppointment: Appointment): Appointment[] {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(
            (appointment) => appointment.uuid === updatedAppointment.uuid
        );
        if (index !== -1) {
            const updatedAppointments = [...appointments];
            updatedAppointments[index] = updatedAppointment;
            this.saveAppointments(updatedAppointments);
            return updatedAppointments;
        }
        return appointments;
    }

    deleteAppointment(uuid: string): Appointment[] {
        const appointments = this.getAppointments();
        const updatedAppointments = appointments.filter(appointment => appointment.uuid !== uuid);
        this.saveAppointments(updatedAppointments);
        return updatedAppointments;
    }

    getUniqueTeachers(appointments: Appointment[]): string[] {
    const teachers = appointments.map((appointment) => appointment.teacher);
    return [...new Set(teachers)];
}


    getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
        const appointments = this.getAppointments();
        return appointments.filter(
            (appointment) =>
                this.isSameDate(new Date(appointment.date), date) &&
                appointment.startTime <= timeSlot &&
                appointment.endTime >= timeSlot
        );
    }

    private isSameDate(date1: Date, date2: Date): boolean {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
}
