document.addEventListener("DOMContentLoaded", function() {
    // 初始化用户角色（模拟数据）
    const userRole = getUserRole();
    
    // 设置导航菜单
    setupNavigation(userRole);
    
    // 设置时间问候语
    updateGreeting();
    
    // 初始化标签页
    initTabs();
    
    // 退出按钮事件
    document.getElementById('logout-btn').addEventListener('click', function() {
        // 实际应用中这里应该调用退出API
        alert('您已退出系统');
        // window.location.href = '/login';
    });
});

// 获取用户角色（模拟）
function getUserRole() {
    // 实际应用中应从后端API获取
    return "admin"; // 可以是 'admin', 'editor', 'viewer' 等
}

// 设置导航菜单
function setupNavigation(role) {
    const navLinks = document.getElementById('nav-links');
    
    const links = [
        { text: "用户管理", href: "#", roles: ["admin"] },
        { text: "题库管理", href: "/question-management", roles: ["admin", "editor"] },
        { text: "组卷系统", href: "/question-selection", roles: ["admin", "editor"] },
        { text: "任务管理", href: "/task-management", roles: ["admin", "editor"] }
    ];
    
    // 清空现有链接
    navLinks.innerHTML = '';
    
    // 根据角色添加链接
    links.forEach(link => {
        if (link.roles.includes(role)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            li.appendChild(a);
            navLinks.appendChild(li);
        }
    });
}

// 更新时间问候语
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
    
    document.getElementById('username-display').textContent = `${greeting}，管理员`;
}

// 初始化标签页
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContent = document.getElementById('tab-content');
    
    // 默认加载第一个标签页
    loadTabContent('user-list');
    
    // 为每个标签按钮添加点击事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新活动标签样式
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 加载对应标签内容
            const tabId = this.getAttribute('data-tab');
            loadTabContent(tabId);
        });
    });
}

// 加载标签页内容
function loadTabContent(tabId) {
    const tabContent = document.getElementById('tab-content');
    
    switch(tabId) {
        case 'user-list':
            tabContent.innerHTML = `
                <div class="table-controls">
                    <div class="search-box">
                        <input type="text" placeholder="搜索用户...">
                        <button class="rounded-button">搜索</button>
                    </div>
                    <button class="rounded-button" id="add-user-btn">添加用户</button>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>用户名</th>
                            <th>角色</th>
                            <th>部门</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>admin</td>
                            <td>管理员</td>
                            <td>信息技术部</td>
                            <td><span class="status active">活跃</span></td>
                            <td>
                                <button class="rounded-button action-btn edit-btn">编辑</button>
                                <button class="rounded-button action-btn delete-btn">删除</button>
                            </td>
                        </tr>
                        <!-- 更多用户行... -->
                    </tbody>
                </table>
                
                <div class="pagination">
                    <button class="rounded-button">上一页</button>
                    <span>1/5</span>
                    <button class="rounded-button">下一页</button>
                </div>
            `;
            break;
            
        case 'role-management':
            tabContent.innerHTML = `
                <div class="table-controls">
                    <button class="rounded-button" id="add-role-btn">添加角色</button>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>角色ID</th>
                            <th>角色名称</th>
                            <th>权限数量</th>
                            <th>用户数量</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>管理员</td>
                            <td>15</td>
                            <td>3</td>
                            <td>
                                <button class="rounded-button action-btn edit-btn">编辑</button>
                                <button class="rounded-button action-btn delete-btn">删除</button>
                            </td>
                        </tr>
                        <!-- 更多角色行... -->
                    </tbody>
                </table>
            `;
            break;
            
        case 'department-management':
            tabContent.innerHTML = `
                <div class="table-controls">
                    <button class="rounded-button" id="add-dept-btn">添加部门</button>
                </div>
                
                <div class="tree-view">
                    <ul>
                        <li>
                            <span>双微集团</span>
                            <ul>
                                <li>
                                    <span>教育研究院</span>
                                    <ul>
                                        <li><span>信息技术部</span></li>
                                        <li><span>学院部</span></li>
                                        <li><span>考试开发中心组</span></li>
                                    </ul>
                                </li>
                                <li><span>排版设计部</span></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            `;
            break;
    }
    
    // 为动态生成的按钮添加事件
    setupDynamicButtons();
}

// 为动态生成的按钮设置事件
function setupDynamicButtons() {
    // 添加用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            showUserForm();
        });
    }
    
    // 编辑按钮
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            alert(`编辑用户: ${name} (ID: ${id})`);
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.cells[0].textContent;
            if (confirm(`确定要删除ID为 ${id} 的用户吗？`)) {
                row.remove();
            }
        });
    });
}

// 显示用户表单（模拟）
function showUserForm() {
    const formHtml = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>添加新用户</h2>
                <form id="user-form">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-group">
                        <label for="role">角色</label>
                        <select id="role" required>
                            <option value="">请选择角色</option>
                            <option value="admin">管理员</option>
                            <option value="editor">编辑</option>
                            <option value="viewer">查看者</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="department">部门</label>
                        <select id="department" required>
                            <option value="">请选择部门</option>
                            <option value="it">信息技术部</option>
                            <option value="edu">教育研究院</option>
                            <option value="design">排版设计部</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="rounded-button cancel-btn">取消</button>
                        <button type="submit" class="rounded-button submit-btn">提交</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHtml);
    
    // 表单提交
    document.getElementById('user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('用户添加成功！');
        document.querySelector('.modal-overlay').remove();
    });
    
    // 取消按钮
    document.querySelector('.cancel-btn').addEventListener('click', function() {
        document.querySelector('.modal-overlay').remove();
    });
}