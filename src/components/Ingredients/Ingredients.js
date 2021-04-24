import React, { useReducer, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch ( action.type ) {
    case 'SET': 
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default: 
    throw new Error('Something went wrong');
  }
};

const httpReducer = (httpState, action) => {
  switch ( action.type ) {
    case 'SEND':
      return { loading: true, error: null }; 
    case 'RESPONSE':
      return { ...httpState, loading: false  };
    case 'ERROR':  
      return { loading: false, error: action.error  };
    case 'CLEAR':
      return { ...httpState, error: null };
    default: 
      throw new Error('Something went wrong');
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
  // const [ ingredients, setIngredients ] = useState([]);
  // const [ isLoading, setIsLoading ] = useState(false);
  // const [ error, setError ] = useState();

  const filteredIngredientsHandler = useCallback(filterIngredients => {
    // setIngredients(filterIngredients);
    dispatch({type: 'SET', ingredients: filterIngredients});
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({ type: 'SEND'  })
    fetch(process.env.REACT_APP_DB_URL + '/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
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
    dispatchHttp({type: 'SEND'});
    fetch(process.env.REACT_APP_DB_URL + `/ingredients/${ingredientId}.jon`, {
      method: 'DELETE'
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'}); 
      // setIngredients(prevIngredients => prevIngredients.filter(x => x.id !== ingredientId));
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(err => {
      dispatchHttp({type: 'ERROR', error: err.message  })
    });
  }

  const clearError = () => {
    dispatch({type: 'CLEAR'});
  };

  return (
    <div className="App">
      {httpState.error   && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}

      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading } />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
