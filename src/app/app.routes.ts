import { Routes } from '@angular/router';
import { Home } from './home/home';
import { FoodLover } from './food-lover/food-lover';
import { SweetTreats } from './sweet-treats/sweet-treats';
import { AboutMe} from './about-me/about-me';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'food-lover', component: FoodLover},
  { path: 'sweet-treats', component: SweetTreats },
  { path: 'about-me', component: AboutMe }
];