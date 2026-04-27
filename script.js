// ══════════════════════════════════════════════
//  LIBRARY MANAGEMENT SYSTEM — script.js
// ══════════════════════════════════════════════

// ── SAMPLE DATA SEED ──────────────────────────
const SAMPLE_BOOKS = [
  { id: 1, name: "Atomic Habits", author: "James Clear", category: "Self Improvement", status: "Available", issuedBy: "", issuedDate: "", returnDate: "", returnedOn: "" },
  { id: 2, name: "The Psychology of Money", author: "Morgan Housel", category: "Psychology", status: "Issued", issuedBy: "Rahul Sharma", issuedDate: "2025-04-01", returnDate: "2025-04-15", returnedOn: "" },
  { id: 3, name: "Sapiens", author: "Yuval Noah Harari", category: "Science", status: "Available", issuedBy: "", issuedDate: "", returnDate: "", returnedOn: "" },
  { id: 4, name: "Clean Code", author: "Robert C. Martin", category: "Technology", status: "Available", issuedBy: "", issuedDate: "", returnDate: "", returnedOn: "" },
  { id: 5, name: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fiction", status: "Available", issuedBy: "", issuedDate: "", returnDate: "", returnedOn: "" },
  { id: 6, name: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", status: "Issued", issuedBy: "Priya Patel", issuedDate: "2025-04-05", returnDate: "2025-04-20", returnedOn: "" },
];

const SAMPLE_HISTORY = [
  { historyId: 1, bookId: 2, bookName: "The Psychology of Money", issuedBy: "Rahul Sharma", issuedDate: "2025-04-01", returnDate: "2025-04-15", returnedOn: "", status: "Issued" },
  { historyId: 2, bookId: 6, bookName: "Thinking, Fast and Slow", issuedBy: "Priya Patel", issuedDate: "2025-04-05", returnDate: "2025-04-20", returnedOn: "", status: "Issued" },
  { historyId: 3, bookId: 3, bookName: "Sapiens", issuedBy: "Amit Kumar", issuedDate: "2025-03-10", returnDate: "2025-03-24", returnedOn: "2025-03-22", status: "Returned" },
];

// ── LOCALSTORAGE HELPERS ───────────────────────
function getBooks() {
  const data = localStorage.getItem('lms_books');
  if (!data) {
    localStorage.setItem('lms_books', JSON.stringify(SAMPLE_BOOKS));
    return SAMPLE_BOOKS;
  }
  return JSON.parse(data);
}

function saveBooks(books) {
  localStorage.setItem('lms_books', JSON.stringify(books));
}

function getHistory() {
  const data = localStorage.getItem('lms_history');
  if (!data) {
    localStorage.setItem('lms_history', JSON.stringify(SAMPLE_HISTORY));
    return SAMPLE_HISTORY;
  }
  return JSON.parse(data);
}

function saveHistory(history) {
  localStorage.setItem('lms_history', JSON.stringify(history));
}

function getNextBookId() {
  const books = getBooks();
  if (books.length === 0) return 1;
  return Math.max(...books.map(b => b.id)) + 1;
}

function getNextHistoryId() {
  const history = getHistory();
  if (history.length === 0) return 1;
  return Math.max(...history.map(h => h.historyId)) + 1;
}

// ── AUTH ───────────────────────────────────────
function isLoggedIn() {
  return localStorage.getItem('lms_logged_in') === 'true';
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function login(username, password) {
  if (username === 'admin' && password === '123') {
    localStorage.setItem('lms_logged_in', 'true');
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('lms_logged_in');
  window.location.href = 'index.html';
}

// ── LOGIN PAGE ─────────────────────────────────
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('login-error');

  if (login(username, password)) {
    window.location.href = 'dashboard.html';
  } else {
    errorEl.style.display = 'flex';
  }
}

// ── DASHBOARD ─────────────────────────────────
function loadDashboard() {
  requireLogin();
  const books = getBooks();
  const total = books.length;
  const issued = books.filter(b => b.status === 'Issued').length;
  const available = books.filter(b => b.status === 'Available').length;

  setEl('stat-total', total);
  setEl('stat-issued', issued);
  setEl('stat-available', available);

  // Recent books (last 5)
  const tbody = document.getElementById('recent-books-tbody');
  if (tbody) {
    const recent = [...books].reverse().slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No books found.</td></tr>';
      return;
    }
    tbody.innerHTML = recent.map(b => `
      <tr>
        <td><strong>${escHtml(b.name)}</strong></td>
        <td>${escHtml(b.author)}</td>
        <td><span class="badge-category">${escHtml(b.category)}</span></td>
        <td><span class="${b.status === 'Available' ? 'badge-available' : 'badge-issued'}">${b.status}</span></td>
        <td><a href="book-details.html?id=${b.id}" class="btn-outline-custom" style="padding:5px 12px;font-size:0.78rem;">View</a></td>
      </tr>
    `).join('');
  }
}

// ── BOOKS PAGE ─────────────────────────────────
function loadBooks() {
  requireLogin();
  renderBooksTable();
}

function renderBooksTable() {
  const books = getBooks();
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const category = document.getElementById('filter-category')?.value || '';
  const sort = document.getElementById('sort-select')?.value || '';

  let filtered = books.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search) || b.author.toLowerCase().includes(search);
    const matchCat = !category || b.category === category;
    return matchSearch && matchCat;
  });

  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'author') filtered.sort((a, b) => a.author.localeCompare(b.author));

  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📚</div><p>No books found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td><strong>${escHtml(b.name)}</strong></td>
      <td>${escHtml(b.author)}</td>
      <td>${escHtml(b.category)}</td>
      <td><span class="${b.status === 'Available' ? 'badge-available' : 'badge-issued'}">${b.status}</span></td>
      <td>${b.issuedBy ? escHtml(b.issuedBy) : '<span class="text-muted">—</span>'}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <a href="book-details.html?id=${b.id}" class="btn-outline-custom" style="padding:5px 12px;font-size:0.78rem;">Details</a>
          ${b.status === 'Available'
            ? `<a href="issue-book.html?id=${b.id}" class="btn-success-custom" style="padding:5px 12px;font-size:0.78rem;">Issue</a>`
            : `<button onclick="returnBook(${b.id})" class="btn-danger-custom" style="padding:5px 12px;font-size:0.78rem;">Return</button>`
          }
          <button onclick="deleteBook(${b.id})" style="background:#f8fafc;border:1.5px solid #e2e8f0;color:#ef4444;padding:5px 10px;border-radius:8px;cursor:pointer;font-size:0.78rem;">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  let books = getBooks();
  books = books.filter(b => b.id !== id);
  saveBooks(books);
  renderBooksTable();
  showToast('Book deleted.', 'danger');
}

