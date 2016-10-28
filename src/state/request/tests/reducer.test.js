import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import {
  REQUEST_SET_METHOD,
  REQUEST_SELECT_ENDPOINT,
  REQUEST_UPDATE_URL,
  REQUEST_UPDATE_PATH_PART_VALUE,
  REQUEST_SET_QUERY_PARAM,
  REQUEST_SET_BODY_PARAM
} from '../../actions';

const endpoint = { path_labeled: '/$site/posts' };
const state = deepFreeze({
  endpoint,
  method: 'GET',
  queryParams: { context: 'view' },
  bodyParams: { a: 'b' },
  pathValues: { $site: 'mySite' },
  url: '/help'
});

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

it('should set the new method', () => {
  const action = {
    type: REQUEST_SET_METHOD,
    payload: 'POST'
  };

  expect(reducer(state, action)).toEqual({
    endpoint,
    method: 'POST',
    queryParams: { context: 'view' },
    bodyParams: { a: 'b' },
    pathValues: { $site: 'mySite' },
    url: '/help'
  });
});

it('should select a new endpoint and reset some params', () => {
  const newEndpoint = { path_labeled: '/$site/comments' };
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: { endpoint: newEndpoint }
  };

  expect(reducer(state, action)).toEqual({
    endpoint: newEndpoint,
    method: 'GET',
    queryParams: {},
    bodyParams: {},
    pathValues: {},
    url: ''
  });
});

it('should set a new URL', () => {
  const action = {
    type: REQUEST_UPDATE_URL,
    payload: '/newurl'
  };

  expect(reducer(state, action)).toEqual({
    endpoint: endpoint,
    method: 'GET',
    queryParams: { context: 'view' },
    bodyParams: { a: 'b' },
    pathValues: { $site: 'mySite' },
    url: '/newurl'
  });
});

it('should update path values', () => {
  const action = {
    type: REQUEST_UPDATE_PATH_PART_VALUE,
    payload: { pathPart: '$slug', value: 'test' }
  };

  expect(reducer(state, action)).toEqual({
    endpoint: endpoint,
    method: 'GET',
    queryParams: { context: 'view' },
    bodyParams: { a: 'b' },
    pathValues: { $site: 'mySite', $slug: 'test' },
    url: '/help'
  });
});

it('should set query param', () => {
  const action = {
    type: REQUEST_SET_QUERY_PARAM,
    payload: { param: 'page', value: '2' }
  };

  expect(reducer(state, action)).toEqual({
    endpoint: endpoint,
    method: 'GET',
    queryParams: { context: 'view', page: '2' },
    bodyParams: { a: 'b' },
    pathValues: { $site: 'mySite' },
    url: '/help'
  });
});

it('should set body param', () => {
  const action = {
    type: REQUEST_SET_BODY_PARAM,
    payload: { param: 'title', value: 'my title' }
  };

  expect(reducer(state, action)).toEqual({
    endpoint: endpoint,
    method: 'GET',
    queryParams: { context: 'view' },
    bodyParams: { a: 'b', title: 'my title' },
    pathValues: { $site: 'mySite' },
    url: '/help'
  });
});
