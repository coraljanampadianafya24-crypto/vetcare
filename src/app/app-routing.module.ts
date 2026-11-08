import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicHomeComponent } from './features/public/public-home.component';
import { ServiceDetailComponent } from './features/public/service-detail.component';

const routes: Routes = [
  { path: '', component: PublicHomeComponent, pathMatch: 'full' },
  { path: 'servicios/:slug', component: ServiceDetailComponent },
  { path: 'acceso', loadChildren: () => import('./features/auth/auth.module').then(module => module.AuthModule) },
  {
    path: 'app', component: AppShellComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: '', loadChildren: () => import('./features/dashboard/dashboard.module').then(module => module.DashboardModule) },
      { path: 'mascotas', loadChildren: () => import('./features/pets/pets.module').then(module => module.PetsModule) },
      { path: 'citas', loadChildren: () => import('./features/appointments/appointments.module').then(module => module.AppointmentsModule) },
      { path: 'historial', loadChildren: () => import('./features/history/history.module').then(module => module.HistoryModule) },
      { path: '**', redirectTo: '' }
    ]
  },
 {
  path: 'perfil',
  loadChildren: () =>
    import('./features/profile/profile.module')
      .then(m => m.ProfileModule)
},
  { path: '**', redirectTo: '' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
