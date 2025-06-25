const bcrypt = require('bcrypt');
const db = require('../config/db');

module.exports = {
    // 用户登录
    login: async (username, password) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length === 0) {
                throw new Error('用户不存在');
            }
            
            const user = rows[0];
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error('密码错误');
            }
            
            // 更新最后登录时间
            await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
            
            return {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role_id: user.role_id,
                department_id: user.department_id
            };
        } catch (error) {
            throw error;
        }
    },
    
    // 获取所有用户
    getAllUsers: async () => {
        try {
            const [rows] = await db.query(`
                SELECT u.id, u.username, u.full_name, u.email, u.status, 
                       r.name AS role_name, d.name AS department_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN departments d ON u.department_id = d.id
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    
    // 创建用户
    createUser: async (userData) => {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const [result] = await db.query(
                'INSERT INTO users (username, password, full_name, email, role_id, department_id) VALUES (?, ?, ?, ?, ?, ?)',
                [userData.username, hashedPassword, userData.full_name, userData.email, userData.role_id, userData.department_id]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },
    
    // 更新用户
    updateUser: async (userId, userData) => {
        try {
            let query = 'UPDATE users SET full_name = ?, email = ?, role_id = ?, department_id = ?';
            const params = [userData.full_name, userData.email, userData.role_id, userData.department_id];
            
            // 如果有新密码，更新密码
            if (userData.password) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                query += ', password = ?';
                params.push(hashedPassword);
            }
            
            query += ' WHERE id = ?';
            params.push(userId);
            
            await db.query(query, params);
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    // 删除用户
    deleteUser: async (userId) => {
        try {
            await db.query('DELETE FROM users WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    // 获取所有角色
    getAllRoles: async () => {
        try {
            const [rows] = await db.query('SELECT id, name FROM roles');
            return rows;
        } catch (error) {
            throw error;
        }
    },
    
    // 获取所有部门
    getAllDepartments: async () => {
        try {
            const [rows] = await db.query('SELECT id, name FROM departments');
            return rows;
        } catch (error) {
            throw error;
        }
    }
};