// ── ADD BOOK ───────────────────────────────────
function handleAddBook(event) {
  event.preventDefault();
  const name = document.getElementById('book-name').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const category = document.getElementById('book-category').value;

  if (!name || !author || !category) {
    showAlert('add-alert', 'Please fill in all fields.', 'danger');
    return;
  }

  const books = getBooks();
  const newBook = {
    id: getNextBookId(),
    name, author, category,
    status: 'Available',
    issuedBy: '', issuedDate: '', returnDate: '', returnedOn: ''
  };
  books.push(newBook);
  saveBooks(books);
  showAlert('add-alert', '✅ Book added successfully!', 'success');
  document.getElementById('add-book-form').reset();
}

// ── ISSUE BOOK ─────────────────────────────────
function loadIssueBook() {
  requireLogin();
  const id = getQueryParam('id');
  if (!id) return;

  const book = getBooks().find(b => b.id === parseInt(id));
  if (!book) return;

  setEl('issue-book-name', book.name);
  setEl('issue-book-author', book.author);
  setEl('issue-book-category', book.category);

  if (book.status === 'Issued') {
    showAlert('issue-alert', '⚠️ This book is already issued.', 'danger');
    document.getElementById('issue-form-wrapper').style.display = 'none';
  }
}

function handleIssueBook(event) {
  event.preventDefault();
  const id = parseInt(getQueryParam('id'));
  const issuedBy = document.getElementById('issued-by').value.trim();
  const issuedDate = document.getElementById('issued-date').value;
  const returnDate = document.getElementById('return-date').value;

  if (!issuedBy || !issuedDate || !returnDate) {
    showAlert('issue-alert', 'Please fill in all fields.', 'danger');
    return;
  }

  const books = getBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return;

  books[idx].status = 'Issued';
  books[idx].issuedBy = issuedBy;
  books[idx].issuedDate = issuedDate;
  books[idx].returnDate = returnDate;
  books[idx].returnedOn = '';
  saveBooks(books);

  // Add to history
  const history = getHistory();
  history.push({
    historyId: getNextHistoryId(),
    bookId: id,
    bookName: books[idx].name,
    issuedBy, issuedDate, returnDate,
    returnedOn: '',
    status: 'Issued'
  });
  saveHistory(history);

  showAlert('issue-alert', '✅ Book issued successfully!', 'success');
  document.getElementById('issue-form').reset();
  document.getElementById('issue-form-wrapper').style.display = 'none';
  setTimeout(() => { window.location.href = 'books.html'; }, 1200);
}

