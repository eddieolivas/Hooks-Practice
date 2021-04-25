import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../components/hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch ( action.type ) {
    case 'SET': 
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    case 'ERROR':  
      return { loading: false, error: action.error  };
    default: 
    throw new Error('Something went wrong');
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear
  } = useHttp();

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({type: 'DELETE', id: reqExtra});
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: { 
          id: data.name,
          ...reqExtra 
        }
      });
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  const filteredIngredientsHandler = useCallback(filterIngredients => {
    dispatch({type: 'SET', ingredients: filterIngredients});
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      process.env.REACT_APP_DB_URL + '/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    );
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(
      process.env.REACT_APP_DB_URL + `/ingredients/${ingredientId}.json`, 
      'DELETE',
      null,
      ingredientId,
      'REMOVE_INGREDIENT'
    );
  }, [sendRequest]);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList 
        ingredients={ingredients}
        onRemoveItem={removeIngredientHandler} 
      />
    );
  }, [ingredients, removeIngredientHandler])

  return (
    <div className="App">
      {error   && (
        <ErrorModal onClose={clear}>{error}</ErrorModal>
      )}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={ isLoading } />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
