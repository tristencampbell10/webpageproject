/**
 * admin.js - Admin Dashboard JavaScript
 * Handles authentication, fetching contact submissions, calculating summary stats,
 * updating Chart.js visualizer, filtering & searching messages, and executing the Mark as Replied operation.
 */

let authToken = sessionStorage.getItem('admin_token') || null;
let allMessages = [];
let currentFilter = 'all';
let currentSearch = '';
let currentReason = 'all';
let reasonChartInstance = null;
let isLoadingMessages = false;

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('loginErrorAlert');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const refreshBtn = document.getElementById('adminRefreshBtn');
  const searchInput = document.getElementById('adminSearchInput');
  const searchClearBtn = document.getElementById('adminSearchClearBtn');
  const reasonFilter = document.getElementById('adminReasonFilter');
  const togglePasswordBtn = document.getElementById('togglePasswordVisibilityBtn');

  // Filter buttons (Segmented control: All / New / Replied)
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderMessages();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearch ? 'block' : 'none';
      }
      renderMessages();
    });
  }

  // Clear search button handler
  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      searchClearBtn.style.display = 'none';
      renderMessages();
      searchInput.focus();
    });
  }

  // Reason select handler
  if (reasonFilter) {
    reasonFilter.addEventListener('change', (e) => {
      currentReason = e.target.value;
      renderMessages();
    });
  }

  // Password visibility toggle handler
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const pwdInput = document.getElementById('adminPassword');
      if (pwdInput) {
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          togglePasswordBtn.textContent = '🙈';
        } else {
          pwdInput.type = 'password';
          togglePasswordBtn.textContent = '👁️';
        }
      }
    });
  }

  // Refresh button handler
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const icon = refreshBtn.querySelector('.refresh-icon');
      if (icon) icon.classList.add('spinning');
      await loadMessages();
      setTimeout(() => {
        if (icon) icon.classList.remove('spinning');
      }, 600);
    });
  }

  // Handle Login form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginError) loginError.style.display = 'none';

      const passwordInput = document.getElementById('adminPassword');
      const password = passwordInput?.value || '';

      if (!password) {
        if (loginError) {
          loginError.textContent = 'Please enter the admin password.';
          loginError.style.display = 'block';
        }
        return;
      }

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          authToken = data.token;
          sessionStorage.setItem('admin_token', authToken);
          passwordInput.value = '';
          showDashboard();
          loadMessages();
        } else {
          if (loginError) {
            loginError.textContent = data.error || 'Invalid admin password. Access denied.';
            loginError.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Admin login failed:', err);
        if (loginError) {
          loginError.textContent = 'Server connection error. Please try again.';
          loginError.style.display = 'block';
        }
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authToken = null;
      sessionStorage.removeItem('admin_token');
      allMessages = [];
      showLogin();
    });
  }

  // Check if session token exists
  if (authToken) {
    showDashboard();
    loadMessages();
  } else {
    showLogin();
  }

  // Periodic background refresh when visible
  window.setInterval(() => {
    if (authToken && document.visibilityState !== 'hidden') {
      loadMessages();
    }
  }, 15000);

  document.addEventListener('visibilitychange', () => {
    if (authToken && document.visibilityState === 'visible') {
      loadMessages();
    }
  });

  function showLogin() {
    if (loginSection) loginSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }

  function showDashboard() {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
  }
});

/**
 * Fetch messages from protected server endpoint
 */
async function loadMessages() {
  if (!authToken || isLoadingMessages) return;
  isLoadingMessages = true;

  try {
    const response = await fetch('/api/admin/messages', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 401) {
      sessionStorage.removeItem('admin_token');
      authToken = null;
      document.getElementById('adminLoginSection').style.display = 'block';
      document.getElementById('adminDashboardSection').style.display = 'none';
      const loginError = document.getElementById('loginErrorAlert');
      if (loginError) {
        loginError.textContent = 'Session expired. Please log in again.';
        loginError.style.display = 'block';
      }
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to load messages');
    }

    const data = await response.json();
    // Guarantee strict newest first sorting
    allMessages = [...data].sort((a, b) => new Date(b.submittedAt || b.timestamp || 0) - new Date(a.submittedAt || a.timestamp || 0));

    // Update UI elements
    updateSummaryStats();
    renderMessages();
    updateReasonChart();
  } catch (err) {
    console.error('Failed to load contact messages:', err);
  } finally {
    isLoadingMessages = false;
  }
}

/**
 * Calculate and render summary statistics and category breakdown
 */
