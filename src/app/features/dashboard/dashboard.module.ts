import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({ 
    declarations: [DashboardComponent], 
    imports: [SharedModule, ReactiveFormsModule, RouterModule.forChild([{ 
        path: '', component: DashboardComponent 
    }])] 
})
export class DashboardModule {}
