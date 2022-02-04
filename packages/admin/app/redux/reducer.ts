import { combineReducers } from 'redux';
import userReducer from './slices/user';
import siteReducer from './slices/site';

const reducer = combineReducers({
  user: userReducer, site: siteReducer
});

export default reducer;
