import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import {MatOption} from "@angular/material/core";
import { MatSelect } from "@angular/material/select";


const routes: Routes = [{ path: '', component: CalendarComponent }];

@NgModule({
  declarations: [CalendarComponent],
  imports: [
    FormsModule,
        CommonModule,
        MatButtonModule,
        MatButtonToggleGroup,
        MatButtonToggle,
        MatIconModule,
        DragDropModule,
        AppointmentDialogComponent,
        RouterModule.forChild(routes),
        MatOption,
    MatSelect,
    
    ],
})
export class CalendarModule {}
