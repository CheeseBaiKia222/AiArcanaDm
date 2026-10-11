# Parcarna on Sites

Full Worker/D1 migration of the local Node/SQLite application. Real accounts start empty; no local database or credentials are uploaded.

D1 batches preserve transactions. Revision guards reject concurrent stale mutations with HTTP 409; refresh before retrying. Passwords use salted WebCrypto PBKDF2, and sessions use hashed random tokens and secure HttpOnly cookies.

The existing Node API integration suite runs against a D1-compatible SQLite adapter; hosted-runtime tests are separate.
