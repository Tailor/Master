// Master project configuration.
// Used by `master dev`, `master build`, and `master start`.
export default {
  // Whether this project has a Next.js frontend.
  frontend: true,

  // Port the MasterController API backend listens on.
  backendPort: 3001,

  // Port the Next.js frontend listens on.
  frontendPort: 3000,

  // Folder names (relative to this file).
  backendDir: 'backend',
  frontendDir: 'frontend',
};
