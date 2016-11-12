Documentation
-------------

 * The application is based on [Create React App](https://github.com/facebookincubator/create-react-app)

 * The application uses Redux to hold/update its state. The state is persisted to localStorage using the same approach as [Calypso's Data Persistence](https://wpcalypso.wordpress.com/devdocs/docs/our-approach-to-data.md#ui-state)

 * There are two main abstractions you need to know about to hack the application:

  - The Authentication Abstractions that lives under `src/auth`: to implement any other Authentication provider, you need to implement this interface

```javascript
const authProvider = {
    boot: () => {
      /*
       * Called at start to fetch the user
       * It should return a promise of the user's object
       * And should return a rejected promise if the user is not Logged In
       */
      return new Promise(resolve => { resolve(user) });
    }

    login: () => {
      /*
       * Here we should redirect the user to the login page
       */
    }

    logout: () => {
      /*
       * Here we should redirect the user to the logout page (if it exists)
       * and remove any persisted token
       */
    }

    request: request => {
      /*
       * This is used to trigger an API request using the current authProvider
       * The request object containers all the request Data
       * const { method, url, body, path } = request
       * This should always return a successful promise of the response
       * const { status, body, error } = response
       * return new Promise(resolve => { resolve(response) });
       */
    }
  }
```

- The API Abstractions that live under `src/api`: Each API object should implement the following interface:

```js
const api = {
  getDiscoveryUrl: version => {
    // Should return the current API discovery URL (with the provided version)
  },
  loadVersions: () => {
    // Should return a promise of the available version for the current API
  },
  buildRequest: (version, method, path, body) => {
    // Should return the request object for the current API
  },
  baseUrl: url // base url of the API,
  authProvider // The auth provider used by this API,
  name // Name of the API (displayed on the API selector),
  parseEndpoints: data => {
    /*
     * Should parse the data returned by the discovery request and returns an array of endpoints
     * const { 
     *  pathFormat,
     *  pathLabeled,
     *  request: {
     *    body: {
     *      param1: { type, description }
     *      param2: { type, description }
     *   },
     *    query: {} // same as body,
     *    path: {} // same as body
     *  },
     *  description,
     *  group,
     *  method
     * } = endpoint
    */
  }
}
```
