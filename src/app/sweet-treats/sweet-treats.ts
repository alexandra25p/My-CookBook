import { Component, inject } from '@angular/core';
import { Recipe, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-sweet-treats',
  templateUrl: './sweet-treats.html',
  styleUrl: './sweet-treats.css'
})
export class SweetTreats {
  protected readonly recipes: Recipe[] = inject(RecipeService).getRecipes().filter((recipe) => recipe.type === 'sweet');
}