function updateSummaryStats() {
  const total = allMessages.length;
  const newCount = allMessages.filter((m) => !m.replied).length;
  const repliedCount = allMessages.filter((m) => m.replied).length;
  const replyRate = total > 0 ? ((repliedCount / total) * 100).toFixed(1) : '0.0';

  const totalEl = document.getElementById('statTotalMessages');
  const newEl = document.getElementById('statNewMessages');
  const repliedEl = document.getElementById('statRepliedMessages');
  const rateEl = document.getElementById('statReplyRate');
  const progressEl = document.getElementById('statRateProgress');

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (repliedEl) repliedEl.textContent = repliedCount;
  if (rateEl) rateEl.textContent = `${replyRate}%`;
  if (progressEl) progressEl.style.width = `${Math.min(100, Math.max(0, parseFloat(replyRate)))}%`;

  // Update filter counters
  const filterCountAll = document.getElementById('filterCountAll');
  const filterCountNew = document.getElementById('filterCountNew');
  const filterCountReplied = document.getElementById('filterCountReplied');

  if (filterCountAll) filterCountAll.textContent = total;
  if (filterCountNew) filterCountNew.textContent = newCount;
  if (filterCountReplied) filterCountReplied.textContent = repliedCount;

  // Render category breakdown list in sidebar
  renderCategoryBreakdown(total);
}

/**
 * Render category breakdown with progress bars
 */
