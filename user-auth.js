// 用户认证模块
const UserAuth = {
    // 当前登录用户
    currentUser: null,
    
    // 初始化用户认证
    init: function() {
        // 尝试从localStorage加载登录状态
        this.loadUserFromStorage();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 更新UI以反映登录状态
        this.updateLoginUI();
    },
    
    // 从localStorage加载用户
    loadUserFromStorage: function() {
        try {
            const savedUser = localStorage.getItem('musicPlayerCurrentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.loadUserData();
            }
        } catch (error) {
            console.error('加载用户数据失败:', error);
            this.currentUser = null;
        }
    },
    
    // 保存用户到localStorage
    saveUserToStorage: function() {
        try {
            if (this.currentUser) {
                localStorage.setItem('musicPlayerCurrentUser', JSON.stringify(this.currentUser));
                this.saveUserData();
            } else {
                localStorage.removeItem('musicPlayerCurrentUser');
            }
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    },
    
    // 加载用户特定的数据（收藏和历史）
    loadUserData: function() {
        try {
            if (this.currentUser) {
                const userFavorites = localStorage.getItem(`user_${this.currentUser.username}_favorites`);
                const userHistory = localStorage.getItem(`user_${this.currentUser.username}_history`);
                
                // 确保加载用户数据，即使是空的
                if (typeof favoriteSongs !== 'undefined') {
                    favoriteSongs = userFavorites ? JSON.parse(userFavorites) : [];
                }
                
                if (typeof historySongs !== 'undefined') {
                    historySongs = userHistory ? JSON.parse(userHistory) : [];
                }
            } else {
                // 未登录状态加载默认数据
                if (typeof favoriteSongs !== 'undefined') {
                    const defaultFavorites = localStorage.getItem('musicPlayerFavorites');
                    favoriteSongs = defaultFavorites ? JSON.parse(defaultFavorites) : [];
                }
                
                if (typeof historySongs !== 'undefined') {
                    const defaultHistory = localStorage.getItem('musicPlayerHistory');
                    historySongs = defaultHistory ? JSON.parse(defaultHistory) : [];
                }
            }
        } catch (error) {
            console.error('加载用户特定数据失败:', error);
            // 出错时设置为空数组以避免应用崩溃
            if (typeof favoriteSongs !== 'undefined') favoriteSongs = [];
            if (typeof historySongs !== 'undefined') historySongs = [];
        }
    },
    
    // 保存用户特定的数据
    saveUserData: function() {
        try {
            if (this.currentUser) {
                localStorage.setItem(`user_${this.currentUser.username}_favorites`, JSON.stringify(favoriteSongs));
                localStorage.setItem(`user_${this.currentUser.username}_history`, JSON.stringify(historySongs));
            }
            return true;
        } catch (error) {
            console.error('保存用户特定数据失败:', error);
            return false;
        }
    },
    
    // 创建用户数据存储结构
    createUserData: function(username) {
        // 为新用户创建空的收藏和历史记录
        localStorage.setItem(`user_${username}_favorites`, JSON.stringify([]));
        localStorage.setItem(`user_${username}_history`, JSON.stringify([]));
    },
    
    // 注册方法
    register: function(username, password, confirmPassword) {
        // 验证用户名
        if (!username || username.trim() === '') {
            return { success: false, message: '用户名不能为空' };
        }
        
        // 验证密码长度
        if (password.length < 6) {
            return { success: false, message: '密码长度至少为6位' };
        }
        
        // 验证密码是否一致
        if (password !== confirmPassword) {
            return { success: false, message: '两次输入的密码不一致' };
        }
        
        // 检查用户是否已存在
        const existingUsers = this.getExistingUsers();
        if (existingUsers.some(user => user.username === username)) {
            return { success: false, message: '用户名已存在，请使用其他用户名' };
        }
        
        // 创建新用户
        existingUsers.push({ username: username, password: password });
        this.saveExistingUsers(existingUsers);
        
        // 为新用户创建数据存储
        this.createUserData(username);
        
        return { success: true, message: '注册成功，请登录' };
    },
    
    // 模拟用户登录
    login: function(username, password) {
        // 这里使用模拟登录，实际应用中应该调用后端API
        // 验证密码长度至少为6位
        if (password.length < 6) {
            return { success: false, message: '密码长度至少为6位' };
        }
        
        // 检查用户名是否为空
        if (!username || username.trim() === '') {
            return { success: false, message: '用户名不能为空' };
        }
        
        // 检查用户是否存在
        const existingUsers = this.getExistingUsers();
        const user = existingUsers.find(user => user.username === username);
        
        if (!user) {
            return { success: false, message: '用户不存在，请先注册' };
        }
        
        // 验证密码
        if (user.password !== password) {
            return { success: false, message: '用户名或密码错误' };
        }
        
        // 保存当前用户数据（如果已登录）
        if (this.currentUser) {
            this.saveUserData();
        }
        
        // 设置当前用户
        this.currentUser = { username: username };
        
        // 加载用户数据
        this.loadUserData();
        
        // 保存用户状态
        this.saveUserToStorage();
        
        // 更新UI
        this.updateLoginUI();
        
        // 刷新所有收藏按钮状态，使其与用户的收藏列表一致
        setTimeout(() => {
            if (window.FavoritesManager && typeof FavoritesManager.handleViewRefresh === 'function') {
                FavoritesManager.handleViewRefresh();
            }
        }, 100);
        
        return { success: true, message: '登录成功' };
    },
    
    // 用户登出
    logout: function() {
        // 保存用户数据
        this.saveUserData();
        
        // 清除当前用户
        this.currentUser = null;
        
        // 清除localStorage中的登录状态
        localStorage.removeItem('musicPlayerCurrentUser');
        
        // 加载默认数据（未登录状态）
        this.loadUserData();
        
        // 更新UI
        this.updateLoginUI();
        
        // 刷新所有收藏按钮状态为未收藏
        setTimeout(() => {
            // 先清空收藏数据
            if (typeof favoriteSongs !== 'undefined') {
                favoriteSongs = [];
            }
            
            // 然后刷新UI
            if (window.FavoritesManager && typeof FavoritesManager.handleViewRefresh === 'function') {
                FavoritesManager.handleViewRefresh();
            }
        }, 100);
    },
    
    // 获取所有已存在的用户
    getExistingUsers: function() {
        try {
            const users = localStorage.getItem('musicPlayerUsers');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
        }
    },
    
    // 保存所有用户
    saveExistingUsers: function(users) {
        try {
            localStorage.setItem('musicPlayerUsers', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('保存用户列表失败:', error);
            return false;
        }
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 监听登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                
                const result = this.login(username, password);
                
                if (result.success) {
                    // 关闭登录模态框
                    this.hideLoginModal();
                    
                    // 显示成功消息
                    this.showMessage('登录成功！', 'success');
                } else {
                    // 显示错误消息
                    this.showMessage(result.message, 'error');
                }
            });
        }
        
        // 监听注册表单提交
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('registerUsername').value;
                const password = document.getElementById('registerPassword').value;
                const confirmPassword = document.getElementById('registerConfirmPassword').value;
                
                const result = this.register(username, password, confirmPassword);
                
                if (result.success) {
                    // 切换回登录表单
                    this.switchToLoginTab();
                    
                    // 清空注册表单
                    this.clearRegisterForm();
                    
                    // 显示成功消息
                    this.showMessage(result.message, 'success');
                } else {
                    // 显示错误消息
                    this.showMessage(result.message, 'error');
                }
            });
        }
        
        // 监听登录选项卡点击
        const loginTab = document.getElementById('loginTab');
        if (loginTab) {
            loginTab.addEventListener('click', () => {
                this.switchToLoginTab();
            });
        }
        
        // 监听注册选项卡点击
        const registerTab = document.getElementById('registerTab');
        if (registerTab) {
            registerTab.addEventListener('click', () => {
                this.switchToRegisterTab();
            });
        }
        
        // 监听关闭登录模态框按钮
        const closeLoginModal = document.getElementById('closeLoginModal');
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }
        
        // 监听模态框外部点击关闭
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.hideLoginModal();
                }
            });
        }
        
        // 监听登录按钮点击
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.showLoginModal();
            });
        }
        
        // 监听登出按钮点击
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
                this.showMessage('已登出', 'info');
            });
        }
        
        // 监听收藏和历史操作，确保数据关联到用户
        document.addEventListener('favoritesChanged', () => {
            this.saveUserData();
        });
        
        // 监听歌曲播放，确保历史记录关联到用户
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.addEventListener('ended', () => {
                this.saveUserData();
            });
        }
    },
    
    // 切换到登录选项卡
    switchToLoginTab: function() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.add('text-primary', 'border-b-2', 'border-primary');
            loginTab.classList.remove('text-gray-400');
            registerTab.classList.add('text-gray-400');
            registerTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    },
    
    // 切换到注册选项卡
    switchToRegisterTab: function() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginTab && registerTab && loginForm && registerForm) {
            registerTab.classList.add('text-primary', 'border-b-2', 'border-primary');
            registerTab.classList.remove('text-gray-400');
            loginTab.classList.add('text-gray-400');
            loginTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        }
    },
    
    // 清空注册表单
    clearRegisterForm: function() {
        const registerUsername = document.getElementById('registerUsername');
        const registerPassword = document.getElementById('registerPassword');
        const registerConfirmPassword = document.getElementById('registerConfirmPassword');
        
        if (registerUsername) registerUsername.value = '';
        if (registerPassword) registerPassword.value = '';
        if (registerConfirmPassword) registerConfirmPassword.value = '';
    },
    
    // 显示登录模态框
    showLoginModal: function() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // 清空表单
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.reset();
            }
            
            loginModal.style.display = 'flex';
            // 移除可能存在的active类
            loginModal.classList.remove('active');
            // 触发重排
            void loginModal.offsetWidth;
            // 添加active类
            setTimeout(() => {
                loginModal.classList.add('active');
            }, 10);
        }
    },
    
    // 隐藏登录模态框
    hideLoginModal: function() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        }
    },
    
    // 更新登录相关UI
    updateLoginUI: function() {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const userInfo = document.getElementById('userInfo');
        const usernameDisplay = document.getElementById('usernameDisplay');
        
        if (this.currentUser) {
            // 用户已登录
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = this.currentUser.username;
        } else {
            // 用户未登录
            if (loginButton) loginButton.style.display = 'flex';
            if (logoutButton) logoutButton.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    },
    
    // 显示消息提示
    showMessage: function(message, type = 'info') {
        // 检查是否已存在消息元素
        let messageElement = document.getElementById('authMessage');
        
        if (!messageElement) {
            // 创建消息元素
            messageElement = document.createElement('div');
            messageElement.id = 'authMessage';
            messageElement.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg z-50 transition-all duration-300 opacity-0 translate-y-[-20px]';
            document.body.appendChild(messageElement);
        }
        
        // 设置消息内容和样式
        messageElement.textContent = message;
        
        // 根据消息类型设置样式
        messageElement.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg z-50 transition-all duration-300 opacity-0 translate-y-[-20px] shadow-lg';
        
        if (type === 'success') {
            messageElement.classList.add('bg-green-500', 'text-white');
        } else if (type === 'error') {
            messageElement.classList.add('bg-red-500', 'text-white');
        } else {
            messageElement.classList.add('bg-blue-500', 'text-white');
        }
        
        // 显示消息
        setTimeout(() => {
            messageElement.classList.remove('opacity-0', 'translate-y-[-20px]');
        }, 10);
        
        // 3秒后隐藏消息
        setTimeout(() => {
            messageElement.classList.add('opacity-0', 'translate-y-[-20px]');
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }, 3000);
    }
};

// 当DOM加载完成后初始化用户认证模块
document.addEventListener('DOMContentLoaded', function() {
    // 等待主页面的FavoritesManager和其他功能加载完成
    setTimeout(() => {
        try {
            UserAuth.init();
        } catch (error) {
            console.error('用户认证模块初始化失败:', error);
        }
    }, 100);
});

// 导出模块
try {
    // 尝试作为ES模块导出
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = UserAuth;
    }
} catch (e) {
    // 如果不是Node环境，忽略导出错误
}