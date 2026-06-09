// HealthController — a tiny JSON endpoint proving the API is alive.
export default class HealthController {
  constructor(requestObject) {
    this.requestObject = requestObject;
  }

  async index() {
    this.returnJson({
      ok: true,
      service: 'mastercontroller',
      time: new Date().toISOString(),
    });
  }
}
