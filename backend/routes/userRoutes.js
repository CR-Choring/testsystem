const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 认证中间件
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未授权访问' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: '无效的令牌' });
    }
};

// 登录路由
router.post('/login', async (req, res) => {
    try {
        const user = await userController.login(req.body.username, req.body.password);
        
        // 生成JWT令牌
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
        
        res.json({
            token,
            user
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// 用户管理路由（需要认证）
router.use(authenticate);

// 获取所有用户
router.get('/', async (req, res) => {
    try {
        const users = await userController.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建用户
router.post('/', async (req, res) => {
    try {
        const userId = await userController.createUser(req.body);
        res.status(201).json({ id: userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新用户
router.put('/:id', async (req, res) => {
    try {
        await userController.updateUser(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除用户
router.delete('/:id', async (req, res) => {
    try {
        await userController.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 获取角色列表
router.get('/roles', async (req, res) => {
    try {
        const roles = await userController.getAllRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取部门列表
router.get('/departments', async (req, res) => {
    try {
        const departments = await userController.getAllDepartments();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;