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

  it('should store and return recipes', async () => {
    const recipe: Recipe = {
      id: 1,
      title: 'Fluffy Pancakes',
      type: 'sweet',
      time: 20,
      ingredients: [
        { name: 'eggs', amount: 2, unit: 'buc' },
        { name: 'flour', amount: 200, unit: 'g' },
        { name: 'milk', amount: 300, unit: 'ml' },
      ],
      method: 'Mix everything and cook in a pan.',
      image: 'data:image/png;base64,abc',
    };

    await service.addRecipe(recipe);

    expect(service.getRecipes()).toEqual([recipe]);
  });
});