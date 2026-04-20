const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCnmgW3GByHOamgChUAmGhJ2ovYluXf6qc",
  authDomain: "ninja-200s.firebaseapp.com",
  databaseURL: "https://ninja-200s-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ninja-200s",
  storageBucket: "ninja-200s.firebasestorage.app",
  messagingSenderId: "1076985111103",
  appId: "1:1076985111103:web:4112ff8923f668aa9f8e8a",
  measurementId: "G-5K8W9XM97T"
};

const BOT_TOKEN = "8591215569:AAHrJNyxOovCnQzxYJSDWzfDUwOuyRxODGs";
const ADMIN_PASSWORDS = ["Mostafa$500"];
const ADMIN_TELEGRAM_ID = "1891231976";

class AdminPanel {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.botToken = BOT_TOKEN;
    
    this.elements = {
      loginContainer: document.getElementById('login-container'),
      appContainer: document.getElementById('app-container'),
      loginButton: document.getElementById('login-button'),
      loginPassword: document.getElementById('login-password'),
      loginMessage: document.getElementById('login-message'),
      contentArea: document.getElementById('content-area'),
      pageTitle: document.getElementById('page-title'),
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebar-overlay'),
      menuToggle: document.getElementById('menu-toggle'),
      logoutBtn: document.getElementById('logout-btn'),
      sidebarClose: document.querySelector('.sidebar-close')
    };
    
