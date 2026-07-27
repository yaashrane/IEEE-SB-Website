(function adminCmsClient() {
  const tokenKey = 'ieee_admin_token';
  const userKey = 'ieee_admin_user';
  const baseKey = 'ieee_api_base';
  const localHostnames = ['localhost', '127.0.0.1', ''];
  const defaultBase = localHostnames.includes(window.location.hostname)
    ? 'http://localhost:5000/api/v1'
    : `${window.location.origin}/api/v1`;

  const state = {
    token: localStorage.getItem(tokenKey),
    apiBase: window.IEEE_API_BASE || localStorage.getItem(baseKey) || defaultBase,
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    collections: {},
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const toast = (message, type = 'info') =>
    window.showToast ? window.showToast(message, type) : console.log(`${type}: ${message}`);

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const initials = (name = 'Admin') =>
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  async function api(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const isFormData = options.body instanceof FormData;

    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (state.token) headers.Authorization = `Bearer ${state.token}`;

    let response;
    try {
      response = await fetch(`${state.apiBase}${path}`, {
        credentials: 'include',
        ...options,
        headers,
      });
    } catch {
      throw new Error(`Backend API is not reachable at ${state.apiBase}. Start the backend server first.`);
    }

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = { message: response.statusText };
    }

    if (!response.ok) {
      if (response.status === 401) showLogin();
      throw new Error(payload.message || 'Request failed');
    }

    return payload;
  }

  function createLogin() {
    if ($('#admin-auth-modal')) return;

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="admin-auth" id="admin-auth-modal" hidden>
        <form class="admin-auth__card animate-pop" id="admin-login-form">
          <div class="admin-auth__brand">IEEE CMS Portal</div>
          <h1>Sign in</h1>
          <p>Use your CMS credentials to manage members, events, blogs, gallery, announcements, and contact messages.</p>
          <label class="form-group">
            <span class="form-label">Email</span>
            <input class="input" name="email" type="email" autocomplete="email" required />
          </label>
          <label class="form-group">
            <span class="form-label">Password</span>
            <input class="input" name="password" type="password" autocomplete="current-password" required />
          </label>
          <label class="cms-check">
            <input type="checkbox" name="remember" checked />
            <span>Remember login</span>
          </label>
          <button class="btn btn--primary" type="submit">Sign In</button>
          <div class="admin-auth__status" id="admin-auth-status"></div>
        </form>
      </div>
      `
    );

    $('#admin-login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = $('#admin-auth-status');
      const data = Object.fromEntries(new FormData(form));
      status.textContent = 'Signing in...';

      try {
        const payload = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            remember: data.remember === 'on',
          }),
        });
        state.token = payload.token;
        state.user = payload.user;
        localStorage.setItem(tokenKey, state.token);
        localStorage.setItem(userKey, JSON.stringify(state.user));
        hideLogin();
        syncUserUi();
        await loadAll();
        toast('Signed in successfully', 'success');
      } catch (error) {
        status.textContent = error.message;
        toast(error.message, 'error');
      }
    });
  }

  function showLogin() {
    createLogin();
    $('#admin-auth-modal').hidden = false;
  }

  function hideLogin() {
    const modal = $('#admin-auth-modal');
    if (modal) modal.hidden = true;
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Local logout still clears the browser session.
    }
    state.token = null;
    state.user = null;
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    showLogin();
    toast('Logged out successfully', 'info');
  }

  window.adminCmsLogout = logout;

  function syncUserUi() {
    if (!state.user) return;
    const name = state.user.name || 'Admin';
    const role = state.user.role || 'admin';
    const userName = $('.admin-sidebar__user-name');
    const userRole = $('.admin-sidebar__user-role');
    if (userName) userName.textContent = name;
    if (userRole) userRole.textContent = `${role.replace('-', ' ')} access`;
    $$('.avatar').forEach((avatar) => {
      if (avatar.textContent.trim().length <= 3) avatar.textContent = initials(name);
    });
  }

  function setLoading(sectionId, message) {
    const section = $(`#section-${sectionId}`);
    if (!section) return;
    let status = $('.cms-status', section);
    if (!status) {
      status = document.createElement('div');
      status.className = 'cms-status';
      section.prepend(status);
    }
    status.textContent = message;
  }

  function clearLoading(sectionId) {
    const status = $(`#section-${sectionId} .cms-status`);
    if (status) status.remove();
  }

  function badge(value, type = 'default') {
    return `<span class="badge badge--${type}">${escapeHtml(value || '-')}</span>`;
  }

  function fileUrl(url) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${state.apiBase.replace('/api/v1', '')}${url}`;
  }

  function formDataFrom(form) {
    const data = new FormData(form);
    for (const [key, value] of Array.from(data.entries())) {
      if (value === '') data.delete(key);
      if (value instanceof File && !value.name) data.delete(key);
    }
    $$('input[type="checkbox"]', form).forEach((input) => {
      data.set(input.name, input.checked ? 'true' : 'false');
    });
    return data;
  }

  async function submitForm(form, path, method, onDone) {
    const button = $('button[type="submit"]', form);
    const originalText = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = 'Saving...';
    }

    try {
      await api(path, {
        method,
        body: formDataFrom(form),
      });
      form.reset();
      delete form.dataset.editId;
      await onDone();
      toast('Saved successfully', 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function fillForm(form, record) {
    Object.entries(record).forEach(([key, value]) => {
      const input = form.elements[key];
      if (!input) return;
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else if (input.type === 'date' && value) input.value = new Date(value).toISOString().slice(0, 10);
      else if (Array.isArray(value)) input.value = value.join(', ');
      else if (value !== null && value !== undefined && typeof value !== 'object') input.value = value;
    });
    form.dataset.editId = record._id;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function removeRecord(path, reload, label = 'record') {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await api(path, { method: 'DELETE' });
      await reload();
      toast('Deleted successfully', 'success');
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  function installCmsPanels() {
    installContactSection();
    installMembersPanel();
    installEventsPanel();
    installBlogsPanel();
    installGalleryPanel();
    installAnnouncementsPanel();
    installContactPanel();
    installLogoutButton();
  }

  function installLogoutButton() {
    const signOutButton = Array.from(document.querySelectorAll('button')).find((button) =>
      button.textContent.toLowerCase().includes('sign out')
    );
    if (signOutButton) {
      signOutButton.onclick = null;
      signOutButton.addEventListener('click', logout);
    }
  }

  function installContactSection() {
    if ($('#section-contacts')) return;
    const nav = $('.admin-sidebar__nav .admin-nav-section:nth-of-type(2)');
    if (nav) {
      nav.insertAdjacentHTML(
        'beforeend',
        `<button class="admin-nav-link" onclick="showSection('contacts',this)">
          <span class="admin-nav-link__icon">@</span>Contacts
          <span class="admin-nav-link__badge" data-badge="contacts">0</span>
        </button>`
      );
    }
    $('.admin-content').insertAdjacentHTML(
      'beforeend',
      `<div class="admin-section" id="section-contacts">
        <div style="margin-bottom:2rem"><h2 style="font-size:1.5rem;font-weight:700;margin-bottom:.25rem">Contact Messages</h2><p style="color:var(--text-muted);font-size:.875rem">Review website enquiries and mark them as read</p></div>
        <div class="admin-table-wrap"><div class="admin-table-header"><span class="admin-table-title">Messages</span></div><div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Received</th><th>Status</th><th>Actions</th></tr></thead><tbody id="contacts-tbody"></tbody></table></div></div>
      </div>`
    );
  }

  function installMembersPanel() {
    const section = $('#section-members');
    if (!section || $('.cms-panel--members', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<form class="cms-panel cms-panel--members admin-form" id="member-form">
        <div class="cms-panel__title">Member Editor</div>
        <div class="cms-grid cms-grid--4">
          <label class="form-group"><span class="form-label">Name</span><input class="input" name="name" required /></label>
          <label class="form-group"><span class="form-label">Email</span><input class="input" name="email" type="email" /></label>
          <label class="form-group">
            <span class="form-label">Designation</span>
            <select class="input" name="designation" required>
              <option value="Chairperson">Chairperson</option>
              <option value="Vice Chairperson">Vice Chairperson</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Team Member" selected>Team Member</option>
              <option value="Mentor / Faculty Advisor">Mentor / Faculty Advisor</option>
            </select>
          </label>
          <label class="form-group"><span class="form-label">Department</span><input class="input" name="department" required /></label>
          <label class="form-group"><span class="form-label">Chapter</span><input class="input" name="chapter" /></label>
          <label class="form-group"><span class="form-label">LinkedIn</span><input class="input" name="linkedin" type="url" /></label>
          <label class="form-group"><span class="form-label">GitHub</span><input class="input" name="github" type="url" /></label>
          <label class="form-group"><span class="form-label">Priority</span><input class="input" name="priority" type="number" value="100" /></label>
          <label class="form-group"><span class="form-label">Status</span><select class="input" name="status"><option value="active">Active</option><option value="inactive">Inactive</option><option value="alumni">Alumni</option></select></label>
          <label class="form-group"><span class="form-label">Photo</span><input class="input" name="photo" type="file" accept="image/*" /></label>
        </div>
        <label class="form-group"><span class="form-label">Bio</span><textarea class="input" name="bio" rows="3"></textarea></label>
        <div class="cms-actions"><button class="btn btn--primary btn--sm" type="submit">Save Member</button><button class="btn btn--ghost btn--sm" type="reset">Clear</button></div>
      </form>`
    );

    $('#member-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const isEdit = Boolean(form.dataset.editId);
      submitForm(form, isEdit ? `/members/${form.dataset.editId}` : '/members', isEdit ? 'PUT' : 'POST', loadMembers);
    });
  }

  function installEventsPanel() {
    const section = $('#section-events');
    if (!section || $('.cms-panel--events', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<form class="cms-panel cms-panel--events admin-form" id="event-form">
        <div class="cms-panel__title">Event Editor</div>
        <div class="cms-grid cms-grid--4">
          <label class="form-group"><span class="form-label">Title</span><input class="input" name="title" required /></label>
          <label class="form-group"><span class="form-label">Category</span><input class="input" name="category" required /></label>
          <label class="form-group"><span class="form-label">Location</span><input class="input" name="location" required /></label>
          <label class="form-group"><span class="form-label">Date</span><input class="input" name="date" type="date" required /></label>
          <label class="form-group"><span class="form-label">Time</span><input class="input" name="time" required /></label>
          <label class="form-group"><span class="form-label">Capacity</span><input class="input" name="capacity" type="number" min="0" /></label>
          <label class="form-group"><span class="form-label">Registration Link</span><input class="input" name="registrationLink" type="url" /></label>
          <label class="form-group"><span class="form-label">Status</span><select class="input" name="status"><option value="published">Published</option><option value="draft">Draft</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label>
          <label class="form-group"><span class="form-label">Banner</span><input class="input" name="banner" type="file" accept="image/*" /></label>
          <label class="cms-check"><input type="checkbox" name="isFeatured" /><span>Featured</span></label>
        </div>
        <label class="form-group"><span class="form-label">Short Description</span><input class="input" name="shortDescription" /></label>
        <label class="form-group"><span class="form-label">Description</span><textarea class="input" name="description" rows="4" required></textarea></label>
        <label class="form-group"><span class="form-label">Tags</span><input class="input" name="tags" placeholder="workshop, ieee, ai" /></label>
        <div class="cms-actions"><button class="btn btn--primary btn--sm" type="submit">Save Event</button><button class="btn btn--ghost btn--sm" type="reset">Clear</button></div>
      </form>`
    );

    $('#event-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const isEdit = Boolean(form.dataset.editId);
      submitForm(form, isEdit ? `/events/${form.dataset.editId}` : '/events', isEdit ? 'PUT' : 'POST', loadEvents);
    });
  }

  function installBlogsPanel() {
    const section = $('#section-blog');
    if (!section || $('.cms-panel--blogs', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<form class="cms-panel cms-panel--blogs admin-form" id="blog-form">
        <div class="cms-panel__title">Blog Editor</div>
        <div class="cms-grid cms-grid--4">
          <label class="form-group"><span class="form-label">Title</span><input class="input" name="title" required /></label>
          <label class="form-group"><span class="form-label">Category</span><input class="input" name="category" required /></label>
          <label class="form-group"><span class="form-label">Author</span><input class="input" name="authorName" /></label>
          <label class="form-group"><span class="form-label">Status</span><select class="input" name="status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label class="form-group"><span class="form-label">Cover Image</span><input class="input" name="coverImage" type="file" accept="image/*" /></label>
          <label class="cms-check"><input type="checkbox" name="isFeatured" /><span>Featured</span></label>
        </div>
        <label class="form-group"><span class="form-label">Excerpt</span><textarea class="input" name="excerpt" rows="2" required></textarea></label>
        <label class="form-group"><span class="form-label">Content</span><textarea class="input" name="content" rows="6" required></textarea></label>
        <label class="form-group"><span class="form-label">Tags</span><input class="input" name="tags" placeholder="ai, robotics, ieee" /></label>
        <div class="cms-actions"><button class="btn btn--primary btn--sm" type="submit">Save Blog</button><button class="btn btn--ghost btn--sm" type="reset">Clear</button></div>
      </form>`
    );

    $('#blog-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const isEdit = Boolean(form.dataset.editId);
      submitForm(form, isEdit ? `/blogs/${form.dataset.editId}` : '/blogs', isEdit ? 'PUT' : 'POST', loadBlogs);
    });
  }

  function installGalleryPanel() {
    const section = $('#section-gallery');
    if (!section || $('.cms-panel--gallery', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<form class="cms-panel cms-panel--gallery admin-form" id="gallery-form">
        <div class="cms-panel__title">Gallery Upload</div>
        <div class="cms-grid cms-grid--4">
          <label class="form-group"><span class="form-label">Title</span><input class="input" name="title" required /></label>
          <label class="form-group"><span class="form-label">Category</span><input class="input" name="category" required /></label>
          <label class="form-group"><span class="form-label">Album</span><input class="input" name="album" /></label>
          <label class="form-group"><span class="form-label">Images</span><input class="input" name="images" type="file" accept="image/*" multiple required /></label>
          <label class="cms-check"><input type="checkbox" name="isFeatured" /><span>Featured</span></label>
        </div>
        <label class="form-group"><span class="form-label">Description</span><textarea class="input" name="description" rows="3"></textarea></label>
        <label class="form-group"><span class="form-label">Tags</span><input class="input" name="tags" /></label>
        <div class="cms-actions"><button class="btn btn--primary btn--sm" type="submit">Upload Images</button><button class="btn btn--ghost btn--sm" type="reset">Clear</button></div>
      </form>`
    );

    $('#gallery-form').addEventListener('submit', (event) => {
      event.preventDefault();
      submitForm(event.currentTarget, '/gallery', 'POST', loadGallery);
    });
  }

  function installAnnouncementsPanel() {
    const section = $('#section-announcements');
    if (!section || $('.cms-panel--announcements', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<form class="cms-panel cms-panel--announcements admin-form" id="announcement-form">
        <div class="cms-panel__title">Announcement Editor</div>
        <div class="cms-grid cms-grid--4">
          <label class="form-group"><span class="form-label">Title</span><input class="input" name="title" required /></label>
          <label class="form-group"><span class="form-label">Type</span><select class="input" name="type"><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="urgent">Urgent</option></select></label>
          <label class="form-group"><span class="form-label">Status</span><select class="input" name="status"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
          <label class="form-group"><span class="form-label">Expires</span><input class="input" name="expiresAt" type="date" /></label>
          <label class="cms-check"><input type="checkbox" name="isPinned" /><span>Pinned</span></label>
          <label class="cms-check"><input type="checkbox" name="showOnHomepage" checked /><span>Homepage</span></label>
        </div>
        <label class="form-group"><span class="form-label">Message</span><textarea class="input" name="message" rows="4" required></textarea></label>
        <div class="cms-actions"><button class="btn btn--primary btn--sm" type="submit">Save Announcement</button><button class="btn btn--ghost btn--sm" type="reset">Clear</button></div>
      </form>
      <div class="cms-list" id="announcements-list"></div>`
    );

    $('#announcement-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const isEdit = Boolean(form.dataset.editId);
      submitForm(
        form,
        isEdit ? `/announcements/${form.dataset.editId}` : '/announcements',
        isEdit ? 'PUT' : 'POST',
        loadAnnouncements
      );
    });
  }

  function installContactPanel() {
    const section = $('#section-contacts');
    if (!section || $('.cms-panel--contacts', section)) return;
    section.insertAdjacentHTML(
      'afterbegin',
      `<div class="cms-panel cms-panel--contacts"><div class="cms-panel__title">Inbox Tools</div><div class="cms-actions"><button class="btn btn--ghost btn--sm" data-contact-filter="all">All</button><button class="btn btn--ghost btn--sm" data-contact-filter="unread">Unread</button></div></div>`
    );
    $$('[data-contact-filter]', section).forEach((button) => {
      button.addEventListener('click', () => loadContacts(button.dataset.contactFilter));
    });
  }

  async function loadDashboard() {
    setLoading('dashboard', 'Loading dashboard data...');
    try {
      const data = await api('/dashboard/overview');
      const stats = data.stats || {};
      const cards = $$('#section-dashboard .admin-stat');
      [
        stats.totalMembers || 0,
        stats.upcomingEvents || 0,
        stats.publishedBlogs || 0,
        stats.galleryImages || 0,
      ].forEach((value, index) => {
        const count = $('[data-count]', cards[index] || document);
        if (count) {
          count.dataset.count = value;
          count.textContent = value.toLocaleString();
        }
      });
      const activityFeed = $('#section-dashboard .activity-feed');
      if (activityFeed) {
        activityFeed.innerHTML = (data.recent?.activity || [])
          .map(
            (item) =>
              `<div class="activity-item"><div class="activity-item__icon">${escapeHtml(item.type.slice(0, 1).toUpperCase())}</div><div class="activity-item__text"><strong>${escapeHtml(item.label)}</strong> ${escapeHtml(item.description)}</div><div class="activity-item__time">${formatDate(item.createdAt)}</div></div>`
          )
          .join('');
      }
      const contactsBadge = $('[data-badge="contacts"]');
      if (contactsBadge) contactsBadge.textContent = stats.unreadContacts || 0;
    } finally {
      clearLoading('dashboard');
    }
  }

  async function loadMembers() {
    setLoading('members', 'Loading members...');
    try {
      const data = await api('/members?limit=50&sort=priority,name');
      state.collections.members = data.members || [];
      const members = state.collections.members;

      // Sync counters dynamically
      const totalCount = members.length;
      const activeCount = members.filter(m => m.status === 'active').length;
      const pendingCount = members.filter(m => m.status === 'pending' || m.status === 'inactive').length;

      const memberStatCards = $$('#section-members .admin-stat');
      if (memberStatCards.length >= 3) {
        if ($('[data-count]', memberStatCards[0])) $('[data-count]', memberStatCards[0]).textContent = totalCount;
        if ($('[data-count]', memberStatCards[1])) $('[data-count]', memberStatCards[1]).textContent = activeCount;
        if ($('[data-count]', memberStatCards[2])) $('[data-count]', memberStatCards[2]).textContent = pendingCount;
      }

      const tbody = $('#section-members tbody') || $('#members-tbody');
      if (tbody) {
        tbody.innerHTML = members
          .map(
            (member) => `
            <tr>
              <td><div style="display:flex;align-items:center;gap:.75rem"><div class="avatar" style="width:32px;height:32px;font-size:12px">${initials(member.name)}</div><div><div style="font-weight:600;color:var(--text-primary)">${escapeHtml(member.name)}</div><div style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(member.email || '')}</div></div></div></td>
              <td>${escapeHtml(member.department || '-')}</td>
              <td>${badge(member.designation, member.designation?.toLowerCase().includes('chair') ? 'accent' : 'default')}</td>
              <td class="font-mono">${escapeHtml(member.priority || 100)}</td>
              <td class="font-mono" style="font-size:.8125rem">${formatDate(member.joinedAt || member.createdAt)}</td>
              <td>${badge(member.status, member.status === 'active' ? 'success' : 'warning')}</td>
              <td><div class="admin-table__actions-cell"><button class="admin-table__action-btn" data-edit-member="${member._id}">Edit</button><button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-member="${member._id}">Del</button></div></td>
            </tr>`
          )
          .join('');
      }
    } finally {
      clearLoading('members');
    }
  }

  async function loadEvents() {
    setLoading('events', 'Loading events...');
    try {
      const data = await api('/events/admin?limit=50&sort=-createdAt');
      state.collections.events = data.events || [];
      const tbody = $('#section-events tbody');
      if (tbody) {
        tbody.innerHTML = state.collections.events
          .map(
            (event) => `
            <tr>
              <td><div style="font-weight:600;color:var(--text-primary)">${escapeHtml(event.title)}</div><div style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(event.shortDescription || event.location || '')}</div></td>
              <td>${escapeHtml(event.category || '-')}</td>
              <td class="font-mono" style="font-size:.8125rem">${formatDate(event.date)}</td>
              <td class="font-mono">${escapeHtml(event.registeredCount || 0)}</td>
              <td class="font-mono">${escapeHtml(event.capacity || 0)}</td>
              <td>${badge(event.status, event.status === 'published' ? 'success' : 'warning')}</td>
              <td><div class="admin-table__actions-cell"><button class="admin-table__action-btn" data-edit-event="${event._id}">Edit</button><button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-event="${event._id}">Del</button></div></td>
            </tr>`
          )
          .join('');
      }
    } finally {
      clearLoading('events');
    }
  }

  async function loadBlogs() {
    setLoading('blog', 'Loading blog posts...');
    try {
      const data = await api('/blogs/admin?limit=50&sort=-createdAt');
      state.collections.blogs = data.blogs || [];
      const tbody = $('#section-blog tbody');
      if (tbody) {
        tbody.innerHTML = state.collections.blogs
          .map(
            (blog) => `
            <tr>
              <td style="color:var(--text-primary);font-weight:500">${escapeHtml(blog.title)}</td>
              <td>${escapeHtml(blog.authorName || blog.author?.name || '-')}</td>
              <td>${badge(blog.category, 'default')}</td>
              <td class="font-mono" style="font-size:.8125rem">${formatDate(blog.publishedAt)}</td>
              <td class="font-mono">${escapeHtml(blog.views || 0)}</td>
              <td>${badge(blog.status, blog.status === 'published' ? 'success' : 'warning')}</td>
              <td><div class="admin-table__actions-cell"><button class="admin-table__action-btn" data-edit-blog="${blog._id}">Edit</button><button class="admin-table__action-btn" data-publish-blog="${blog._id}">Pub</button><button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-blog="${blog._id}">Del</button></div></td>
            </tr>`
          )
          .join('');
      }
    } finally {
      clearLoading('blog');
    }
  }

  async function loadGallery() {
    setLoading('gallery', 'Loading gallery...');
    try {
      const data = await api('/gallery?limit=60&sort=-createdAt');
      state.collections.gallery = data.gallery || [];
      const grid = $('#admin-gallery-grid');
      if (grid) {
        grid.innerHTML = state.collections.gallery
          .map(
            (item) => `
            <div class="cms-gallery-item">
              <img src="${escapeHtml(fileUrl(item.image?.url))}" alt="${escapeHtml(item.image?.alt || item.title)}" loading="lazy" />
              <div class="cms-gallery-item__actions">
                <button class="admin-table__action-btn" data-edit-gallery="${item._id}">Edit</button>
                <button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-gallery="${item._id}">Del</button>
              </div>
              <div class="cms-gallery-item__label">${escapeHtml(item.title)}</div>
            </div>`
          )
          .join('');
      }
    } finally {
      clearLoading('gallery');
    }
  }

  async function loadAnnouncements() {
    setLoading('announcements', 'Loading announcements...');
    try {
      const data = await api('/announcements/admin?limit=50&sort=-createdAt');
      state.collections.announcements = data.announcements || [];
      const list = $('#announcements-list');
      if (list) {
        list.innerHTML = state.collections.announcements
          .map(
            (item) => `
            <div class="cms-list__item">
              <div><div class="cms-list__title">${escapeHtml(item.title)}</div><div class="cms-list__meta">${escapeHtml(item.message)}</div><div class="cms-list__meta">${formatDate(item.createdAt)}</div></div>
              <div class="cms-actions">${badge(item.status, item.status === 'published' ? 'success' : 'warning')}${item.isPinned ? badge('Pinned', 'accent') : ''}<button class="admin-table__action-btn" data-edit-announcement="${item._id}">Edit</button><button class="admin-table__action-btn" data-pin-announcement="${item._id}">Pin</button><button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-announcement="${item._id}">Del</button></div>
            </div>`
          )
          .join('');
      }
    } finally {
      clearLoading('announcements');
    }
  }

  async function loadContacts(filter = 'all') {
    setLoading('contacts', 'Loading messages...');
    try {
      const readFilter = filter === 'unread' ? '&read=false' : '';
      const data = await api(`/contact?limit=50&sort=-createdAt${readFilter}`);
      state.collections.contacts = data.contacts || [];
      const tbody = $('#contacts-tbody');
      if (tbody) {
        tbody.innerHTML = state.collections.contacts
          .map(
            (contact) => `
            <tr>
              <td>${escapeHtml(contact.name)}</td>
              <td>${escapeHtml(contact.email)}</td>
              <td>${escapeHtml(contact.subject)}</td>
              <td class="font-mono" style="font-size:.8125rem">${formatDate(contact.createdAt)}</td>
              <td>${badge(contact.isRead ? 'Read' : 'Unread', contact.isRead ? 'default' : 'warning')}</td>
              <td><div class="admin-table__actions-cell"><button class="admin-table__action-btn" data-read-contact="${contact._id}">Read</button><button class="admin-table__action-btn admin-table__action-btn--danger" data-delete-contact="${contact._id}">Del</button></div></td>
            </tr>`
          )
          .join('');
      }
    } finally {
      clearLoading('contacts');
    }
  }

  function installActions() {
    document.addEventListener('click', async (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const action = Object.entries(target.dataset)[0];
      if (!action) return;

      const [name, id] = action;
      const maps = {
        editMember: ['members', '#member-form'],
        editEvent: ['events', '#event-form'],
        editBlog: ['blogs', '#blog-form'],
        editAnnouncement: ['announcements', '#announcement-form'],
      };

      if (maps[name]) {
        const [collection, formSelector] = maps[name];
        const record = state.collections[collection]?.find((item) => item._id === id);
        if (record) fillForm($(formSelector), record);
      }

      if (name === 'deleteMember') removeRecord(`/members/${id}`, loadMembers, 'member');
      if (name === 'deleteEvent') removeRecord(`/events/${id}`, loadEvents, 'event');
      if (name === 'deleteBlog') removeRecord(`/blogs/${id}`, loadBlogs, 'blog post');
      if (name === 'deleteGallery') removeRecord(`/gallery/${id}`, loadGallery, 'gallery image');
      if (name === 'deleteAnnouncement') removeRecord(`/announcements/${id}`, loadAnnouncements, 'announcement');
      if (name === 'deleteContact') removeRecord(`/contact/${id}`, loadContacts, 'message');

      if (name === 'publishBlog') {
        await api(`/blogs/${id}/publish`, { method: 'PATCH' });
        await loadBlogs();
        toast('Blog published', 'success');
      }

      if (name === 'pinAnnouncement') {
        await api(`/announcements/${id}/pin`, { method: 'PATCH' });
        await loadAnnouncements();
        toast('Pin status updated', 'success');
      }

      if (name === 'readContact') {
        await api(`/contact/${id}/read`, { method: 'PATCH', body: JSON.stringify({ responded: false }) });
        await loadContacts();
        toast('Message marked as read', 'success');
      }
    });
  }

  async function loadAll() {
    await Promise.allSettled([
      loadDashboard(),
      loadMembers(),
      loadEvents(),
      loadBlogs(),
      loadGallery(),
      loadAnnouncements(),
      loadContacts(),
    ]);
  }

  async function boot() {
    createLogin();
    installCmsPanels();
    installActions();
    syncUserUi();

    if (!state.token) {
      showLogin();
      return;
    }

    try {
      const payload = await api('/auth/validate');
      state.user = payload.user;
      localStorage.setItem(userKey, JSON.stringify(state.user));
      syncUserUi();
      await loadAll();
    } catch (error) {
      toast(error.message, 'error');
      showLogin();
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
