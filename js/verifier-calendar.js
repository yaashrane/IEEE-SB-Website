/* ============================================================
   IEEE SB Webmaster Edition — Event Calendar & Theme Customizer
   MMIT IEEE Student Branch (STB60226400)
   ============================================================ */

'use strict';

// ─── 1. CALENDAR EXPORT HELPERS ──────────────────────────────
window.addToGoogleCalendar = function(title, startDateStr, endDateStr, location, details) {
  const start = new Date(startDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const end = new Date(endDateStr || startDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details || 'MMIT IEEE Student Branch Event')}&location=${encodeURIComponent(location || 'MMIT Campus, Pune')}`;
  window.open(url, '_blank');
};

window.downloadICSFile = function(title, startDateStr, endDateStr, location, details) {
  const start = new Date(startDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const end = new Date(endDateStr || startDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MMIT IEEE Student Branch//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${details || 'MMIT IEEE Student Branch Event'}
LOCATION:${location || 'MMIT Campus, Pune'}
DTSTART:${start}
DTEND:${end}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_IEEE_Event.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.showToast) window.showToast('iCal (.ics) Event file downloaded! 📅', 'success');
};

// Toggle dropdowns for event card calendars
window.toggleCalendarDropdown = function(btnElement) {
  const dropdown = btnElement.parentElement.querySelector('.calendar-dropdown');
  if (!dropdown) return;
  document.querySelectorAll('.calendar-dropdown').forEach(d => {
    if (d !== dropdown) d.classList.remove('active');
  });
  dropdown.classList.toggle('active');
};

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.calendar-btn-wrap')) {
    document.querySelectorAll('.calendar-dropdown').forEach(d => d.classList.remove('active'));
  }
});

// ─── 2. ACCENT COLOR THEME SWITCHER WIDGET ─────────────────────
function initAccentThemeWidget() {
  const widget = document.createElement('div');
  widget.id = 'accent-theme-widget';
  widget.innerHTML = `
    <button class="accent-theme-btn" onclick="toggleAccentPanel()" aria-label="Customize accent colors">🎨</button>
    <div class="accent-theme-panel" id="accent-theme-panel">
      <div class="accent-theme-title">Choose Accent Theme</div>
      <div class="accent-swatches">
        <button class="accent-swatch" style="background:#6366f1" onclick="setAccentTheme('#6366f1', '#8b5cf6', 'Indigo')" title="Indigo Cyber"></button>
        <button class="accent-swatch" style="background:#06b6d4" onclick="setAccentTheme('#06b6d4', '#3b82f6', 'Cyan')" title="Cyan Neon"></button>
        <button class="accent-swatch" style="background:#10b981" onclick="setAccentTheme('#10b981', '#06b6d4', 'Emerald')" title="Emerald Pulse"></button>
        <button class="accent-swatch" style="background:#f59e0b" onclick="setAccentTheme('#f59e0b', '#ef4444', 'Amber')" title="Sunset Amber"></button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
}

window.toggleAccentPanel = function() {
  const panel = document.getElementById('accent-theme-panel');
  if (panel) panel.classList.toggle('active');
};

window.setAccentTheme = function(primary, secondary, name) {
  document.documentElement.style.setProperty('--accent-indigo', primary);
  document.documentElement.style.setProperty('--accent-violet', secondary);
  if (window.showToast) window.showToast(`Theme accent updated to ${name}! ✨`, 'info');
  const panel = document.getElementById('accent-theme-panel');
  if (panel) panel.classList.remove('active');
};

document.addEventListener('DOMContentLoaded', () => {
  initAccentThemeWidget();
});
