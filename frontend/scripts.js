// scripts.js
document.addEventListener("DOMContentLoaded", function() {
    // 初始化变量
    const API_BASE_URL = 'http://localhost:3001/api';
    let currentUser = null;
    
    // 检查登录状态
    checkLoginStatus();
    
    // 退出按钮事件
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// 时间问候语功能
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 5 && hour < 12) {
        greeting = "早上好";
    } else if (hour >= 12 && hour < 18) {
        greeting = "下午好";
    } else {
        greeting = "晚上好";
    }
    
    const greetingElement = document.getElementById("time-greeting");
    if (greetingElement) {
        greetingElement.textContent = greeting;
    }
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            initializeApp();
        } catch (e) {
            showLoginPage();
        }
    } else {
        showLoginPage();
    }
}

// 显示登录页面
function showLoginPage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="login-container">
            <div class="login-form">
                <h2>用户登录</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="login-btn">登录</button>
                </form>
            </div>
        </div>
    `;
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    currentUser = data.user;
                    initializeApp();
                } else {
                    alert(data.error || '登录失败');
                }
            } catch (error) {
                console.error('登录错误:', error);
                alert('登录请求失败');
            }
        });
    }
}

// 初始化应用
function initializeApp() {
    // 更新用户信息
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.full_name || currentUser.username;
    }
    
    // 更新时间问候
    updateGreeting();
    
    // 设置导航菜单
    setupNavigation();
    
    // 加载主内容
    loadMainContent();
}

// 设置导航菜单
function setupNavigation() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;
    
    // 清空现有导航
    navLinks.innerHTML = '';
    
    // 根据用户角色添加导航项
    const links = [
        { text: "用户管理", href: "#", module: "user-management", roles: ["Admin"] },
        { text: "题库管理", href: "#", module: "question-management", roles: ["Admin", "Editorial Staff", "Editor"] },
        { text: "题目录入", href: "#", module: "question-input", roles: ["Admin", "Editorial Staff", "Typesetter"] },
        { text: "组题系统", href: "#", module: "question-selection", roles: ["Admin", "Editorial Staff", "Typesetter"] },
        { text: "任务管理", href: "#", module: "task-management", roles: ["Admin", "Editorial Staff", "Typesetter", "Editor"] },
        { text: "排版管理", href: "#", module: "typesetting", roles: ["Admin", "Editorial Staff", "Typesetter"] },
        { text: "排版稿件管理", href: "#", module: "typesetting-management", roles: ["Admin", "Editorial Staff", "Editor"] },
        { text: "插图管理", href: "#", module: "image-management", roles: ["Admin", "Editorial Staff", "Editor"] }
    ];
    
    // 创建导航项
    links.forEach(link => {
        if (link.roles.includes(currentUser.role_name)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.dataset.module = link.module;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadModule(link.module);
            });
            li.appendChild(a);
            navLinks.appendChild(li);
        }
    });
}

// 加载主内容
function loadMainContent() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="content-wrapper">
            <div class="management-panel">
                <h1>欢迎使用双微教研图书生产管理系统</h1>
                <p><span id="time-greeting">您好</span>，${currentUser.full_name || currentUser.username}，工作辛苦了</p>
                <p>请从左侧导航选择您要使用的功能模块。</p>
            </div>
        </div>
    `;
    
    // 更新时间问候
    updateGreeting();
}

// 加载模块
function loadModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    switch(moduleName) {
        case 'user-management':
            loadUserManagement();
            break;
        // 其他模块加载...
        default:
            mainContent.innerHTML = `<h2>${moduleName} 功能开发中</h2>`;
    }
}

