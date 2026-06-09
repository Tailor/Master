// AppContext — your MasterRecord database context (ESM).
// Register every entity with this.dbset(Entity). The CLI keeps this in sync when
// you run `master generate model <Name>`.
import context from 'masterrecord/context';
import User from './User.js';

class AppContext extends context {
  constructor() {
    super();

    // Loads config/environments/env.<NODE_ENV>.json, keyed by "AppContext".
    this.env('config/environments');

    this.dbset(User);
  }
}

export default AppContext;
