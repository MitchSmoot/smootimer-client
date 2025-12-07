import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { TimerPage } from './features/smootimer/timer-page/timer-page';
import { DataImportPage } from './features/data-import/data-import-page/data-import-page';
import { UserPage } from './features/users/user-page/user-page';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'timer', component: TimerPage },
  { path: 'users', component: UserPage },
  { path: 'import', component: DataImportPage },
  { path: 'login', component: Login },
  
  { path: '**', redirectTo: '' },
];
