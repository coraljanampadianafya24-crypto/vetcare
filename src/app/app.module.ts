import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppShellComponent } from './app-shell.component';
import { PublicModule } from './features/public/public.module';

@NgModule({ 
    declarations: [AppComponent, AppShellComponent], 
    imports: [BrowserModule, AppRoutingModule, PublicModule], 
    bootstrap: [AppComponent] 
})
export class AppModule {}
