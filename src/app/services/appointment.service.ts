import { Injectable } from '@angular/core';
import { Appointment} from "../models/appointment.model";
import { UuidService } from './uuid.service';
import { ColorService } from './color.service';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(
        private uuidService: UuidService,
        private colorService: ColorService
    ) {}
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
        appointments: Appointment[],
        date: Date,
        title: string,
        teacher: string,
        startTime: string,
        endTime: string
    ): Appointment[] {
        const newAppointment: Appointment = {
            uuid: this.uuidService.generateUUID(),
            date,
            title,
            teacher,
            startTime,
            endTime,
            color: this.colorService.getRandomColor(),
        };
        return [...appointments, newAppointment];
    }

    editAppointment(
        appointments: Appointment[],
        updatedAppointment: Appointment
    ): Appointment[] {
        const index = appointments.findIndex(
            (appointment) => appointment.uuid === updatedAppointment.uuid
        );
        if (index !== -1) {
            const updatedAppointments = [...appointments];
            updatedAppointments[index] = updatedAppointment;
            return updatedAppointments;
        }
        return appointments;
    }

    getUniqueTeachers(appointments: Appointment[]): string[] {
        const teachers = appointments.map((appointment) => appointment.teacher);
        return [...new Set(teachers)];
    }

    getAppointmentsForDateTime(
        appointments: Appointment[],
        date: Date,
        timeSlot: string
    ): Appointment[] {
        return appointments.filter(
            (appointment) =>
                this.isSameDate(appointment.date, date) &&
                appointment.startTime <= timeSlot &&
                appointment.endTime >= timeSlot
        );
    }

    private isSameDate(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate();
    }
}
