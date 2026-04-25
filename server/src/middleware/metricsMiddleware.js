import responseTime from 'response-time';
import { httpRequestDurationMicroseconds, httpRequestsTotal } from '../services/metricsProvider.js';

export const metricsMiddleware = responseTime((req, res, time) => {
  if (req?.route?.path) {
    const route = req.baseUrl + req.route.path;
    const method = req.method;
    const status = res.statusCode;

    // Record request count
    httpRequestsTotal.labels(method, route, status).inc();

    // Record request duration (convert ms to seconds)
    httpRequestDurationMicroseconds.labels(method, route, status).observe(time / 1000);
  }
});