// 加载用户管理
async function loadUserManagement() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="management-panel">
            <h1>用户管理</h1>
            <div class="table-controls">
                <div class="search-container">
                    <div class="search-box">
                        <input type="text" class="search-input" placeholder="搜索用户..." id="search-input">
                        <span class="search-icon">🔍</span>
                    </div>
                    <div class="filter-options">
                        <select class="filter-select" id="role-filter">
                            <option value="">所有角色</option>
                        </select>
                        <select class="filter-select" id="status-filter">
                            <option value="">所有状态</option>
                            <option value="active">活跃</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                </div>
                <button class="rounded-button" id="add-user-btn">添加用户</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>用户名</th>
                        <th>姓名</th>
                        <th>邮箱</th>
                        <th>角色</th>
                        <th>部门</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="user-table-body"></tbody>
            </table>
        </div>
    `;
    
    // 加载用户数据
    await loadUserData();
    
    // 添加搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => filterUsers());
    }
    
    // 添加筛选功能
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    if (roleFilter && statusFilter) {
        roleFilter.addEventListener('change', () => filterUsers());
        statusFilter.addEventListener('change', () => filterUsers());
    }
    
    // 添加用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserForm);
    }
}

// 加载用户数据
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('获取用户数据失败');
        }
        
        const users = await response.json();
        
        // 填充角色筛选器
        const roleFilter = document.getElementById('role-filter');
        if (roleFilter) {
            const rolesResponse = await fetch(`${API_BASE_URL}/users/roles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (rolesResponse.ok) {
                const roles = await rolesResponse.json();
                roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role.id;
                    option.textContent = role.name;
                    roleFilter.appendChild(option);
                });
            }
        }
        
        // 渲染用户表格
        renderUserTable(users);
        
    } catch (error) {
        console.error('加载用户数据错误:', error);
        alert('获取用户数据失败');
    }
}

// 渲染用户表格
function renderUserTable(users) {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td>${user.role_name}</td>
            <td>${user.department_name}</td>
            <td><span class="status-badge status-${user.status}">${user.status === 'active' ? '活跃' : '禁用'}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${user.id}">编辑</button>
                <button class="action-btn delete-btn" data-id="${user.id}">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.id;
            showEditUserForm(userId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.id;
            deleteUser(userId);
        });
    });
}

// 筛选用户
async function filterUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('获取用户数据失败');
        }
        
        let users = await response.json();
        
        // 应用筛选条件
        const roleFilter = document.getElementById('role-filter');
        const statusFilter = document.getElementById('status-filter');
        const searchInput = document.getElementById('search-input');
        
        if (roleFilter && roleFilter.value) {
            users = users.filter(user => user.role_id == roleFilter.value);
        }
        
        if (statusFilter && statusFilter.value) {
            users = users.filter(user => user.status === statusFilter.value);
        }
        
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            users = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.full_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        
        // 重新渲染表格
        renderUserTable(users);
        
    } catch (error) {
        console.error('筛选用户错误:', error);
    }
}

