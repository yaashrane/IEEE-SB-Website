(function configureSiteApi() {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  const savedApi = localStorage.getItem('IEEE_CUSTOM_API_BASE');

  window.IEEE_API_BASE = savedApi || window.CUSTOM_API_BASE || (isLocal
    ? 'http://localhost:5000/api/v1'
    : 'https://ieee-sb-backend.onrender.com/api/v1');
})();
