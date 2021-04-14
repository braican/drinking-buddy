import home from '../pages/home.html';
import notfound from '../pages/404.html';

const routes = {
  '/': {
    page: home,
  },
  '*': {
    page: notfound,
  },
};

export default routes;
