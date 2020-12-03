import {BehaviorSubject} from 'rxjs';
import {produce} from 'immer';

export const produceImmutable = <V>(
  currentValue: V,
  recipe: (value: V) => V
) => produce(currentValue, recipe) as V;

export const produceBehaviorSubjectImmutable = <T>(
  subject: BehaviorSubject<T>,
  recipe: (value: T) => T
) => subject.next(produceImmutable(subject.value, recipe));

export const getNextValueImmutable = <V>(
  currentValue: V,
  nextValueOrRecipe: V | ((value: V) => V)
) => {
  if (typeof nextValueOrRecipe !== 'function') {
    return nextValueOrRecipe;
  } else {
    const recipe = nextValueOrRecipe as (value: V) => V;
    return produceImmutable(currentValue, recipe);
  }
};

export const produceMutable = <V>(
  currentValue: V,
  recipe: (value: V) => void
) => {
  return produce(currentValue, (value: V) => {
    // Avoid passing recipe directly, since it may not actually return void (allowed by TS), which would break immer
    recipe(value);
  });
};

export const produceBehaviorSubjectMutable = <T>(
  subject: BehaviorSubject<T>,
  recipe: (value: T) => void
) => subject.next(produceMutable(subject.value, recipe));

export const getNextValueMutable = <V>(
  currentValue: V,
  nextValueOrRecipe: V | ((value: V) => void)
) => {
  if (typeof nextValueOrRecipe !== 'function') {
    return nextValueOrRecipe;
  } else {
    const recipe = nextValueOrRecipe as (value: V) => void;
    return produceMutable(currentValue, recipe);
  }
};
