(function configureSiteApi() {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  const CLOUD_API_BASE = 'https://ieee-sb-website.onrender.com/api/v1';

  // Clear stale cached legacy domains from user browser localStorage
  ['IEEE_CUSTOM_API_BASE', 'ieee_api_base'].forEach((key) => {
    const val = localStorage.getItem(key);
    if (val && val.includes('ieee-sb-backend')) {
      localStorage.removeItem(key);
    }
  });

  const savedApi = localStorage.getItem('IEEE_CUSTOM_API_BASE');

  window.IEEE_CLOUD_API_BASE = CLOUD_API_BASE;
  window.IEEE_API_BASE = savedApi || window.CUSTOM_API_BASE || (isLocal
    ? 'http://localhost:5000/api/v1'
    : CLOUD_API_BASE);
})();
