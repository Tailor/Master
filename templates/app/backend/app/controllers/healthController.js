// HealthController — the tiny JSON endpoint the welcome page and `master dev` use.
// Readiness/liveness for load balancers live at /health/live, /health/ready and
// /health/report (master.useHealthChecks in server.js).
export default class HealthController {
  static allowAnonymous = true;

  constructor(requestObject) {
    this.requestObject = requestObject;
  }

  async index() {
    this.ok({
      ok: true,
      service: 'mastercontroller',
      time: new Date().toISOString(),
      environment: this.environment ? this.environment.name : undefined,
      docs: '/docs',
      readiness: '/health/ready',
    });
  }
}
