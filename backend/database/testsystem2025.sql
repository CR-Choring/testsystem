-- 创建部门表
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT DEFAULT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建角色表
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    permissions JSON NOT NULL COMMENT 'JSON格式的权限配置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt哈希密码',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    department_id INT NOT NULL,
    status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== 初始化部门数据 ========== --
INSERT INTO departments (name, parent_id, description) VALUES 
('双微集团', NULL, '集团公司总部'),
('总编室', 1, '负责整体内容策划与审核'),
('排版组', 1, '专业排版团队'),
('编辑处', 1, '内容编辑与审核团队'),
('信息技术部', 1, '系统开发与维护');

-- ========== 初始化角色数据 ========== --
-- 管理员（Admin）
INSERT INTO roles (name, description, permissions) VALUES (
    'Admin',
    '系统管理员',
    JSON_OBJECT(
        'user_management', true,
        'question_management', true,
        'question_input', true,
        'question_selection', true,
        'task_management', true,
        'typesetting', true,
        'typesetting_management', true,
        'image_management', true,
        'all', true
    )
);

-- 总编室员工（Editorial Staff）
INSERT INTO roles (name, description, permissions) VALUES (
    'Editorial Staff',
    '总编室员工',
    JSON_OBJECT(
        'question_management', true,
        'question_input', true,
        'question_selection', true,
        'task_management', true,
        'typesetting', true,
        'typesetting_management', true,
        'image_management', true
    )
);

-- 排版员（Typesetter）
INSERT INTO roles (name, description, permissions) VALUES (
    'Typesetter',
    '排版员',
    JSON_OBJECT(
        'question_input', true,
        'question_selection', true,
        'task_management', true,
        'typesetting', true,
        'typesetting_management', true
    )
);

-- 编辑处员工（Editor）
INSERT INTO roles (name, description, permissions) VALUES (
    'Editor',
    '编辑处员工',
    JSON_OBJECT(
        'question_management', true,
        'task_management', true,
        'image_management', true,
        'typesetting_management', true
    )
);

-- ========== 初始化用户数据 ========== --
-- 管理员（Admin） - 总编室
-- 密码：Admin@1234
INSERT INTO users (username, password, full_name, email, role_id, department_id) VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqUV3a7fV3sAgnb5qxgS6d6X8Bq1K',
    '系统管理员',
    'admin@shuangwei.com',
    (SELECT id FROM roles WHERE name = 'Admin'),
    (SELECT id FROM departments WHERE name = '总编室')
);

-- 总编室员工（Editorial Staff） - 总编室
-- 密码：Editorial@1234
INSERT INTO users (username, password, full_name, email, role_id, department_id) VALUES (
    'editorial_staff1',
    '$2a$10$4kz1ZJXfCwLbGd5UfWq0Ue6X1rVcD9yLmN0oP3qR2sT4uV5wY6z7A8',
    '张编辑',
    'zhang@shuangwei.com',
    (SELECT id FROM roles WHERE name = 'Editorial Staff'),
    (SELECT id FROM departments WHERE name = '总编室')
);

-- 排版员（Typesetter） - 排版组
-- 密码：Typesetter@1234
INSERT INTO users (username, password, full_name, email, role_id, department_id) VALUES (
    'typesetter1',
    '$2a$10$7bH8jK9lM0nO1pQ2rS3tUv4w5x6y7z8A9B0C1D2E3F4G5H6I7J8K9L',
    '王排版',
    'wang@shuangwei.com',
    (SELECT id FROM roles WHERE name = 'Typesetter'),
    (SELECT id FROM departments WHERE name = '排版组')
);

-- 编辑处员工（Editor） - 编辑处
-- 密码：Editor@1234
INSERT INTO users (username, password, full_name, email, role_id, department_id) VALUES (
    'editor1',
    '$2a$10$2c4e6g8i0k2m4o6q8s0u2w4y6z8a0b2d4f6h8j0l2n4p6r8t0v2x4z',
    '李编辑',
    'li@shuangwei.com',
    (SELECT id FROM roles WHERE name = 'Editor'),
    (SELECT id FROM departments WHERE name = '编辑处')
);

-- ========== 部门视图 ========== --
CREATE VIEW department_details AS
SELECT 
    d1.id,
    d1.name,
    d1.description,
    d2.name AS parent_department,
    COUNT(u.id) AS staff_count,
    d1.created_at
FROM departments d1
LEFT JOIN departments d2 ON d1.parent_id = d2.id
LEFT JOIN users u ON u.department_id = d1.id
GROUP BY d1.id;

-- ========== 用户视图 ========== --
CREATE VIEW user_details AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.email,
    r.name AS role_name,
    d.name AS department_name,
    u.status,
    u.last_login_at,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN departments d ON u.department_id = d.id;

-- ========== 权限检查函数 ========== --
DELIMITER //

CREATE FUNCTION has_permission(
    user_id INT, 
    permission_key VARCHAR(50)
) RETURNS BOOLEAN
BEGIN
    DECLARE user_role_id INT;
    DECLARE perm_value BOOLEAN;
    DECLARE has_all BOOLEAN;
    
    -- 获取用户角色ID
    SELECT role_id INTO user_role_id FROM users WHERE id = user_id;
    
    -- 检查是否拥有所有权限
    SELECT JSON_EXTRACT(permissions, '$.all') = true INTO has_all 
    FROM roles WHERE id = user_role_id;
    
    IF has_all THEN
        RETURN TRUE;
    END IF;
    
    -- 检查特定权限
    SELECT JSON_EXTRACT(permissions, CONCAT('$.', permission_key)) = true INTO perm_value
    FROM roles WHERE id = user_role_id;
    
    RETURN COALESCE(perm_value, FALSE);
END //

DELIMITER ;

-- ========== 部门管理存储过程 ========== --
DELIMITER //

-- 获取部门树
CREATE PROCEDURE get_department_tree()
BEGIN
    SELECT 
        d1.id,
        d1.name,
        d1.description,
        d2.name AS parent_department,
        (SELECT COUNT(*) FROM users u WHERE u.department_id = d1.id) AS staff_count
    FROM departments d1
    LEFT JOIN departments d2 ON d1.parent_id = d2.id
    ORDER BY d1.parent_id, d1.name;
END //

-- 添加部门
CREATE PROCEDURE add_department(
    IN dept_name VARCHAR(100),
    IN parent_id INT,
    IN dept_description VARCHAR(255)
)
BEGIN
    INSERT INTO departments (name, parent_id, description)
    VALUES (dept_name, parent_id, dept_description);
END //

-- 更新部门
CREATE PROCEDURE update_department(
    IN dept_id INT,
    IN dept_name VARCHAR(100),
    IN parent_id INT,
    IN dept_description VARCHAR(255)
)
BEGIN
    UPDATE departments
    SET 
        name = dept_name,
        parent_id = parent_id,
        description = dept_description,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = dept_id;
END //

-- 删除部门（只能删除没有子部门和员工的部门）
CREATE PROCEDURE delete_department(IN dept_id INT)
BEGIN
    DECLARE child_count INT;
    DECLARE staff_count INT;
    
    -- 检查是否有子部门
    SELECT COUNT(*) INTO child_count 
    FROM departments 
    WHERE parent_id = dept_id;
    
    -- 检查是否有员工
    SELECT COUNT(*) INTO staff_count 
    FROM users 
    WHERE department_id = dept_id;
    
    IF child_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '无法删除包含子部门的部门';
    ELSEIF staff_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '无法删除包含员工的部门';
    ELSE
        DELETE FROM departments WHERE id = dept_id;
    END IF;
END //

DELIMITER ;