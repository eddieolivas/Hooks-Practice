import React, { useState, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

const Ingredients = () => {
  const [ ingredients, setIngredients ] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_DB_URL + '/ingredients.json')
    .then(response => response.json())
    .then(responseData => {
      const loadedIngredients = [];
      for (const key in responseData) {
        loadedIngredients.push({
          id: key,
          title: responseData[key].title,
          amount: responseData[key].amount
        });
      }
      setIngredients(loadedIngredients);
    });
  }, []);

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', ingredients);
  }, [ingredients]);

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
    setIngredients(prevIngredients => prevIngredients.filter(x => x.id !== ingredientId));
  }

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
