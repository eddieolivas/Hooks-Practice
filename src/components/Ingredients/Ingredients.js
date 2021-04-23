import React, { useReducer, useState, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch( action.type ) {
    case 'SET': 
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default: 
    throw new Error('Should not happen')
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  // const [ ingredients, setIngredients ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState();

  const filteredIngredientsHandler = useCallback(filterIngredients => {
    // setIngredients(filterIngredients);
    dispatch({type: 'SET', ingredients: filterIngredients});
  }, []);

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch(process.env.REACT_APP_DB_URL + '/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      setIsLoading(false);
      return response.json();
    }).then(responseData => {
      // setIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   { id: responseData.name, ...ingredient }
      // ]);
      dispatch({type: 'ADD', ingredient: { id: responseData.name, ...ingredient }});
    });
  }

  const removeIngredientHandler = ingredientId => {
    setIsLoading(true);
    fetch(process.env.REACT_APP_DB_URL + `/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    }).then(response => {
      setIsLoading(false);
      // setIngredients(prevIngredients => prevIngredients.filter(x => x.id !== ingredientId));
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(err => {
      setError('Something went wrong.');
      setIsLoading(false);
    });
  }

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
