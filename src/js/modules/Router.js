import Mustache from 'mustache';
import { regexify } from '../util';

/**
 * A simple router.
 */
class Router {
  /**
   * Constructor.
   *
   * @param {object} routes Routes config.
   *
   * @return void
   */
  constructor(routes) {
    this.events = {};
    this.routes = routes;
  }

  /**
   * Init the router by setting up the DOM frame and the popstate for handling
   * location updates.
   *
   * @returns void
   */
  init() {
    if (!this.routes) {
      return console.error('[Router error] no routes config set.');
    }

    const appFrame = document.querySelector('#app-frame');

    if (!appFrame) {
      return console.error('[Router error] no app frame found in the DOM.');
    }
    this.appFrame = appFrame;

    this.updatePage();

    window.addEventListener('popstate', this.updatePage.bind(this));
  }

  /**
   * Set up listeners inside the app frame.
   *
   * @return void
   */
  setupLinkListeners() {
    this.appFrame.querySelectorAll('a[data-href]').forEach(el => {
      el.href = '#';
      el.addEventListener('click', this.handleClick.bind(this));
    });
  }

  /**
   * Change the page.
   *
   * @return void
   */
  updatePage() {
    const route = window.location.pathname;
    let data = {
      params: {},
    };

    const match = Object.keys(this.routes).find(str => {
      const find = route.match(regexify(str));
      if (find !== null) {
        const keys = str.match(/(:.+\/?)/);
        for (let index = 1; index < find.length; index++) {
          data.params[keys[index].replace(':', '')] = find[index];
        }
        return true;
      }
      return false;
    });

    this.route = route;
    this.config = this.routes[match] || null;

    if (this.config?.data && typeof this.config?.data === 'function') {
      const routeData = this.config.data(data.params);
      if (typeof routeData === 'object') {
        data = { ...data, ...routeData };
      } else {
        data.data = routeData;
      }
    }

    const markup = Mustache.render(this.config?.page || '', data, {}, ['<%', '%>']);

    this.appFrame.innerHTML = markup;
    this.setupLinkListeners();
    (this.events.load || []).forEach(fn => fn());
  }

  /**
   * Handle a link click.
   *
   * @param {object} event Click event object.
   *
   * @return void
   */
  handleClick(event) {
    const { href } = event.currentTarget.dataset;
    event.preventDefault();
    this.push(href);
  }

  /**
   * Add the passed slug to the history object and fire a page load.
   *
   * @visibility public
   *
   * @param {string} href New slug to load.
   *
   * @return void
   */
  push(href) {
    window.history.pushState({ slug: href }, '', href);
    this.updatePage();
  }

  /**
   * Event listener for the router.
   *
   * @visibility public
   *
   * @param {string} event Event name.
   * @param {function} cb Callback function for the event listener.
   *
   * @returns object
   *   @property {function} off Removes the event listener.
   */
  on(event, cb) {
    (this.events[event] || (this.events[event] = [])).push(cb);

    return {
      off() {
        this.events[event] && this.events[event].splice(this.events[event].indexOf(cb) >>> 0, 1);
      },
    };
  }

  /**
   * Set the routes config.
   *
   * @param {array} routes An array of routes.
   */
  setRoutes(routes) {
    this.routes = routes;
  }
}

export default Router;
