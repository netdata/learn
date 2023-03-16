import { configureStore, combineReducers } from "@reduxjs/toolkit";
import accept from "@theme/ApiDemoPanel/Accept/slice";
import auth from "@theme/ApiDemoPanel/Authorization/slice";
import body from "@theme/ApiDemoPanel/Body/slice";
import contentType from "@theme/ApiDemoPanel/ContentType/slice";
import params from "@theme/ApiDemoPanel/ParamOptions/slice";
import response from "@theme/ApiDemoPanel/Response/slice";
import server from "@theme/ApiDemoPanel/Server/slice";
const rootReducer = combineReducers({
  accept,
  contentType,
  response,
  server,
  body,
  params,
  auth,
});
export const createStoreWithState = (preloadedState, middlewares) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares),
  });
export const createStoreWithoutState = (preloadedState, middlewares) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares),
  });
