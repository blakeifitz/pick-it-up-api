const xss = require('xss');

const serializeUser = (user) => {
  const sub = user.username;
  const payload = {
    user_id: user.id,
    name: user.name,
  };
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    authToken: AuthService.createJwt(sub, payload),
  };
};

const serializeItems = (item) => ({
  name: xss(item.name),
  description: xss(item.description),
  id: item.id,
  img_src: item.img_src,
  category: item.category,
  location: item.location,
});

const serializeLocation = (location) => ({
  name: xss(location.name),
  description: xss(location.description),
  id: location.id,
  coordinates: location.coordinates,
});

module.exports = {
  serializeItems,
  serializeLocation,
  serializeUser,
};
