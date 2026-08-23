// Route table — loaded once at startup by master.startMVC('app').
// Map URL paths to "controller#action". Add routes with the CLI:
//   master generate controller <name> <action...>
//   master generate scaffold <name> <field:type...>
//
// Route options (ASP.NET-style): { authorize: true | 'Policy' | { roles }, allowAnonymous: true,
// outputCache: { duration: 60 }, apiVersion: '2.0', name: 'routeName' }.
// Typed params: '/items/:id(int)'. Groups: router.group('/api/v1', { authorize: true }, (g) => { ... }).
import master from 'mastercontroller';

const router = master.router.start();

// Health check — used by the welcome page and `master dev`.
router.route('/health', 'health#index', 'get', { allowAnonymous: true, name: 'health' });
