import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-lover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-lover.html',
  styleUrl: './food-lover.css' // Vom crea și CSS-ul imediat
})
export class FoodLover {
  savoryRecipes = [
    { title: 'Paste cu Pesto', time: 15, image: 'assets/pesto.jpg' },
    { title: 'Risotto cu Sparanghel', time: 30, image: 'assets/risotto.jpg' }
  ];
}