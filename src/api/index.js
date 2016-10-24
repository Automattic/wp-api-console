import CoreApi from './core';
import ComApi from './com';

const APIs = {
  [CoreApi.name]: CoreApi,
  [ComApi.name]: ComApi
};

export const apis = Object.keys(APIs);
export const getDefault = () => ComApi;
export const get = name => {
  return APIs[name] ? APIs[name] : getDefault();
};
