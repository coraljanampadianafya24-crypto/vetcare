import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicHomeComponent } from './public-home.component';
import { ServiceDetailComponent } from './service-detail.component';

@NgModule({
  declarations: [PublicHomeComponent, ServiceDetailComponent],
  imports: [CommonModule, RouterModule],
  exports: [PublicHomeComponent, ServiceDetailComponent]
})
export class PublicModule {}
