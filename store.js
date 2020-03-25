import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import storyReducer from './reducers/StoryReducer';
import genericReducer from './reducers/GenericReducer';
import mapReducer from './reducers/MapReducer';
import photosReducer from './reducers/PhotosReducer';
import quickquizReducer from './reducers/QuickQuizReducer';
import vehicleReducer from './reducers/VehicleReducer';
import nonmotoristReducer from './reducers/NonmotoristReducer';
import driverReducer from './reducers/DriverReducer';
import passengerReducer from './reducers/PassengerReducer';

const rootReducer = combineReducers({
  storyReducer,
  genericReducer,
  mapReducer,
  photosReducer,
  quickquizReducer,
  vehicleReducer,
  nonmotoristReducer,
  driverReducer,
  passengerReducer
});

const configureStore = () => {
  return createStore(rootReducer, composeWithDevTools());
}

export default configureStore;
