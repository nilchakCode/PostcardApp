"""Monitoring and logging middleware for security events."""

import time
import logging
import os
from pathlib import Path
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent.parent.parent / 'logs'
logs_dir.mkdir(exist_ok=True)
log_file = logs_dir / 'security.log'

# Configure logging
handlers = [logging.StreamHandler()]

# Try to add file handler, but don't fail if we can't
try:
    handlers.append(logging.FileHandler(str(log_file)))
except Exception as e:
    print(f"Warning: Could not create log file: {e}")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=handlers
)

logger = logging.getLogger('security')


class SecurityMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor and log security-related events."""

    def __init__(self, app):
        super().__init__(app)
        # Track failed authentication attempts
        self.failed_auth_attempts: Dict[str, list] = defaultdict(list)
        # Track request rates per IP
        self.request_counts: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        try:
            # Record request start time
            start_time = time.time()

            # Get client IP
            client_ip = request.client.host if request.client else "unknown"

            # Track request rate
            self._track_request_rate(client_ip)

            # Process request
            response: Response = await call_next(request)

            # Calculate request duration
            duration = time.time() - start_time

            # Log request
            self._log_request(request, response, duration, client_ip)

            # Monitor for suspicious activity
            self._check_suspicious_activity(request, response, client_ip)

            return response
        except Exception as e:
            # If monitoring fails, log error but don't break the request
            logger.error(f"Monitoring middleware error: {e}")
            # Still process the request
            return await call_next(request)

    def _track_request_rate(self, client_ip: str):
        """Track request rate per IP address."""
        now = datetime.now()
        # Remove requests older than 1 minute
        cutoff = now - timedelta(minutes=1)
        self.request_counts[client_ip] = [
            timestamp for timestamp in self.request_counts[client_ip]
            if timestamp > cutoff
        ]
        # Add current request
        self.request_counts[client_ip].append(now)

        # Check if rate limit exceeded
        if len(self.request_counts[client_ip]) > 100:  # 100 requests per minute
            logger.warning(f"High request rate detected from IP: {client_ip}, "
                         f"count: {len(self.request_counts[client_ip])}")

    def _log_request(
        self,
        request: Request,
        response: Response,
        duration: float,
        client_ip: str
    ):
        """Log all requests with security-relevant information."""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'method': request.method,
            'path': request.url.path,
            'status_code': response.status_code,
            'duration': f"{duration:.3f}s",
            'client_ip': client_ip,
            'user_agent': request.headers.get('user-agent', 'unknown'),
        }

        # Add user ID if authenticated
        if hasattr(request.state, 'user'):
            log_data['user_id'] = getattr(request.state.user, 'id', 'unknown')

        # Log level based on status code
        if response.status_code >= 500:
            logger.error(f"Server error: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Client error: {log_data}")
        elif response.status_code >= 300:
            logger.info(f"Redirect: {log_data}")
        else:
            logger.debug(f"Success: {log_data}")

    def _check_suspicious_activity(
        self,
        request: Request,
        response: Response,
        client_ip: str
    ):
        """Check for suspicious activity patterns."""

        # Monitor failed authentication attempts
        if request.url.path in ['/api/auth/login', '/api/auth/signup']:
            if response.status_code in [401, 403]:
                now = datetime.now()
                cutoff = now - timedelta(minutes=15)

                # Track failed attempts
                self.failed_auth_attempts[client_ip] = [
                    timestamp for timestamp in self.failed_auth_attempts[client_ip]
                    if timestamp > cutoff
                ]
                self.failed_auth_attempts[client_ip].append(now)

                # Alert on multiple failures
                if len(self.failed_auth_attempts[client_ip]) >= 5:
                    logger.warning(
                        f"Multiple failed authentication attempts from IP: {client_ip}, "
                        f"count: {len(self.failed_auth_attempts[client_ip])} "
                        f"(last 15 minutes)"
                    )

        # Monitor unusual paths (potential scanning/probing)
        suspicious_paths = [
            '/admin', '/wp-admin', '/.env', '/.git', '/config',
            '/backup', '/phpMyAdmin', '/.aws', '/api/v1/admin'
        ]
        if any(suspicious in request.url.path.lower() for suspicious in suspicious_paths):
            logger.warning(
                f"Suspicious path access from IP: {client_ip}, "
                f"path: {request.url.path}"
            )

        # Monitor unusual user agents
        user_agent = request.headers.get('user-agent', '').lower()
        suspicious_agents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'burp']
        if any(agent in user_agent for agent in suspicious_agents):
            logger.warning(
                f"Suspicious user agent from IP: {client_ip}, "
                f"agent: {user_agent}"
            )

        # Monitor for SQL injection patterns in query parameters
        query_string = str(request.url.query).lower()
        sql_patterns = ["' or '1'='1", 'union select', 'drop table', 'exec(', '--']
        if any(pattern in query_string for pattern in sql_patterns):
            logger.warning(
                f"Potential SQL injection attempt from IP: {client_ip}, "
                f"query: {request.url.query}"
            )


def log_security_event(event_type: str, details: dict, severity: str = "INFO"):
    """
    Log a security event.

    Args:
        event_type: Type of security event (e.g., "LOGIN_FAILURE", "UNAUTHORIZED_ACCESS")
        details: Dictionary of event details
        severity: Log severity level (INFO, WARNING, ERROR, CRITICAL)
    """
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        **details
    }

    if severity == "CRITICAL":
        logger.critical(f"Security event: {log_data}")
    elif severity == "ERROR":
        logger.error(f"Security event: {log_data}")
    elif severity == "WARNING":
        logger.warning(f"Security event: {log_data}")
    else:
        logger.info(f"Security event: {log_data}")
