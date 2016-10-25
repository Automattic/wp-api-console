import proxy from 'wpcom-proxy-request';

export const boot = () => {
  return new Promise((resolve, reject) => {
    proxy({ metaAPI: { accessAllUsersBlogs: true }}, err => {
      if (err !== null) {
        reject(err);
        throw err;
      }

      const timer = setTimeout(() => {
        return reject();
      }, 3000);

      proxy( { path: '/me' }, (err, response) => {
        clearTimeout(timer);
        if (err) {
          return reject();
        }
        resolve(response);
      });
    });
  });
}

export const request = req => {
  return new Promise(resolve => {
    proxy(req, (err, body, xhr) => {
      let error = err;
      if (err && body && body.error) {
        error = body.error;
      }

      resolve({
        status: xhr.status,
        body,
        error
      });
    });
  });
}

export const login = () => {
  window.location = `https://wordpress.com/wp-login.php?redirect_to=${encodeURI(window.location.href)}`
}

export const logout = () => {
  window.location = `https://wordpress.com/wp-login.php?action=logout&redirect_to=${encodeURI(window.location.href)}`
}
