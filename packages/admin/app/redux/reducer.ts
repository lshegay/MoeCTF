import { combineReducers } from 'redux';
import user from './slices/user';
import site from './slices/site';

const rootReducer = combineReducers({ user, site });

export default rootReducer;
