# WordPress.com API Console v3

This is a WIP rewrite in React for the WordPress.com API Console.

## Development

Hacking requires node.js, install node.js for your system. (e.g. `brew install node`).

To get up and running:

1. Clone the repository
    `git clone git@github.com:youknowriad/wp-api-console.git`

2. Install dependencies
    `npm install`

3. Run the dev server
    `npm start`

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Configure

To use with WordPress.com, visit [https://developer.wordpress.com/apps/](WordPress.com Developer Resources) and create an application.

Copy `src/config.sample.json` to `src/config.json` and use your WordPress.com App ID and Redirect URI for the values.

You will also need to add your host to the CORS whitelist in the Application's settings.

```json
{
  "wordpress.com": {
    "client_id": "33333",
    "redirect_uri": "http://localhost:3000"
  }
}
```

You can also use this console with your WordPress.org installation but make sure to install the WP REST API - OAuth 1.0a Server first, create an app on it and then edit the `src/config.json` like this:

```json
{
  "wordpress.org": [
    {
      "name": "Dev",
      "url": "http://src.wordpress-develop.dev",
      "publicKey": "PwQXbJdBYrXq",
      "secretKey": "XB9oidFfxr3guKhFcSOvwOamFlOQnauPbEcN6krtKix9MBVb",
      "callbackUrl": "http://localhost:3000"
    }
  ]
}
```

Note that your application should not be on localhost to work.

## Building

To create a static package you can use anywhere (e.g. Github pages):
    `npm run build`

The static site is located in `build`


## License

All source code licensed under the [MIT](./LICENSE) open source license.
