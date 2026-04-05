import { TestBed } from '@angular/core/testing';

import { Recipe, RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [RecipeService],
    });

    service = TestBed.inject(RecipeService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should store and return recipes', () => {
    const recipe: Recipe = {
      id: 1,
      title: 'Clătite pufoase',
      type: 'sweet',
      time: 20,
      ingredients: 'ouă, făină, lapte',
      method: 'Amestecă ingredientele și gătește pe tigaie.',
      image: 'data:image/png;base64,abc',
    };

    service.addRecipe(recipe);

    expect(service.getRecipes()).toEqual([recipe]);
  });
});