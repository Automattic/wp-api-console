import * as oauth from './oauth';
import * as proxy from './proxy';
import config from '../config';

const auth = config.auth === 'proxy' ? proxy : oauth;

export default auth;
