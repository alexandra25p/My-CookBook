import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { Recipe, RecipeService } from '../recipe.service';
import { RecipeModal } from '../recipe-modal/recipe-modal';

@Component({
  selector: 'app-food-lover',
  imports: [AsyncPipe, RecipeModal],
  templateUrl: './food-lover.html',
  styleUrl: './food-lover.css',
})
export class FoodLover {
  private readonly recipeService = inject(RecipeService);

  protected selectedRecipe: Recipe | null = null;

  protected readonly recipes$ = this.recipeService
    .getRecipesStream()
    .pipe(map((recipes) => recipes.filter((recipe) => recipe.type === 'food')));

  protected showFullRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  protected closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}
