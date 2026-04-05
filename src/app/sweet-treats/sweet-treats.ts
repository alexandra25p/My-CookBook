import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { Recipe, RecipeService } from '../recipe.service';
import { RecipeModal } from '../recipe-modal/recipe-modal';

@Component({
  selector: 'app-sweet-treats',
  imports: [AsyncPipe, RecipeModal],
  templateUrl: './sweet-treats.html',
  styleUrl: './sweet-treats.css'
})
export class SweetTreats {
  private readonly recipeService = inject(RecipeService);

  protected selectedRecipe: Recipe | null = null;

  protected readonly recipes$ = this.recipeService
    .getRecipesStream()
    .pipe(map((recipes) => recipes.filter((recipe) => recipe.type === 'sweet')));

  protected showFullRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  protected closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}