// ── RETURN BOOK ────────────────────────────────
function returnBook(id) {
  if (!confirm('Mark this book as returned?')) return;
  const books = getBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return;

  const today = new Date().toISOString().split('T')[0];
  books[idx].status = 'Available';
  books[idx].returnedOn = today;
  saveBooks(books);

  // Update history
  const history = getHistory();
  const hIdx = [...history].reverse().findIndex(h => h.bookId === id && h.status === 'Issued');
  const actualIdx = history.length - 1 - hIdx;
  if (hIdx !== -1) {
    history[actualIdx].returnedOn = today;
    history[actualIdx].status = 'Returned';
    saveHistory(history);
  }

  renderBooksTable();
  showToast('Book returned successfully!', 'success');
}

// ── BOOK DETAILS ───────────────────────────────
function loadBookDetails() {
  requireLogin();
  const id = parseInt(getQueryParam('id'));
  const book = getBooks().find(b => b.id === id);

  if (!book) {
    document.getElementById('detail-content').innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div><p>Book not found.</p></div>';
    return;
  }

  setEl('detail-name', book.name);
  setEl('detail-author', book.author);
  setEl('detail-category', book.category);

  const statusEl = document.getElementById('detail-status');
  if (statusEl) statusEl.innerHTML = `<span class="${book.status === 'Available' ? 'badge-available' : 'badge-issued'}">${book.status}</span>`;

  setEl('detail-issued-by', book.issuedBy || '—');
  setEl('detail-issued-date', book.issuedDate || '—');
  setEl('detail-return-date', book.returnDate || '—');
  setEl('detail-returned-on', book.returnedOn || '—');

  const issueBtn = document.getElementById('detail-issue-btn');
  const returnBtn = document.getElementById('detail-return-btn');
  if (issueBtn && returnBtn) {
    if (book.status === 'Available') {
      issueBtn.href = `issue-book.html?id=${book.id}`;
      issueBtn.style.display = 'inline-flex';
      returnBtn.style.display = 'none';
    } else {
      issueBtn.style.display = 'none';
      returnBtn.style.display = 'inline-flex';
      returnBtn.setAttribute('onclick', `returnBook(${book.id})`);
    }
  }
}

// ── HISTORY PAGE ───────────────────────────────
function loadHistory() {
  requireLogin();
  const history = getHistory();
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No history found.</p></div></td></tr>`;
    return;
  }

  const sorted = [...history].reverse();
  tbody.innerHTML = sorted.map(h => `
    <tr>
      <td><strong>${escHtml(h.bookName)}</strong></td>
      <td>${escHtml(h.issuedBy)}</td>
      <td>${h.issuedDate || '—'}</td>
      <td>${h.returnDate || '—'}</td>
      <td>${h.returnedOn || '—'}</td>
      <td><span class="${h.status === 'Returned' ? 'badge-available' : 'badge-issued'}">${h.status}</span></td>
      <td><a href="book-details.html?id=${h.bookId}" class="btn-outline-custom" style="padding:4px 12px;font-size:0.78rem;">View Book</a></td>
    </tr>
  `).join('');
}

// ── UTILITIES ──────────────────────────────────
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

function showAlert(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert-custom alert-${type}-custom`;
  el.textContent = message;
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `alert-custom alert-${type}-custom fade-in`;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;min-width:260px;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Set today's date as default for issued-date
function setDefaultDates() {
  const issuedDateInput = document.getElementById('issued-date');
  if (issuedDateInput) {
    const today = new Date().toISOString().split('T')[0];
    issuedDateInput.value = today;
    // Default return date = 14 days later
    const returnInput = document.getElementById('return-date');
    if (returnInput) {
      const later = new Date();
      later.setDate(later.getDate() + 14);
      returnInput.value = later.toISOString().split('T')[0];
    }
  }
}
