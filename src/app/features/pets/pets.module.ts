import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PetsComponent } from './pets.component';

@NgModule({ 
    declarations: [PetsComponent], 
    imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([{ 
        path: '', component: PetsComponent 
    }])] 
})
export class PetsModule {}
