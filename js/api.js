// API 服务模块
// 根据环境自动选择API基础URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api'; // 生产环境使用相对路径

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const headers = { ...options.headers };
    // 仅在有 body 且非 GET/HEAD 时设置 Content-Type，避免触发 GET 预检
    if (options.body && method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const config = { ...options, method, headers };

    console.log(`API Request: ${method} ${url}`, config);

    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        // 如果不是JSON，尝试获取文本内容
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
      
      const data = await response.json();
      console.log('API Data received:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 获取所有测试项目
  async getTestProjects() {
    try {
      console.log('Attempting to fetch test projects from API...');
      const data = await this.request('/tests');
      console.log('API response:', data);
      
      // 检查响应格式
      if (data && data.projects && Array.isArray(data.projects)) {
        console.log('Successfully fetched projects from API:', data.projects.length);
        return data.projects;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.warn('Failed to fetch test projects from API, using fallback data', error);
      const fallbackProjects = this.getFallbackProjects();
      console.log('Using fallback projects:', fallbackProjects);
      return fallbackProjects;
    }
  }

  // 获取特定测试项目
  async getTestProject(projectId) {
    try {
      return await this.request(`/tests/${projectId}`);
    } catch (error) {
      console.warn(`Failed to fetch test project ${projectId} from API`);
      // 从fallback数据中查找
      const fallbackProjects = this.getFallbackProjects();
      return fallbackProjects.find(p => p.id === projectId) || null;
    }
  }

  // 获取测试题目
  async getTestQuestions(projectId) {
    try {
      const data = await this.request(`/tests/${projectId}/questions`);
      return data.questions;
    } catch (error) {
      console.warn(`Failed to fetch questions for ${projectId} from API`);
      return [];
    }
  }

  // 提交测试结果
  async submitTestResult(projectId, answers, sessionId = null) {
    try {
      const result = await this.request('/results', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          answers,
          sessionId,
          ipAddress: null, // 前端无法获取真实IP
          userAgent: navigator.userAgent
        })
      });
      return result;
    } catch (error) {
      console.error('Failed to submit test result:', error);
      // 模拟成功提交作为fallback
      return { success: true, message: 'Test completed (offline mode)' };
    }
  }

  // 点赞测试项目
  async likeTestProject(projectId) {
    try {
      const result = await this.request(`/tests/${projectId}/like`, {
        method: 'POST'
      });
      return result;
    } catch (error) {
      console.error('Failed to like test project:', error);
      // 模拟成功点赞作为fallback
      return { success: true, likes: 0 };
    }
  }

  // 获取测试统计
  async getTestStats(projectId) {
    try {
      return await this.request(`/results/stats/${projectId}`);
    } catch (error) {
      console.warn(`Failed to fetch stats for ${projectId}`);
      return { totalTests: 0, totalLikes: 0 };
    }
  }

  // 生成会话ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 兜底数据（当API不可用时）
  getFallbackProjects() {
    return [
      {
        id: 'mbti',
        name: 'MBTI Career Personality Test',
        image: 'assets/images/mbti-career-personality-test.png',
        intro: 'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers. It helps explain why people have different interests, excel at different jobs, and sometimes misunderstand each other. For decades, MBTI has been used worldwide by couples, teachers and students, young people choosing careers, and organizations to improve relationships, team communication, organizational building and diagnostics. In the Fortune 500, 80% of companies have experience applying MBTI.',
        type: 'mbti',
        testedCount: '120K+',
        likes: 13000
      },
      {
        id: 'disc40',
        name: 'DISC Personality Test',
        image: 'assets/images/disc-personality-test.png',
        intro: 'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.',
        type: 'disc40',
        testedCount: '50K+',
        likes: 4500
      }
    ];
  }
}

// 创建全局API服务实例
window.ApiService = new ApiService();
