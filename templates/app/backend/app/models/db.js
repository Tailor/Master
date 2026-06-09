// Shared database handle. Import this in controllers:
//   import db from '../models/db.js';
//   const users = await db.User.toList();
import AppContext from './AppContext.js';

const db = new AppContext();

export default db;
