// Route table — loaded once at startup by master.startMVC('app').
// Map URL paths to "controller#action". Add routes with the CLI:
//   master generate controller <name> <action...>
//   master generate scaffold <name> <field:type...>
import master from 'mastercontroller';

const router = master.router.start();

// Health check — used by `master dev` and uptime probes.
router.route('/health', 'health#index', 'get');
