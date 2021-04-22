import React, { useState, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

const Ingredients = () => {
  const [ ingredients, setIngredients ] = useState([]);

  const filteredIngredientsHandler = useCallback(filterIngredients => {
    setIngredients(filterIngredients);
  }, []);

  const addIngredientHandler = ingredient => {
    fetch(process.env.REACT_APP_DB_URL + '/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      return response.json();
    }).then(responseData => {
      setIngredients(prevIngredients => [
        ...prevIngredients,
        { id: responseData.name, ...ingredient }
      ]);
    });
  }

  const removeIngredientHandler = ingredientId => {
    fetch(process.env.REACT_APP_DB_URL + `/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    }).then(response => {
      setIngredients(prevIngredients => prevIngredients.filter(x => x.id !== ingredientId));
    });
  }

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
