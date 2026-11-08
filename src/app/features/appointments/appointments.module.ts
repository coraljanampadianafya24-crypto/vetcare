import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentsComponent } from './appointments.component';

@NgModule({ 
    declarations: [AppointmentsComponent], 
    imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([{ 
        path: '', component: AppointmentsComponent 
    }])] 
})
export class AppointmentsModule {}