    this.initializeFirebase();
  }

  async initializeFirebase() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      
      this.db = firebase.database();
      this.auth = firebase.auth();
      
      console.log("✅ Firebase initialized successfully");
      
      await this.setupEventListeners();
      
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
      this.showLoginMessage("Failed to initialize Firebase", "error");
    }
  }

  async setupEventListeners() {
    this.elements.loginButton.addEventListener('click', () => this.handleLogin());
    this.elements.loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
    
    this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
    this.elements.sidebarOverlay.addEventListener('click', () => this.hideSidebar());
    this.elements.sidebarClose.addEventListener('click', () => this.hideSidebar());
    this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
    
    this.setupNavigation();
  }

  toggleSidebar() {
    this.elements.sidebar.classList.toggle('show');
    this.elements.sidebarOverlay.classList.toggle('show');
  }

  hideSidebar() {
    this.elements.sidebar.classList.remove('show');
    this.elements.sidebarOverlay.classList.remove('show');
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const pageKey = e.currentTarget.dataset.page;
        if (pageKey) {
          navItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');
          this.showPage(pageKey);
          this.hideSidebar();
        }
      });
    });
  }

  showLoginMessage(message, type) {
    const messageEl = this.elements.loginMessage;
    messageEl.textContent = message;
    messageEl.className = `login-message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }

  async handleLogin() {
    const password = this.elements.loginPassword.value.trim();
    
    if (!password) {
      this.showLoginMessage("Please enter a password", "error");
      return;
    }

    this.elements.loginButton.disabled = true;
    this.elements.loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    
    try {
      const userCredential = await this.auth.signInAnonymously();
      this.currentUser = userCredential.user;
      
      const isValid = ADMIN_PASSWORDS.includes(password);
      
      if (isValid) {
        this.showLoginMessage("Login successful!", "success");
        
        setTimeout(() => {
          this.elements.loginContainer.style.display = 'none';
          this.elements.appContainer.style.display = 'flex';
          this.showPage('dashboard');
        }, 1000);
      } else {
        this.showLoginMessage("Invalid password!", "error");
        this.elements.loginPassword.focus();
      }
      
    } catch (error) {
      console.error("Login error:", error);
      this.showLoginMessage("Authentication failed", "error");
    } finally {
      this.elements.loginButton.disabled = false;
      this.elements.loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
  }

  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.signOut();
      this.elements.appContainer.style.display = 'none';
      this.elements.loginContainer.style.display = 'flex';
      this.elements.loginPassword.value = '';
      this.elements.loginPassword.focus();
    }
  }

  async showPage(pageName) {
    this.elements.pageTitle.textContent = this.getPageTitle(pageName);
    
    switch(pageName) {
      case 'dashboard':
        await this.renderDashboard();
        break;
      case 'users':
        await this.renderUsers();
        break;
      case 'tasks':
        await this.renderTasks();
        break;
      case 'promoCodes':
        await this.renderPromoCodes();
        break;
      case 'withdrawals':
        await this.renderWithdrawals();
        break;
      case 'broadcast':
        await this.renderBroadcast();
        break;
      default:
        await this.renderDashboard();
    }
  }

  getPageTitle(pageName) {
    const titles = {
      'dashboard': 'Dashboard',
      'users': 'Users Management',
      'tasks': 'Tasks Management',
      'promoCodes': 'Promo Codes',
      'withdrawals': 'Withdrawals',
      'broadcast': 'Broadcast'
    };
    return titles[pageName] || 'Dashboard';
  }

  async renderDashboard() {
    this.elements.contentArea.innerHTML = `
      <div class="dashboard-page">
        <div class="dashboard-header">
          <h2><i class="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
        </div>
        
        <div class="loading" id="dashboardLoading">
          <div class="spinner"></div>
          <p>Loading Dashboard Data...</p>
        </div>
        
        <div id="dashboardContent" class="dashboard-content" style="display: none;">
          <div class="stats-grid">
            <div class="stats-row">
              <!-- User Stats -->
              <div class="stat-card">
                <div class="stat-card-header">
                  <i class="fas fa-users"></i>
                  <h3>Users Statistics</h3>
                </div>
                <div class="stat-card-body">
                  <div class="stat-item">
                    <span class="stat-label">Total Users</span>
                    <span class="stat-value" id="totalUsers">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Today Users</span>
                    <span class="stat-value" id="todayUsers">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Banned Users</span>
                    <span class="stat-value" id="bannedUsers">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Active Users</span>
                    <span class="stat-value" id="activeUsers">0</span>
                  </div>
                </div>
              </div>
              
              <!-- Withdrawal Stats -->
              <div class="stat-card">
                <div class="stat-card-header">
                  <i class="fas fa-wallet"></i>
                  <h3>Withdrawals Statistics</h3>
                </div>
                <div class="stat-card-body">
                  <div class="stat-item">
                    <span class="stat-label">Total Withdrawals</span>
                    <span class="stat-value" id="totalWithdrawals">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Today Withdrawals</span>
                    <span class="stat-value" id="todayWithdrawals">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Pending Withdrawals</span>
                    <span class="stat-value" id="pendingWithdrawals">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Confirmed Withdrawals</span>
                    <span class="stat-value" id="confirmedWithdrawals">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="stats-row">
              <!-- Task Stats -->
              <div class="stat-card">
                <div class="stat-card-header">
                  <i class="fas fa-tasks"></i>
                  <h3>Tasks Statistics</h3>
                </div>
                <div class="stat-card-body">
                  <div class="stat-item">
                    <span class="stat-label">Total Tasks</span>
                    <span class="stat-value" id="totalTasks">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Partner Tasks</span>
                    <span class="stat-value" id="partnerTasks">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Social Tasks</span>
                    <span class="stat-value" id="socialTasks">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Completed Tasks</span>
                    <span class="stat-value" id="completedTasks">0</span>
                  </div>
                </div>
              </div>
              
              <!-- Financial Stats -->
              <div class="stat-card">
                <div class="stat-card-header">
                  <i class="fas fa-chart-line"></i>
                  <h3>Financial Statistics</h3>
                </div>
                <div class="stat-card-body">
                  <div class="stat-item">
                    <span class="stat-label">Total Distributed</span>
                    <span class="stat-value" id="totalDistributed">0 TON</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Total Balance</span>
                    <span class="stat-value" id="totalBalance">0 TON</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Referral Earnings</span>
                    <span class="stat-value" id="referralEarnings">0 TON</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Task Earnings</span>
                    <span class="stat-value" id="taskEarnings">0 TON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="quick-actions">
            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            <div class="actions-grid">
              <button class="action-btn quick-btn" onclick="admin.showPage('users')">
                <i class="fas fa-user-plus"></i>
                <span>Search User</span>
              </button>
              <button class="action-btn quick-btn" onclick="admin.showPage('tasks')">
                <i class="fas fa-plus-circle"></i>
                <span>Create Task</span>
              </button>
              <button class="action-btn quick-btn" onclick="admin.showPage('promoCodes')">
                <i class="fas fa-ticket-alt"></i>
                <span>Add Promo Code</span>
              </button>
              <button class="action-btn quick-btn" onclick="admin.showPage('withdrawals')">
                <i class="fas fa-wallet"></i>
                <span>Process Withdrawal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 86400000;
      
      const [usersSnap, tasksSnap, withdrawalsSnap] = await Promise.all([
        this.db.ref('users').once('value'),
        this.db.ref('config/tasks').once('value'),
        this.db.ref('withdrawals').once('value')
      ]);
      
      // Users Statistics
      let totalUsers = 0;
      let todayUsers = 0;
      let bannedUsers = 0;
      let activeUsers = 0;
      let totalBalance = 0;
      let totalEarned = 0;
      let referralEarnings = 0;
      let taskEarnings = 0;
      
      usersSnap.forEach(child => {
        const user = child.val();
        totalUsers++;
        
        if (user.createdAt && user.createdAt >= today) {
          todayUsers++;
        }
        
        if (user.status === 'ban') {
          bannedUsers++;
        } else {
          activeUsers++;
        }
        
        totalBalance += this.safeNumber(user.balance);
        totalEarned += this.safeNumber(user.totalEarned);
        referralEarnings += this.safeNumber(user.referralEarnings);
        taskEarnings += this.safeNumber(user.totalEarned) - this.safeNumber(user.referralEarnings);
      });
      
      // Tasks Statistics
      let totalTasks = 0;
      let partnerTasks = 0;
      let socialTasks = 0;
      let completedTasks = 0;
      
      if (tasksSnap.exists()) {
        tasksSnap.forEach(child => {
          const task = child.val();
          if (task.status !== 'deleted') {
            totalTasks++;
            
            if (task.category === 'partner') {
              partnerTasks++;
            } else if (task.category === 'social') {
              socialTasks++;
            }
            
            if (task.currentCompletions >= task.maxCompletions) {
              completedTasks++;
            }
          }
        });
      }
      
      // Withdrawals Statistics
      let totalWithdrawals = 0;
      let todayWithdrawals = 0;
      let pendingWithdrawals = 0;
      let confirmedWithdrawals = 0;
      let totalDistributed = 0;
      
      if (withdrawalsSnap.exists()) {
        const withdrawals = withdrawalsSnap.val();
        
        if (withdrawals.pending) {
          pendingWithdrawals = Object.keys(withdrawals.pending).length;
          totalWithdrawals += pendingWithdrawals;
        }
        
        if (withdrawals.completed) {
          confirmedWithdrawals = Object.keys(withdrawals.completed).length;
          totalWithdrawals += confirmedWithdrawals;
          
          Object.values(withdrawals.completed).forEach(w => {
            totalDistributed += this.safeNumber(w.amount);
            if (w.createdAt && w.createdAt >= today) {
              todayWithdrawals++;
            }
          });
        }
      }
      
      // Update UI
      document.getElementById('dashboardLoading').style.display = 'none';
      document.getElementById('dashboardContent').style.display = 'block';
      
      const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      
      updateElement('totalUsers', totalUsers);
      updateElement('todayUsers', todayUsers);
      updateElement('bannedUsers', bannedUsers);
      updateElement('activeUsers', activeUsers);
      updateElement('totalWithdrawals', totalWithdrawals);
      updateElement('todayWithdrawals', todayWithdrawals);
      updateElement('pendingWithdrawals', pendingWithdrawals);
      updateElement('confirmedWithdrawals', confirmedWithdrawals);
      updateElement('totalTasks', totalTasks);
      updateElement('partnerTasks', partnerTasks);
      updateElement('socialTasks', socialTasks);
      updateElement('completedTasks', completedTasks);
      updateElement('totalDistributed', totalDistributed.toFixed(3) + ' TON');
      updateElement('totalBalance', totalBalance.toFixed(3) + ' TON');
      updateElement('referralEarnings', referralEarnings.toFixed(3) + ' TON');
      updateElement('taskEarnings', taskEarnings.toFixed(3) + ' TON');
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      document.getElementById('dashboardLoading').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error loading dashboard data</p>
          <p class="error-detail">${error.message}</p>
        </div>
      `;
    }
  }

  async renderUsers() {
    this.elements.contentArea.innerHTML = `
      <div class="users-page">
        <div class="page-header">
          <h2><i class="fas fa-users"></i> Users Management</h2>
          <p>Search for users and manage their accounts</p>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="searchUserInput" placeholder="Search by User ID, Username, or Telegram ID">
            <button class="search-btn" onclick="admin.searchUser()">
              <i class="fas fa-search"></i> Search
            </button>
          </div>
          <button class="action-btn btn-secondary" onclick="admin.clearSearch()">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
        
        <div id="userResults" class="user-results">
          <div class="empty-state">
            <i class="fas fa-user-search"></i>
            <p>Search for a user by ID, username, or Telegram ID</p>
            <p class="hint">Search examples: "123456789", "@username", "User Name"</p>
          </div>
        </div>
      </div>
    `;
  }

  async searchUser() {
    const searchTerm = document.getElementById('searchUserInput').value.trim();
    
    if (!searchTerm) {
      this.showNotification("Info", "Please enter search term", "info");
      return;
    }
    
    try {
      const usersSnap = await this.db.ref('users').once('value');
      const results = [];
      
      usersSnap.forEach(child => {
        const user = child.val();
        const userId = child.key;
        const username = user.username || '';
        const firstName = user.firstName || '';
        const telegramId = user.telegramId || '';
        
        const searchStr = `${userId} ${username} ${firstName} ${telegramId}`.toLowerCase();
        
        if (searchStr.includes(searchTerm.toLowerCase())) {
          results.push({
            id: userId,
            ...user
          });
        }
      });
      
      if (results.length === 0) {
        document.getElementById('userResults').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-user-times"></i>
            <p>No users found for "${searchTerm}"</p>
            <p class="hint">Try searching by different criteria</p>
          </div>
        `;
      } else {
        this.displayUsers(results);
      }
      
    } catch (error) {
      console.error("Error searching users:", error);
      this.showNotification("Error", "Search failed", "error");
    }
  }

  clearSearch() {
    document.getElementById('searchUserInput').value = '';
    document.getElementById('userResults').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-search"></i>
        <p>Search for a user by ID, username, or Telegram ID</p>
        <p class="hint">Search examples: "123456789", "@username", "User Name"</p>
      </div>
    `;
  }

  displayUsers(users) {
    const container = document.getElementById('userResults');
    
    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <p>No users found</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="users-list">';
    
    users.forEach(user => {
      const balance = this.safeNumber(user.balance);
      const referrals = user.referrals || 0;
      const tasks = user.totalTasks || 0;
      const status = user.status || 'free';
      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      const lastActive = user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A';
      
      html += `
        <div class="user-card">
          <div class="user-card-header">
            <div class="user-avatar">
              ${user.photoUrl ? 
                `<img src="${user.photoUrl}" alt="${user.firstName}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/9195/9195920.png'">` : 
                `<i class="fas fa-user-circle"></i>`
              }
            </div>
            <div class="user-info">
              <h4>${user.firstName || 'Unknown User'}</h4>
              <p class="user-username">${user.username || 'No username'}</p>
              <div class="user-meta">
                <span><i class="fas fa-id-card"></i> ID: ${user.id}</span>
                <span><i class="fas fa-calendar"></i> Joined: ${joinDate}</span>
              </div>
            </div>
            <div class="user-status ${status}">
              ${status === 'ban' ? 'BANNED' : 'ACTIVE'}
            </div>
          </div>
          
          <div class="user-card-stats">
            <div class="user-stat">
              <i class="fas fa-coins"></i>
              <div>
                <div class="stat-value">${balance.toFixed(3)} TON</div>
                <div class="stat-label">Balance</div>
              </div>
            </div>
            <div class="user-stat">
              <i class="fas fa-users"></i>
              <div>
                <div class="stat-value">${referrals}</div>
                <div class="stat-label">Referrals</div>
              </div>
            </div>
            <div class="user-stat">
              <i class="fas fa-tasks"></i>
              <div>
                <div class="stat-value">${tasks}</div>
                <div class="stat-label">Tasks</div>
              </div>
            </div>
            <div class="user-stat">
              <i class="fas fa-clock"></i>
              <div>
                <div class="stat-value">${lastActive}</div>
                <div class="stat-label">Last Active</div>
              </div>
            </div>
          </div>
          
          <div class="user-card-actions">
            <button class="action-btn btn-sm btn-primary" onclick="admin.showUserDetails('${user.id}')">
              <i class="fas fa-eye"></i> Details
            </button>
            <button class="action-btn btn-sm btn-success" onclick="admin.showAddBalanceModal('${user.id}', '${user.firstName || user.id}')">
              <i class="fas fa-plus"></i> Add TON
            </button>
            ${status === 'free' ? 
              `<button class="action-btn btn-sm btn-warning" onclick="admin.banUser('${user.id}')">
                <i class="fas fa-ban"></i> Ban
              </button>` : 
              `<button class="action-btn btn-sm btn-success" onclick="admin.unbanUser('${user.id}')">
                <i class="fas fa-check"></i> Unban
              </button>`
            }
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  showUserDetails(userId) {
    // This will be implemented in modal
    this.showNotification("Info", "User details view coming soon", "info");
  }

  showAddBalanceModal(userId, userName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus-circle"></i> Add Balance</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Add TON balance to user: <strong>${userName}</strong></p>
          <div class="form-group">
            <label>Amount (TON)</label>
            <input type="number" id="addBalanceAmount" placeholder="0.100" step="0.001" min="0.001" value="0.100">
          </div>
          <div class="form-group">
            <label>Reason (Optional)</label>
            <input type="text" id="addBalanceReason" placeholder="Admin added balance">
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="action-btn btn-success" onclick="admin.addBalance('${userId}')">
            <i class="fas fa-check"></i> Add Balance
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  showRemoveBalanceModal(userId, userName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-minus-circle"></i> Remove Balance</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Remove TON balance from user: <strong>${userName}</strong></p>
          <div class="form-group">
            <label>Amount (TON)</label>
            <input type="number" id="removeBalanceAmount" placeholder="0.100" step="0.001" min="0.001">
          </div>
          <div class="form-group">
            <label>Reason (Optional)</label>
            <input type="text" id="removeBalanceReason" placeholder="Admin removed balance">
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="action-btn btn-danger" onclick="admin.removeBalance('${userId}')">
            <i class="fas fa-check"></i> Remove Balance
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  async addBalance(userId) {
    const amount = parseFloat(document.getElementById('addBalanceAmount').value);
    const reason = document.getElementById('addBalanceReason').value.trim() || 'Admin added balance';

    if (!amount || amount <= 0) {
      this.showNotification("Error", "Please enter a valid amount", "error");
      return;
    }

    try {
      const userRef = this.db.ref(`users/${userId}`);
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
        this.showNotification("Error", "User not found", "error");
        return;
      }

      const user = snapshot.val();
      const currentBalance = this.safeNumber(user.balance);
      const newBalance = currentBalance + amount;

      await userRef.update({
        balance: newBalance,
        totalEarned: this.safeNumber(user.totalEarned) + amount
      });

      this.showNotification("Success", `Added ${amount} TON to user`, "success");
      
      document.querySelector('.modal-overlay.show')?.remove();
      
    } catch (error) {
      console.error("Error adding balance:", error);
      this.showNotification("Error", "Failed to add balance", "error");
    }
  }

  async removeBalance(userId) {
    const amount = parseFloat(document.getElementById('removeBalanceAmount').value);
    const reason = document.getElementById('removeBalanceReason').value.trim() || 'Admin removed balance';

    if (!amount || amount <= 0) {
      this.showNotification("Error", "Please enter a valid amount", "error");
      return;
    }

    try {
      const userRef = this.db.ref(`users/${userId}`);
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
        this.showNotification("Error", "User not found", "error");
        return;
      }

      const user = snapshot.val();
      const currentBalance = this.safeNumber(user.balance);
      
      if (currentBalance < amount) {
        this.showNotification("Error", `User only has ${currentBalance.toFixed(3)} TON`, "error");
        return;
      }

      const newBalance = currentBalance - amount;

      await userRef.update({
        balance: newBalance
      });

      this.showNotification("Success", `Removed ${amount} TON from user`, "success");
      
      document.querySelector('.modal-overlay.show')?.remove();
      
    } catch (error) {
      console.error("Error removing balance:", error);
      this.showNotification("Error", "Failed to remove balance", "error");
    }
  }

  async banUser(userId) {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      await this.db.ref(`users/${userId}/status`).set('ban');
      this.showNotification("Success", "User has been banned", "success");
      await this.searchUser();
    } catch (error) {
      console.error("Error banning user:", error);
      this.showNotification("Error", "Failed to ban user", "error");
    }
  }

  async unbanUser(userId) {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      await this.db.ref(`users/${userId}/status`).set('free');
      this.showNotification("Success", "User has been unbanned", "success");
      await this.searchUser();
    } catch (error) {
      console.error("Error unbanning user:", error);
      this.showNotification("Error", "Failed to unban user", "error");
    }
  }

  async renderTasks() {
    this.elements.contentArea.innerHTML = `
      <div class="tasks-page">
        <div class="page-header">
          <h2><i class="fas fa-tasks"></i> Tasks Management</h2>
          <p>Create and manage Partner & Social tasks</p>
        </div>
        
        <div class="tasks-management">
          <div class="create-task-section">
            <div class="card">
              <h3><i class="fas fa-plus-circle"></i> Create New Task</h3>
              
              <div class="form-group">
                <label>Task Name *</label>
                <input type="text" id="taskName" placeholder="Join our channel">
              </div>
              
              <div class="form-group">
                <label>Task Image URL (Optional)</label>
                <input type="text" id="taskImage" placeholder="https://example.com/image.jpg">
                <small>Leave empty for default image</small>
              </div>
              
              <div class="form-group">
                <label>Task Link (URL) *</label>
                <input type="text" id="taskLink" placeholder="https://t.me/... or @username">
              </div>
              
              <div class="form-group">
                <label>Task Type *</label>
                <div class="type-selector">
                  <button class="type-btn active" data-type="partner" data-reward="0.001">
                    <i class="fas fa-handshake"></i> Partner (0.001 TON)
                  </button>
                  <button class="type-btn" data-type="social" data-reward="0.0005">
                    <i class="fas fa-users"></i> Social (0.0005 TON)
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Reward per User (TON) *</label>
                <input type="number" id="taskReward" value="0.001" step="0.0001" min="0.0001">
                <small>Default: 0.001 for Partner, 0.0005 for Social</small>
              </div>
              
              <div class="form-group">
                <label>Max Completions *</label>
                <input type="number" id="taskMaxCompletions" value="100" min="1">
              </div>
              
              <button class="action-btn btn-success" onclick="admin.createTask()">
                <i class="fas fa-plus-circle"></i> Create Task
              </button>
            </div>
          </div>
          
          <div class="tasks-list-section">
            <div class="card">
              <div class="section-header">
                <h3><i class="fas fa-list"></i> Active Tasks</h3>
                <button class="action-btn btn-sm btn-secondary" onclick="admin.loadTasks()">
                  <i class="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
              
              <div id="tasksList" class="tasks-list">
                <div class="loading">
                  <div class="spinner"></div>
                  <p>Loading tasks...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.setupTaskTypeButtons();
    await this.loadTasks();
  }

  setupTaskTypeButtons() {
    const buttons = document.querySelectorAll('.type-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const reward = btn.getAttribute('data-reward');
        document.getElementById('taskReward').value = reward;
      });
    });
  }

  async loadTasks() {
    try {
      const tasksSnap = await this.db.ref('config/tasks').once('value');
      const tasks = [];
      
      if (tasksSnap.exists()) {
        tasksSnap.forEach(child => {
          const task = child.val();
          if (task.status !== 'deleted') {
            tasks.push({
              id: child.key,
              ...task
            });
          }
        });
      }
      
      this.displayTasks(tasks);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
      document.getElementById('tasksList').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load tasks</p>
        </div>
      `;
    }
  }

  displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tasks"></i>
          <p>No active tasks</p>
          <p>Create your first task above</p>
        </div>
      `;
      return;
    }
    
    tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    let html = '';
    
    tasks.forEach(task => {
      const progress = task.maxCompletions > 0 ? 
        (task.currentCompletions || 0) / task.maxCompletions * 100 : 0;
      
      const typeClass = task.category === 'partner' ? 'type-partner' : 'type-social';
      const typeText = task.category === 'partner' ? 'Partner' : 'Social';
      const isCompleted = progress >= 100;
      const imageUrl = task.picture || 'https://cdn-icons-png.flaticon.com/512/15208/15208522.png';
      
      html += `
        <div class="task-item ${isCompleted ? 'completed' : ''}">
          <div class="task-header">
            <div class="task-preview">
              <img src="${imageUrl}" 
                   alt="${task.name}" 
                   class="task-image"
                   onerror="this.src='https://cdn-icons-png.flaticon.com/512/15208/15208522.png'">
              <div>
                <h4>${task.name}</h4>
                <div class="task-meta">
                  <span class="task-type ${typeClass}">${typeText}</span>
                  <span class="task-status ${isCompleted ? 'status-completed' : 'status-active'}">
                    ${isCompleted ? 'COMPLETED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
            <div class="task-reward">
              <i class="fas fa-gem"></i>
              <span>${task.reward || 0.001} TON</span>
            </div>
          </div>
          
          <div class="task-url">
            <i class="fas fa-link"></i>
            <a href="${task.url}" target="_blank">${task.url.substring(0, 50)}${task.url.length > 50 ? '...' : ''}</a>
          </div>
          
          <div class="task-progress">
            <div class="progress-info">
              <span>Completions: ${task.currentCompletions || 0}/${task.maxCompletions}</span>
              <span>${progress.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
          
          <div class="task-actions">
            <button class="btn-sm btn-danger" onclick="admin.deleteTask('${task.id}')">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  async createTask() {
    const name = document.getElementById('taskName').value.trim();
    const image = document.getElementById('taskImage').value.trim();
    const link = document.getElementById('taskLink').value.trim();
    const reward = parseFloat(document.getElementById('taskReward').value) || 0.001;
    const maxCompletions = parseInt(document.getElementById('taskMaxCompletions').value) || 100;
    const typeBtn = document.querySelector('.type-btn.active');
    const type = typeBtn ? typeBtn.dataset.type : 'partner';
    
    if (!name || !link) {
      this.showNotification("Error", "Please fill all required fields", "error");
      return;
    }
    
    if (reward <= 0) {
      this.showNotification("Error", "Reward must be positive", "error");
      return;
    }
    
    if (maxCompletions <= 0) {
      this.showNotification("Error", "Max completions must be positive", "error");
      return;
    }
    
    try {
      // Format link
      let formattedLink = link.trim();
      if (!formattedLink.startsWith('http') && !formattedLink.startsWith('@')) {
        formattedLink = 'https://t.me/' + formattedLink;
      } else if (formattedLink.startsWith('@')) {
        formattedLink = 'https://t.me/' + formattedLink.substring(1);
      }
      
      const taskData = {
        name: name,
        url: formattedLink,
        category: type,
        reward: reward,
        maxCompletions: maxCompletions,
        currentCompletions: 0,
        status: 'active',
        createdBy: 'admin',
        createdAt: Date.now()
      };
      
      // Add image only if provided
      if (image) {
        taskData.picture = image;
      }
      
      await this.db.ref('config/tasks').push(taskData);
      
      // Clear form
      document.getElementById('taskName').value = '';
      document.getElementById('taskImage').value = '';
      document.getElementById('taskLink').value = '';
      document.getElementById('taskReward').value = type === 'partner' ? '0.001' : '0.0005';
      
      this.showNotification("Success", "Task created successfully!", "success");
      await this.loadTasks();
      
    } catch (error) {
      console.error("Error creating task:", error);
      this.showNotification("Error", "Failed to create task", "error");
    }
  }

  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await this.db.ref(`config/tasks/${taskId}`).update({
        status: 'deleted',
        deletedAt: Date.now()
      });
      
      this.showNotification("Success", "Task deleted", "success");
      await this.loadTasks();
      
    } catch (error) {
      console.error("Error deleting task:", error);
      this.showNotification("Error", "Failed to delete task", "error");
    }
  }

  async renderPromoCodes() {
    this.elements.contentArea.innerHTML = `
      <div class="promo-page">
        <div class="page-header">
          <h2><i class="fas fa-ticket-alt"></i> Promo Codes</h2>
          <p>Create and manage promo codes</p>
        </div>
        
        <div class="promo-management">
          <div class="create-promo-section">
            <div class="card">
              <h3><i class="fas fa-plus-circle"></i> Create New Promo</h3>
              
              <div class="form-group">
                <label>Promo Code *</label>
                <input type="text" id="promoCode" placeholder="NINJA50" style="text-transform: uppercase;">
              </div>
              
              <div class="form-group">
                <label>Reward (TON) *</label>
                <input type="number" id="promoReward" value="0.010" step="0.001" min="0.001">
              </div>
              
              <div class="form-group">
                <label>Max Uses (0 = unlimited)</label>
                <input type="number" id="promoMaxUses" value="0" min="0">
              </div>
              
              <div class="form-group">
                <label>Expiry Date (Optional)</label>
                <input type="date" id="promoExpiry">
              </div>
              
              <button class="action-btn btn-success" onclick="admin.createPromoCode()">
                <i class="fas fa-plus-circle"></i> Create Promo
              </button>
            </div>
          </div>
          
          <div class="promo-list-section">
            <div class="card">
              <div class="section-header">
                <h3><i class="fas fa-list"></i> Active Promo Codes</h3>
                <button class="action-btn btn-sm btn-secondary" onclick="admin.loadPromoCodes()">
                  <i class="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
              
              <div id="promoCodesList" class="promo-codes-list">
                <div class="loading">
                  <div class="spinner"></div>
                  <p>Loading promo codes...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    await this.loadPromoCodes();
  }

  async loadPromoCodes() {
    try {
      const promoCodesSnap = await this.db.ref('config/promoCodes').once('value');
      const promoCodes = [];
      
      if (promoCodesSnap.exists()) {
        promoCodesSnap.forEach(child => {
          const promo = child.val();
          if (promo.status !== 'deleted') {
            promoCodes.push({
              id: child.key,
              ...promo
            });
          }
        });
      }
      
      this.displayPromoCodes(promoCodes);
      
    } catch (error) {
      console.error("Error loading promo codes:", error);
      document.getElementById('promoCodesList').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load promo codes</p>
        </div>
      `;
    }
  }

  displayPromoCodes(promoCodes) {
    const container = document.getElementById('promoCodesList');
    
    if (promoCodes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>No promo codes created</p>
          <p>Create your first promo code above</p>
        </div>
      `;
      return;
    }
    
    promoCodes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    let html = '';
    
    promoCodes.forEach(promo => {
      const used = promo.usedCount || 0;
      const max = promo.maxUses || 0;
      const remaining = max > 0 ? max - used : '∞';
      const isExpired = promo.expiryDate && Date.now() > promo.expiryDate;
      const isFullyUsed = max > 0 && used >= max;
      
      let status = 'active';
      let statusClass = 'status-active';
      
      if (isExpired) {
        status = 'expired';
        statusClass = 'status-expired';
      } else if (isFullyUsed) {
        status = 'used up';
        statusClass = 'status-completed';
      }
      
      html += `
        <div class="promo-code-item ${isExpired ? 'expired' : ''}">
          <div class="promo-header">
            <div>
              <h4><i class="fas fa-ticket-alt"></i> ${promo.code}</h4>
              <div class="promo-meta">
                <span class="promo-status ${statusClass}">${status.toUpperCase()}</span>
                <span class="promo-reward">
                  <i class="fas fa-gem"></i> ${promo.reward || 0.010} TON
                </span>
              </div>
            </div>
            <div class="promo-actions">
              <button class="btn-sm btn-primary" onclick="admin.copyPromoCode('${promo.code}')">
                <i class="fas fa-copy"></i> Copy
              </button>
              <button class="btn-sm btn-danger" onclick="admin.deletePromoCode('${promo.id}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          
          <div class="promo-details">
            <div class="detail">
              <span>Used:</span>
              <span>${used} / ${max > 0 ? max : '∞'}</span>
            </div>
            <div class="detail">
              <span>Remaining:</span>
              <span>${remaining}</span>
            </div>
            <div class="detail">
              <span>Total Distributed:</span>
              <span>${(used * (promo.reward || 0)).toFixed(3)} TON</span>
            </div>
            ${promo.expiryDate ? `
              <div class="detail">
                <span>Expires:</span>
                <span>${new Date(promo.expiryDate).toLocaleDateString()}</span>
              </div>
            ` : ''}
          </div>
          
          ${max > 0 ? `
            <div class="promo-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((used / max) * 100, 100)}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  async createPromoCode() {
    const code = document.getElementById('promoCode').value.trim().toUpperCase();
    const reward = parseFloat(document.getElementById('promoReward').value) || 0.010;
    const maxUses = parseInt(document.getElementById('promoMaxUses').value) || 0;
    const expiryDate = document.getElementById('promoExpiry').value;
    
    if (!code) {
      this.showNotification("Error", "Please enter promo code", "error");
      return;
    }
    
    if (reward <= 0) {
      this.showNotification("Error", "Reward must be positive", "error");
      return;
    }
    
    if (maxUses < 0) {
      this.showNotification("Error", "Max uses cannot be negative", "error");
      return;
    }
    
    try {
      // Check for duplicates
      const existingSnap = await this.db.ref('config/promoCodes').orderByChild('code').equalTo(code).once('value');
      if (existingSnap.exists()) {
        let duplicate = false;
        existingSnap.forEach(child => {
          const promo = child.val();
          if (promo.status !== 'deleted') {
            duplicate = true;
          }
        });
        
        if (duplicate) {
          this.showNotification("Error", "Promo code already exists", "error");
          return;
        }
      }
      
      const promoData = {
        code: code,
        reward: reward,
        maxUses: maxUses,
        usedCount: 0,
        status: 'active',
        createdBy: 'admin',
        createdAt: Date.now()
      };
      
      if (expiryDate) {
        promoData.expiryDate = new Date(expiryDate).getTime();
      }
      
      await this.db.ref('config/promoCodes').push(promoData);
      
      // Clear form
      document.getElementById('promoCode').value = '';
      document.getElementById('promoReward').value = '0.010';
      document.getElementById('promoMaxUses').value = '0';
      document.getElementById('promoExpiry').value = '';
      
      this.showNotification("Success", "Promo code created!", "success");
      await this.loadPromoCodes();
      
    } catch (error) {
      console.error("Error creating promo code:", error);
      this.showNotification("Error", "Failed to create promo code", "error");
    }
  }

  copyPromoCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      this.showNotification("Copied", `Promo code "${code}" copied`, "success");
    }).catch(err => {
      this.showNotification("Error", "Failed to copy", "error");
    });
  }

  async deletePromoCode(promoId) {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      await this.db.ref(`config/promoCodes/${promoId}`).update({
        status: 'deleted',
        deletedAt: Date.now()
      });
      
      this.showNotification("Success", "Promo code deleted", "success");
      await this.loadPromoCodes();
      
    } catch (error) {
      console.error("Error deleting promo code:", error);
      this.showNotification("Error", "Failed to delete promo code", "error");
    }
  }

  async renderWithdrawals() {
    this.elements.contentArea.innerHTML = `
      <div class="withdrawals-page">
        <div class="page-header">
          <h2><i class="fas fa-wallet"></i> Withdrawals Management</h2>
          <p>Process and manage withdrawal requests</p>
        </div>
        
        <div class="withdrawals-stats">
          <div class="mini-stat-card">
            <i class="fas fa-wallet"></i>
            <div>
              <h4>Pending</h4>
              <p id="pendingCount">0</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="fas fa-check-circle"></i>
            <div>
              <h4>Completed</h4>
              <p id="completedCount">0</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="fas fa-times-circle"></i>
            <div>
              <h4>Rejected</h4>
              <p id="rejectedCount">0</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="fas fa-money-bill-wave"></i>
            <div>
              <h4>Today</h4>
              <p id="todayCount">0</p>
            </div>
          </div>
        </div>
        
        <div class="withdrawals-management">
          <div class="card">
            <div class="section-header">
              <h3><i class="fas fa-clock"></i> Pending Withdrawals</h3>
              <button class="action-btn btn-sm btn-secondary" onclick="admin.loadWithdrawals()">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            
            <div id="withdrawalsList" class="withdrawals-list">
              <div class="loading">
                <div class="spinner"></div>
                <p>Loading withdrawals...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    await this.loadWithdrawals();
  }

  async loadWithdrawals() {
    try {
      const [pendingSnap, completedSnap, rejectedSnap] = await Promise.all([
        this.db.ref('withdrawals/pending').once('value'),
        this.db.ref('withdrawals/completed').limitToLast(10).once('value'),
        this.db.ref('withdrawals/rejected').limitToLast(10).once('value')
      ]);
      
      // Update statistics
      const today = new Date().setHours(0, 0, 0, 0);
      let pendingCount = 0;
      let completedCount = 0;
      let rejectedCount = 0;
      let todayCount = 0;
      let totalDistributed = 0;
      
      if (pendingSnap.exists()) {
        pendingCount = pendingSnap.numChildren();
      }
      
      if (completedSnap.exists()) {
        completedCount = completedSnap.numChildren();
        completedSnap.forEach(child => {
          const withdrawal = child.val();
          totalDistributed += this.safeNumber(withdrawal.amount);
          if (withdrawal.createdAt && withdrawal.createdAt >= today) {
            todayCount++;
          }
        });
      }
      
      if (rejectedSnap.exists()) {
        rejectedCount = rejectedSnap.numChildren();
      }
      
      // Update stats display
      document.getElementById('pendingCount').textContent = pendingCount;
      document.getElementById('completedCount').textContent = completedCount;
      document.getElementById('rejectedCount').textContent = rejectedCount;
      document.getElementById('todayCount').textContent = todayCount;
      
      // Display pending withdrawals
      this.displayPendingWithdrawals(pendingSnap);
      
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      document.getElementById('withdrawalsList').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load withdrawals</p>
        </div>
      `;
    }
  }

  displayPendingWithdrawals(pendingSnap) {
    const container = document.getElementById('withdrawalsList');
    
    if (!pendingSnap.exists() || pendingSnap.numChildren() === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No pending withdrawals</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    const today = new Date();
    
    pendingSnap.forEach(child => {
      const request = child.val();
      const requestId = child.key;
      const date = request.createdAt ? new Date(request.createdAt) : today;
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      html += `
        <div class="withdrawal-item">
          <div class="withdrawal-header">
            <div class="user-info">
              <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div>
                <h4>${request.userName || 'Unknown User'}</h4>
                <p class="user-details">
                  <span>${request.username || 'No username'}</span>
                  <span>•</span>
                  <span>ID: ${request.userId}</span>
                </p>
              </div>
            </div>
            <div class="withdrawal-amount">
              ${request.amount ? request.amount.toFixed(5) : '0.00000'} TON
            </div>
          </div>
          
          <div class="withdrawal-details">
            <div class="detail">
              <span><i class="fas fa-wallet"></i> Wallet:</span>
              <span class="wallet-address" title="${request.walletAddress}">
                ${request.walletAddress ? request.walletAddress.substring(0, 15) + '...' : 'N/A'}
              </span>
            </div>
            <div class="detail">
              <span><i class="fas fa-calendar"></i> Date:</span>
              <span>${formattedDate} ${formattedTime}</span>
            </div>
          </div>
          
          <div class="withdrawal-actions">
            <button class="action-btn btn-sm btn-success" onclick="admin.showApproveModal('${requestId}', ${request.amount}, '${request.walletAddress}', '${request.userId}', '${request.userName || ''}')">
              <i class="fas fa-check"></i> Approve
            </button>
            <button class="action-btn btn-sm btn-danger" onclick="admin.rejectWithdrawal('${requestId}')">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  showApproveModal(requestId, amount, wallet, userId, userName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-check-circle"></i> Approve Withdrawal</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p>You are approving a withdrawal for <strong>${userName}</strong>:</p>
          <div class="withdrawal-summary">
            <div class="summary-item">
              <span>Amount:</span>
              <span class="amount-value">${amount.toFixed(5)} TON</span>
            </div>
            <div class="summary-item">
              <span>Wallet:</span>
              <span class="wallet-value">${wallet}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Transaction Link *</label>
            <input type="text" id="transactionLink" placeholder="https://tonscan.org/tx/...">
            <small>Link to transaction on explorer</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="action-btn btn-success" onclick="admin.approveWithdrawal('${requestId}', '${userId}', ${amount}, '${wallet}')">
            <i class="fas fa-check"></i> Approve
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  async approveWithdrawal(requestId, userId, amount, wallet) {
    const transactionLink = document.getElementById('transactionLink')?.value.trim();
    
    if (!transactionLink) {
      this.showNotification("Error", "Please enter transaction link", "error");
      return;
    }
    
    try {
      // Get request data
      const requestRef = this.db.ref(`withdrawals/pending/${requestId}`);
      const snapshot = await requestRef.once('value');
      const request = snapshot.val();
      
      if (!request) {
        this.showNotification("Error", "Request not found", "error");
        return;
      }
      
      // Move to completed
      await this.db.ref(`withdrawals/completed/${requestId}`).set({
        ...request,
        status: 'completed',
        processedAt: Date.now(),
        transactionLink: transactionLink
      });
      
      // Remove from pending
      await requestRef.remove();
      
      // Send notification to user
      await this.sendWithdrawalNotification(userId, amount, wallet, transactionLink);
      
      // Send statistics to admin
      await this.sendWithdrawalStats();
      
      this.showNotification("Success", "Withdrawal approved!", "success");
      
      document.querySelector('.modal-overlay.show')?.remove();
      await this.loadWithdrawals();
      
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      this.showNotification("Error", "Failed to approve withdrawal", "error");
    }
  }

  async rejectWithdrawal(requestId) {
    if (!confirm('Are you sure you want to reject this withdrawal?')) return;
    
    try {
      const requestRef = this.db.ref(`withdrawals/pending/${requestId}`);
      const snapshot = await requestRef.once('value');
      const request = snapshot.val();
      
      if (!request) {
        this.showNotification("Error", "Request not found", "error");
        return;
      }
      
      // Move to rejected
      await this.db.ref(`withdrawals/rejected/${requestId}`).set({
        ...request,
        status: 'rejected',
        processedAt: Date.now()
      });
      
      // Remove from pending
      await requestRef.remove();
      
      this.showNotification("Success", "Withdrawal rejected", "success");
      await this.loadWithdrawals();
      
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      this.showNotification("Error", "Failed to reject withdrawal", "error");
    }
  }

  async sendWithdrawalNotification(userId, amount, wallet, transactionLink) {
    try {
      const message = `✅ *Withdrawal Approved!*\n\n💰 *Amount:* ${amount.toFixed(5)} TON\n\n📭 *Wallet:* ${wallet}\n\n🔗 *Transaction:* ${transactionLink}\n\n🥷 *Thank you for using Ninja TON!*`;
      
      await this.sendTelegramMessage(userId, message);
      
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  async sendWithdrawalStats() {
    try {
      const [withdrawalsSnap, usersSnap] = await Promise.all([
        this.db.ref('withdrawals/completed').once('value'),
        this.db.ref('users').once('value')
      ]);
      
      const today = new Date().setHours(0, 0, 0, 0);
      let totalWithdrawals = 0;
      let totalDistributed = 0;
      let todayWithdrawals = 0;
      let todayDistributed = 0;
      let totalUsers = usersSnap.numChildren();
      
      if (withdrawalsSnap.exists()) {
        withdrawalsSnap.forEach(child => {
          const withdrawal = child.val();
          totalWithdrawals++;
          totalDistributed += this.safeNumber(withdrawal.amount);
          
          if (withdrawal.createdAt && withdrawal.createdAt >= today) {
            todayWithdrawals++;
            todayDistributed += this.safeNumber(withdrawal.amount);
          }
        });
      }
      
      const message = `📊 *Withdrawal Statistics*\n\n👥 Total Users: ${totalUsers}\n\n💰 Total Distributed: ${totalDistributed.toFixed(3)} TON\n📈 Total Withdrawals: ${totalWithdrawals}\n\n📅 Today Distributed: ${todayDistributed.toFixed(3)} TON\n📈 Today Withdrawals: ${todayWithdrawals}`;
      
      await this.sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
      
    } catch (error) {
      console.error("Error sending stats:", error);
    }
  }

  async renderBroadcast() {
    this.elements.contentArea.innerHTML = `
      <div class="broadcast-page">
        <div class="page-header">
          <h2><i class="fas fa-bullhorn"></i> Broadcast Messages</h2>
          <p>Send messages to all users or specific users</p>
        </div>
        
        <div class="broadcast-management">
          <div class="card">
            <h3><i class="fas fa-edit"></i> Create Broadcast</h3>
            
            <div class="form-group">
              <label>Recipients</label>
              <select id="broadcastType" onchange="admin.toggleBroadcastTarget()">
                <option value="all">All Users</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
            
            <div id="specificUserField" class="form-group" style="display: none;">
              <label>User ID</label>
              <input type="text" id="broadcastUserId" placeholder="Telegram User ID">
            </div>
            
            <div class="form-group">
              <label>Message *</label>
              <textarea id="broadcastMessage" rows="5" placeholder="Enter your message here..."></textarea>
              <small>Supports basic HTML formatting</small>
            </div>
            
            <div class="html-tools">
              <button class="html-btn" onclick="admin.insertHtmlTag('b')"><b>B</b></button>
              <button class="html-btn" onclick="admin.insertHtmlTag('i')"><i>I</i></button>
              <button class="html-btn" onclick="admin.insertHtmlTag('u')"><u>U</u></button>
              <button class="html-btn" onclick="admin.insertHtmlTag('code')"><code>C</code></button>
              <button class="html-btn" onclick="admin.insertLink()">🔗</button>
            </div>
            
            <!-- Inline Buttons Section -->
            <div class="inline-buttons-section">
              <h4><i class="fas fa-th-large"></i> Inline Buttons</h4>
              <p class="section-description">Add inline buttons below the message</p>
              
              <div id="inlineButtonsContainer">
                <div class="button-row">
                  <input type="text" class="button-text" placeholder="Button text" maxlength="20">
                  <input type="text" class="button-url" placeholder="URL">
                  <button class="btn-sm btn-danger" onclick="this.parentElement.remove(); admin.updatePreview()">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <button class="action-btn btn-sm btn-secondary" onclick="admin.addInlineButton()">
                <i class="fas fa-plus"></i> Add Button
              </button>
              <small>Max 3 buttons per row, 5 rows maximum</small>
            </div>
            
            <div class="broadcast-preview">
              <h4>Preview</h4>
              <div id="broadcastPreview" class="preview-content">
                <div class="preview-placeholder">
                  <i class="fas fa-comment-alt"></i>
                  <p>Message preview will appear here</p>
                </div>
              </div>
            </div>
            
            <div class="broadcast-actions">
              <button class="action-btn btn-secondary" onclick="admin.updatePreview()">
                <i class="fas fa-eye"></i> Update Preview
              </button>
              <button class="action-btn btn-success" onclick="admin.sendBroadcast()">
                <i class="fas fa-paper-plane"></i> Send Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.updatePreview();
  }

  toggleBroadcastTarget() {
    const type = document.getElementById('broadcastType').value;
    const field = document.getElementById('specificUserField');
    field.style.display = type === 'specific' ? 'block' : 'none';
  }

  addInlineButton() {
    const container = document.getElementById('inlineButtonsContainer');
    const rows = container.querySelectorAll('.button-row');
    
    if (rows.length >= 5) {
      this.showNotification("Warning", "Maximum 5 rows of buttons allowed", "warning");
      return;
    }
    
    const buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';
    buttonRow.innerHTML = `
      <input type="text" class="button-text" placeholder="Button text" maxlength="20">
      <input type="text" class="button-url" placeholder="URL">
      <button class="btn-sm btn-danger" onclick="this.parentElement.remove(); admin.updatePreview()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add event listeners for real-time preview update
    buttonRow.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.updatePreview());
    });
    
    container.appendChild(buttonRow);
    this.updatePreview();
  }

  insertHtmlTag(tag) {
    const textarea = document.getElementById('broadcastMessage');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    
    let startTag = '', endTag = '';
    
    switch(tag) {
      case 'b': startTag = '<b>'; endTag = '</b>'; break;
      case 'i': startTag = '<i>'; endTag = '</i>'; break;
      case 'u': startTag = '<u>'; endTag = '</u>'; break;
      case 'code': startTag = '<code>'; endTag = '</code>'; break;
    }
    
    textarea.value = textarea.value.substring(0, start) + startTag + selected + endTag + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
    
    this.updatePreview();
  }

  insertLink() {
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    
    const text = prompt('Enter link text:', url);
    if (!text) return;
    
    const textarea = document.getElementById('broadcastMessage');
    const start = textarea.selectionStart;
    
    textarea.value = textarea.value.substring(0, start) + `<a href="${url}">${text}</a>` + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start, start + `<a href="${url}">${text}</a>`.length);
    
    this.updatePreview();
  }

  updatePreview() {
    const message = document.getElementById('broadcastMessage').value;
    const preview = document.getElementById('broadcastPreview');
    
    let previewHTML = '';
    
    if (message.trim()) {
      previewHTML = `<div class="message-content">${message.replace(/\n/g, '<br>')}</div>`;
      
      // Add inline buttons preview
      const buttons = this.getInlineButtons();
      if (buttons.length > 0) {
        previewHTML += '<div class="buttons-preview">';
        buttons.forEach(row => {
          previewHTML += '<div class="buttons-row">';
          row.forEach(button => {
            if (button.text && button.url) {
              previewHTML += `
                <a href="${button.url}" class="preview-button" target="_blank">
                  ${button.text}
                </a>
              `;
            }
          });
          previewHTML += '</div>';
        });
        previewHTML += '</div>';
      }
    } else {
      previewHTML = `
        <div class="preview-placeholder">
          <i class="fas fa-comment-alt"></i>
          <p>Message preview will appear here</p>
        </div>
      `;
    }
    
    preview.innerHTML = previewHTML;
  }

  getInlineButtons() {
    const rows = document.querySelectorAll('#inlineButtonsContainer .button-row');
    const buttons = [];
    
    rows.forEach(row => {
      const rowButtons = [];
      const textInput = row.querySelector('.button-text');
      const urlInput = row.querySelector('.button-url');
      
      if (textInput && urlInput && textInput.value.trim() && urlInput.value.trim()) {
        rowButtons.push({
          text: textInput.value.trim(),
          url: urlInput.value.trim()
        });
      }
      
      if (rowButtons.length > 0) {
        buttons.push(rowButtons);
      }
    });
    
    return buttons;
  }

  async sendBroadcast() {
    const message = document.getElementById('broadcastMessage').value.trim();
    const type = document.getElementById('broadcastType').value;
    const userId = document.getElementById('broadcastUserId')?.value.trim();
    const inlineButtons = this.getInlineButtons();
    
    if (!message) {
      this.showNotification("Error", "Please enter a message", "error");
      return;
    }
    
    if (type === 'specific' && !userId) {
      this.showNotification("Error", "Please enter User ID", "error");
      return;
    }
    
    const totalUsers = type === 'all' ? 'ALL users' : '1 user';
    if (!confirm(`Send broadcast to ${totalUsers}?`)) {
      return;
    }
    
    try {
      let users = [];
      
      if (type === 'all') {
        const usersSnap = await this.db.ref('users').once('value');
        usersSnap.forEach(child => {
          users.push({
            id: child.key,
            username: child.val().username
          });
        });
      } else {
        const userSnap = await this.db.ref(`users/${userId}`).once('value');
        if (!userSnap.exists()) {
          this.showNotification("Error", "User not found", "error");
          return;
        }
        
        users.push({
          id: userId,
          username: userSnap.val().username
        });
      }
      
      const total = users.length;
      if (total === 0) {
        this.showNotification("Info", "No users found", "info");
        return;
      }
      
      // Show progress modal
      this.showBroadcastProgress(total);
      
      let sent = 0;
      let failed = 0;
      const failedUsers = [];
      
      for (const user of users) {
        try {
          await this.sendTelegramMessage(user.id, message, inlineButtons);
          sent++;
          
          this.updateBroadcastProgress(sent, failed, total);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to send to ${user.id}:`, error);
          failed++;
          failedUsers.push({
            id: user.id,
            username: user.username,
            error: error.message
          });
          
          this.updateBroadcastProgress(sent, failed, total, failedUsers);
        }
      }
      
      setTimeout(() => {
        document.querySelector('.modal-overlay.show')?.remove();
        
        const resultMsg = `Broadcast completed! Sent: ${sent}, Failed: ${failed}`;
        this.showNotification("Broadcast Complete", resultMsg, failed === 0 ? "success" : "warning");
        
        this.sendBroadcastReport(total, sent, failed, failedUsers, inlineButtons);
        
      }, 2000);
      
    } catch (error) {
      console.error("Broadcast error:", error);
      document.querySelector('.modal-overlay.show')?.remove();
      this.showNotification("Error", "Broadcast failed", "error");
    }
  }

  showBroadcastProgress(total) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-paper-plane"></i> Sending Broadcast</h3>
        </div>
        <div class="modal-body">
          <div class="progress-stats">
            <div class="stat">
              <span>Total:</span>
              <span id="broadcastTotal">${total}</span>
            </div>
            <div class="stat">
              <span>Sent:</span>
              <span id="broadcastSent" class="success">0</span>
            </div>
            <div class="stat">
              <span>Failed:</span>
              <span id="broadcastFailed" class="error">0</span>
            </div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="broadcastProgress" style="width: 0%"></div>
            </div>
            <div class="progress-text" id="broadcastPercent">0%</div>
          </div>
          
          <div id="broadcastStatus" class="status-message">Starting...</div>
          
          <div id="failedList" class="failed-list" style="display: none;">
            <h4>Failed Users:</h4>
            <div id="failedUsers"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  updateBroadcastProgress(sent, failed, total, failedUsers = []) {
    const processed = sent + failed;
    const percent = total > 0 ? Math.round((processed / total) * 100) : 0;
    
    const updateEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    
    updateEl('broadcastSent', sent);
    updateEl('broadcastFailed', failed);
    updateEl('broadcastPercent', percent + '%');
    
    const progress = document.getElementById('broadcastProgress');
    if (progress) progress.style.width = percent + '%';
    
    const status = document.getElementById('broadcastStatus');
    if (status) {
      if (processed >= total) {
        status.textContent = `Complete! Sent: ${sent}, Failed: ${failed}`;
        status.className = 'status-message success';
      } else {
        status.textContent = `Processing... (${processed}/${total})`;
        status.className = 'status-message';
      }
    }
    
    if (failedUsers.length > 0) {
      const container = document.getElementById('failedList');
      const list = document.getElementById('failedUsers');
      
      if (container) container.style.display = 'block';
      if (list) {
        list.innerHTML = failedUsers.map(user => `
          <div class="failed-user">
            <span>${user.id} (@${user.username || 'none'})</span>
            <small>${user.error}</small>
          </div>
        `).join('');
      }
    }
  }

  async sendBroadcastReport(total, sent, failed, failedUsers, inlineButtons) {
    try {
      let report = `📢 *Broadcast Report*\n\n`;
      report += `👥 Total Users: ${total}\n`;
      report += `✅ Successfully Sent: ${sent}\n`;
      report += `❌ Failed: ${failed}\n`;
      report += `🔘 Inline Buttons: ${inlineButtons.length} rows\n\n`;
      
      if (failed > 0) {
        report += `*Failed Users:*\n`;
        failedUsers.slice(0, 10).forEach(user => {
          report += `- ${user.id} (${user.username || 'no username'})\n`;
        });
        
        if (failedUsers.length > 10) {
          report += `... and ${failedUsers.length - 10} more`;
        }
      }
      
      await this.sendTelegramMessage(ADMIN_TELEGRAM_ID, report);
      
    } catch (error) {
      console.error("Error sending report:", error);
    }
  }

  async sendTelegramMessage(chatId, message, inlineButtons = []) {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      };
      
      // Add inline keyboard if buttons exist
      if (inlineButtons.length > 0) {
        const keyboard = [];
        inlineButtons.forEach(row => {
          const rowButtons = row.map(button => ({
            text: button.text,
            url: button.url
          }));
          keyboard.push(rowButtons);
        });
        
        payload.reply_markup = {
          inline_keyboard: keyboard
        };
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Telegram API error');
      }
      
      return true;
      
    } catch (error) {
      console.error(`Telegram error for ${chatId}:`, error);
      throw error;
    }
  }

  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'warning' ? '⚠️' : 'ℹ️';
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  safeNumber(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
}

const admin = new AdminPanel();
window.admin = admin;
