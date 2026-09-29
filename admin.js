/**
 * admin.js - Admin Dashboard JavaScript
 * Handles authentication, fetching contact submissions, calculating summary stats,
 * updating Chart.js visualizer, filtering messages, and executing the Mark as Replied operation.
 */

let authToken = sessionStorage.getItem('admin_token') || null;
let allMessages = [];
let currentFilter = 'all';
let reasonChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('loginErrorAlert');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderMessages();
    });
  });

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
  if (!authToken) return;

  try {
    const response = await fetch('/api/admin/messages', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 401) {
      // Session expired or invalid
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

    allMessages = await response.json();

    // Update UI
    updateSummaryStats();
    renderMessages();
    updateReasonChart();
  } catch (err) {
    console.error('Failed to load contact messages:', err);
  }
}

/**
 * Calculate and render summary statistics
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

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (repliedEl) repliedEl.textContent = repliedCount;
  if (rateEl) rateEl.textContent = `${replyRate}%`;
}

/**
 * Render message list based on current active filter
 */
function renderMessages() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = '';

  let filtered = allMessages;
  if (currentFilter === 'new') {
    filtered = allMessages.filter((m) => !m.replied);
  } else if (currentFilter === 'replied') {
    filtered = allMessages.filter((m) => m.replied);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-messages-state">
        <p>No messages found for filter "${currentFilter}".</p>
      </div>
    `;
    return;
  }

  filtered.forEach((msg) => {
    const card = document.createElement('div');
    card.className = `message-card ${msg.replied ? 'replied' : 'new'}`;
    card.id = `msg-${msg.id}`;

    const dateFormatted = new Date(msg.submittedAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const repliedDateFormatted = msg.repliedAt
      ? new Date(msg.repliedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

    card.innerHTML = `
      <div class="message-header">
        <div class="message-sender">${escapeHtml(msg.firstName)} ${escapeHtml(msg.lastName)}</div>
        <div>
          ${
            msg.replied
              ? '<span class="status-badge badge-replied">✓ Replied</span>'
              : '<span class="status-badge badge-new">● New</span>'
          }
        </div>
      </div>
      <div class="message-meta">
        <span>📧 <a href="mailto:${encodeURIComponent(msg.email)}">${escapeHtml(msg.email)}</a></span>
        <span>🏷️ Reason: <strong>${escapeHtml(msg.reason)}</strong></span>
        <span>🕒 Received: ${dateFormatted}</span>
        ${
          repliedDateFormatted
            ? `<span>✓ Replied At: ${repliedDateFormatted}</span>`
            : ''
        }
      </div>
      <div class="message-content">${escapeHtml(msg.message)}</div>
      <div class="message-actions">
        ${
          !msg.replied
            ? `<button class="btn btn-primary" onclick="markAsReplied('${msg.id}')">Mark as Replied</button>`
            : '<span style="color: var(--accent-emerald); font-size: 0.85rem; font-weight: 600;">Status: Replied</span>'
        }
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Execute Mark as Replied operation via PATCH endpoint
 */
async function markAsReplied(id) {
  if (!authToken) return;

  const btn = document.querySelector(`#msg-${id} button`);
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
        btn.textContent = 'Mark as Replied';
      }
    }
  } catch (err) {
    console.error('Error marking as replied:', err);
    alert('Network error while updating reply status.');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Mark as Replied';
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
          label: 'Messages Count',
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
          borderRadius: 8,
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
        title: {
          display: true,
          text: 'Contact Submissions by Reason',
          color: '#0f2438',
          font: {
            size: 15,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 20,
          },
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
            color: '#536e88',
            stepSize: 1,
          },
          grid: {
            color: 'rgba(15, 36, 56, 0.08)',
          },
        },
        x: {
          ticks: {
            color: '#0f2438',
            font: {
              weight: '600',
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
