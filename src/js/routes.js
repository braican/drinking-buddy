import home from '../pages/home.html';
import notfound from '../pages/404.html';
import brewery from '../pages/brewery.html';
import state from '../pages/state.html';

const routes = {
  '/': {
    page: home,
  },
  '/brewery/:brewery': {
    page: brewery,
    data(params) {
      return { brewery: params.brewery };
    },
  },
  '/state/:state:': {
    page: state,
    data(params) {
      return { state: params.state };
    },
  },
  '*': {
    page: notfound,
  },
};

export default routes;
