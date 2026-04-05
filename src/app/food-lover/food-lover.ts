import { Component, inject } from '@angular/core';
import { Recipe, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-food-lover',
  imports: [],
  templateUrl: './food-lover.html',
  styleUrl: './food-lover.css',
})
export class FoodLover {
  protected readonly recipes: Recipe[] = inject(RecipeService).getRecipes().filter((recipe) => recipe.type === 'food');
}