function renderCategoryBreakdown(total) {
  const container = document.getElementById('categoryBreakdownContainer');
  if (!container) return;

  const categories = [
    { name: 'Comment', color: '#5bb2e9' },
    { name: 'Question', color: '#10b981' },
    { name: 'Partnership', color: '#f59e0b' },
    { name: 'Opportunity', color: '#8b5cf6' },
    { name: 'Other', color: '#ec4899' },
  ];

  container.innerHTML = categories
    .map((cat) => {
      const count = allMessages.filter((m) => m.reason === cat.name).length;
      const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
      return `
        <div class="category-breakdown-row">
          <div class="category-breakdown-info">
            <span class="category-breakdown-name">
              <span class="category-dot" style="background-color: ${cat.color};"></span>
              ${cat.name}
            </span>
            <span><strong>${count}</strong> (${pct}%)</span>
          </div>
          <div class="category-progress-track">
            <div class="category-progress-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Render message list based on current active filter, search term, and category reason
 */
function renderMessages() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = '';

  let filtered = allMessages;

  // Status Filter
  if (currentFilter === 'new') {
    filtered = filtered.filter((m) => !m.replied);
  } else if (currentFilter === 'replied') {
    filtered = filtered.filter((m) => m.replied);
  }

  // Reason Category Filter
  if (currentReason !== 'all') {
    filtered = filtered.filter((m) => m.reason === currentReason);
  }

  // Search keyword filter
  if (currentSearch) {
    filtered = filtered.filter((m) => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      const email = (m.email || '').toLowerCase();
      const reason = (m.reason || '').toLowerCase();
      const message = (m.message || '').toLowerCase();
      return (
        name.includes(currentSearch) ||
        email.includes(currentSearch) ||
        reason.includes(currentSearch) ||
        message.includes(currentSearch)
      );
    });
  }

  if (filtered.length === 0) {
    let emptyMsg = `No messages found in filter "${currentFilter}".`;
    if (currentSearch) {
      emptyMsg = `No inquiries matched "${escapeHtml(currentSearch)}".`;
    } else if (currentReason !== 'all') {
      emptyMsg = `No inquiries found with reason "${escapeHtml(currentReason)}".`;
    }

    container.innerHTML = `
      <div class="empty-messages-state">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📭</div>
        <p>${emptyMsg}</p>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Incoming contact submissions will automatically appear here.</span>
      </div>
    `;
    return;
  }

  filtered.forEach((msg) => {
    const card = document.createElement('div');
    card.className = `message-card ${msg.replied ? 'replied' : 'new'}`;
    card.id = `msg-${msg.id}`;

    const dateFormatted = new Date(msg.submittedAt || msg.timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const repliedDateFormatted = msg.repliedAt
      ? new Date(msg.repliedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

    const initials = getInitials(msg.firstName, msg.lastName);
    const reasonClass = getReasonClass(msg.reason);

    const emailSubject = encodeURIComponent(`Re: Your inquiry regarding ${msg.reason || 'Tristen Campbell Portfolio'}`);
    const emailBody = encodeURIComponent(`Hi ${msg.firstName || 'there'},\n\nThank you for reaching out regarding "${msg.reason || 'your inquiry'}".\n\n\nBest regards,\nTristen Campbell`);
    const mailtoUrl = `mailto:${encodeURIComponent(msg.email)}?subject=${emailSubject}&body=${emailBody}`;

    card.innerHTML = `
      <div class="message-header">
        <div class="message-sender-row">
          <div class="message-avatar" title="${escapeHtml(msg.firstName)} ${escapeHtml(msg.lastName)}">
            ${initials}
          </div>
          <div class="message-sender-info">
            <span class="message-sender">${escapeHtml(msg.firstName)} ${escapeHtml(msg.lastName)}</span>
            <a href="${mailtoUrl}" class="message-email-link" title="Click to compose email to ${escapeHtml(msg.email)}">
              📧 ${escapeHtml(msg.email)}
            </a>
          </div>
        </div>

        <div class="message-tags-row">
          <span class="reason-tag ${reasonClass}">
            🏷️ ${escapeHtml(msg.reason || 'General')}
          </span>
          ${
            msg.replied
              ? '<span class="status-badge badge-replied">✓ Replied</span>'
              : '<span class="status-badge badge-new">● New</span>'
          }
        </div>
      </div>

      <div class="message-meta">
        <span>🕒 Received: <strong>${dateFormatted}</strong></span>
        ${
          repliedDateFormatted
            ? `<span style="color: #059669;">✓ Replied At: <strong>${repliedDateFormatted}</strong></span>`
            : ''
        }
      </div>

      <div class="message-content">${escapeHtml(msg.message)}</div>

      <div class="message-actions">
        <a href="${mailtoUrl}" class="btn btn-secondary btn-sm" title="Open email client">
          ✉️ Compose Email
        </a>
        ${
          !msg.replied
            ? `<button type="button" class="btn btn-primary btn-sm" onclick="markAsReplied('${msg.id}')">✓ Mark as Replied</button>`
            : '<span style="color: var(--accent-emerald); font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">✓ Status: Completed</span>'
        }
      </div>
    `;

    container.appendChild(card);
  });
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim().charAt(0).toUpperCase();
  const l = (lastName || '').trim().charAt(0).toUpperCase();
  return `${f}${l}` || 'TC';
}

function getReasonClass(reason) {
  const r = (reason || '').toLowerCase();
  if (r.includes('comment')) return 'reason-comment';
  if (r.includes('question')) return 'reason-question';
  if (r.includes('partner')) return 'reason-partnership';
  if (r.includes('opportunity')) return 'reason-opportunity';
  return 'reason-other';
}

/**
 * Execute Mark as Replied operation via PATCH endpoint
 */
async function markAsReplied(id) {
  if (!authToken) return;

  const btn = document.querySelector(`#msg-${id} button.btn-primary`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Updating...';
  }

  try {
    const response = await fetch(`/api/admin/messages/${id}/replied`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      const updated = await response.json();
      // Update in-memory array
      const idx = allMessages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        allMessages[idx] = updated;
      }
      updateSummaryStats();
      renderMessages();
      updateReasonChart();
    } else {
      const err = await response.json();
      alert('Failed to mark message as replied: ' + (err.error || 'Server error'));
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✓ Mark as Replied';
      }
    }
  } catch (err) {
    console.error('Error marking as replied:', err);
    alert('Network error while updating reply status.');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✓ Mark as Replied';
    }
  }
}

// Attach to window so onclick in template works
window.markAsReplied = markAsReplied;

/**
 * Update Chart.js Reason visualization
 */
function updateReasonChart() {
  const canvas = document.getElementById('reasonsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const categories = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
  const counts = categories.map((cat) => allMessages.filter((m) => m.reason === cat).length);

  if (reasonChartInstance) {
    reasonChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  reasonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Messages',
          data: counts,
          backgroundColor: [
            'rgba(91, 178, 233, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(236, 72, 153, 0.85)',
          ],
          borderColor: [
            '#439ed7',
            '#059669',
            '#d97706',
            '#7c3aed',
            '#db2777',
          ],
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.parsed.y} message${context.parsed.y === 1 ? '' : 's'}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#627d98',
            stepSize: 1,
            font: {
              size: 11,
            },
          },
          grid: {
            color: 'rgba(15, 36, 56, 0.06)',
          },
        },
        x: {
          ticks: {
            color: '#0f2438',
            font: {
              weight: '600',
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