// 显示添加用户表单
function showAddUserForm() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML += `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>添加新用户</h2>
                <form id="user-form">
                    <div class="form-group">
                        <label for="new-username">用户名</label>
                        <input type="text" id="new-username" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">密码</label>
                        <input type="password" id="new-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-fullname">姓名</label>
                        <input type="text" id="new-fullname" required>
                    </div>
                    <div class="form-group">
                        <label for="new-email">邮箱</label>
                        <input type="email" id="new-email" required>
                    </div>
                    <div class="form-group">
                        <label for="new-role">角色</label>
                        <select id="new-role" required></select>
                    </div>
                    <div class="form-group">
                        <label for="new-department">部门</label>
                        <select id="new-department" required></select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="rounded-button cancel-btn">取消</button>
                        <button type="submit" class="rounded-button submit-btn">提交</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // 加载角色和部门选项
    loadFormOptions();
    
    // 表单提交
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createUser();
        });
    }
    
    // 取消按钮
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }
}

// 加载表单选项
async function loadFormOptions() {
    try {
        const token = localStorage.getItem('token');
        
        // 加载角色选项
        const rolesResponse = await fetch(`${API_BASE_URL}/users/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (rolesResponse.ok) {
            const roles = await rolesResponse.json();
            const roleSelect = document.getElementById('new-role');
            if (roleSelect) {
                roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role.id;
                    option.textContent = role.name;
                    roleSelect.appendChild(option);
                });
            }
        }
        
        // 加载部门选项
        const deptsResponse = await fetch(`${API_BASE_URL}/users/departments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (deptsResponse.ok) {
            const departments = await deptsResponse.json();
            const deptSelect = document.getElementById('new-department');
            if (deptSelect) {
                departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.name;
                    deptSelect.appendChild(option);
                });
            }
        }
        
    } catch (error) {
        console.error('加载选项错误:', error);
    }
}

// 创建用户
async function createUser() {
    try {
        const token = localStorage.getItem('token');
        const userData = {
            username: document.getElementById('new-username').value,
            password: document.getElementById('new-password').value,
            full_name: document.getElementById('new-fullname').value,
            email: document.getElementById('new-email').value,
            role_id: document.getElementById('new-role').value,
            department_id: document.getElementById('new-department').value
        };
        
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('用户创建成功');
            document.querySelector('.modal-overlay').remove();
            loadUserData();
        } else {
            const errorData = await response.json();
            alert(errorData.error || '创建用户失败');
        }
    } catch (error) {
        console.error('创建用户错误:', error);
        alert('创建用户失败');
    }
}

// 显示编辑用户表单
async function showEditUserForm(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('获取用户数据失败');
        }
        
        const user = await response.json();
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.innerHTML += `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h2>编辑用户</h2>
                    <form id="edit-user-form">
                        <input type="hidden" id="edit-user-id" value="${user.id}">
                        <div class="form-group">
                            <label for="edit-username">用户名</label>
                            <input type="text" id="edit-username" value="${user.username}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-fullname">姓名</label>
                            <input type="text" id="edit-fullname" value="${user.full_name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">邮箱</label>
                            <input type="email" id="edit-email" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-role">角色</label>
                            <select id="edit-role" required></select>
                        </div>
                        <div class="form-group">
                            <label for="edit-department">部门</label>
                            <select id="edit-department" required></select>
                        </div>
                        <div class="form-group">
                            <label for="edit-status">状态</label>
                            <select id="edit-status">
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>活跃</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>禁用</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="rounded-button cancel-btn">取消</button>
                            <button type="submit" class="rounded-button submit-btn">更新</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 加载角色和部门选项
        await loadFormOptions();
        
        // 设置当前选项
        document.getElementById('edit-role').value = user.role_id;
        document.getElementById('edit-department').value = user.department_id;
        
        // 表单提交
        const editForm = document.getElementById('edit-user-form');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await updateUser(user.id);
            });
        }
        
        // 取消按钮
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('.modal-overlay').remove();
            });
        }
        
    } catch (error) {
        console.error('加载编辑表单错误:', error);
        alert('无法加载用户信息');
    }
}

// 更新用户
async function updateUser(userId) {
    try {
        const token = localStorage.getItem('token');
        const userData = {
            username: document.getElementById('edit-username').value,
            full_name: document.getElementById('edit-fullname').value,
            email: document.getElementById('edit-email').value,
            role_id: document.getElementById('edit-role').value,
            department_id: document.getElementById('edit-department').value,
            status: document.getElementById('edit-status').value
        };
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('用户更新成功');
            document.querySelector('.modal-overlay').remove();
            loadUserData();
        } else {
            const errorData = await response.json();
            alert(errorData.error || '更新用户失败');
        }
    } catch (error) {
        console.error('更新用户错误:', error);
        alert('更新用户失败');
    }
}

// 删除用户
async function deleteUser(userId) {
    if (!confirm('确定要删除此用户吗？')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('用户删除成功');
            loadUserData();
        } else {
            const errorData = await response.json();
            alert(errorData.error || '删除用户失败');
        }
    } catch (error) {
        console.error('删除用户错误:', error);
        alert('删除用户失败');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showLoginPage();
}

// 获取用户角色（保留原有功能）
function getUserRole() {
    // 这里可以实现从后端获取用户角色的逻辑
    // 例如：从本地存储或通过API获取
    return "chief_editor"; // 示例角色
}