import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HistoryComponent } from './history.component';

@NgModule({ 
    declarations: [HistoryComponent], 
    imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([{ 
        path: '', component: HistoryComponent 
    }])] 
})
export class HistoryModule {}
