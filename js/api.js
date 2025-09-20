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
      console.error('Failed to fetch test projects from API', error);
      throw error;
    }
  }

  // 获取特定测试项目
  async getTestProject(projectId) {
    try {
      const response = await this.request(`/tests/${projectId}`);
      return response.project || response;
    } catch (error) {
      console.error(`Failed to fetch test project ${projectId} from API`, error);
      throw error;
    }
  }

  // 获取测试题目
  async getTestQuestions(projectId) {
    try {
      const data = await this.request(`/tests/${projectId}/questions`);
      return data.questions;
    } catch (error) {
      console.error(`Failed to fetch questions for ${projectId} from API`, error);
      throw error;
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
      throw error;
    }
  }

  // 点赞/取消点赞测试项目
  async likeTestProject(projectId, action = 'toggle') {
    try {
      const result = await this.request(`/tests/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      return result;
    } catch (error) {
      console.error('Failed to like test project:', error);
      throw error;
    }
  }

  // 检查用户点赞状态
  async checkLikeStatus(projectId) {
    try {
      const result = await this.request(`/tests/${projectId}/like-status`, {
        method: 'GET'
      });
      return result;
    } catch (error) {
      console.error('Failed to check like status:', error);
      throw error;
    }
  }

  // 获取测试统计
  async getTestStats(projectId) {
    try {
      return await this.request(`/results/stats/${projectId}`);
    } catch (error) {
      console.error(`Failed to fetch stats for ${projectId}`, error);
      throw error;
    }
  }

  // 生成会话ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // -----------------
  // 博客相关 API
  // -----------------
  async getBlogs({ page = 1, pageSize = 12, keyword = '' } = {}) {
    const qs = new URLSearchParams();
    if (page) qs.set('page', String(page));
    if (pageSize) qs.set('pageSize', String(pageSize));
    if (keyword) qs.set('keyword', keyword);
    return await this.request(`/blogs?${qs.toString()}`);
  }

  async getBlogDetail(slug) {
    const v = Date.now();
    return await this.request(`/blogs/${encodeURIComponent(slug)}?v=${v}`);
  }

  async getBlogRecommendations(slug) {
    const v = Date.now();
    return await this.request(`/blogs/${encodeURIComponent(slug)}/recommend?v=${v}`);
  }

  // 兜底数据（当API不可用时）
  getFallbackProjects() {
    return [
      {
        id: 'mbti',
        name: 'MBTIonline Career Personality Test',
        nameEn: 'MBTIonline Career Personality Test',
        image: 'assets/images/mbti-career-personality-test.jpg',
        intro: 'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers. It helps explain why people have different interests, excel at different jobs, and sometimes misunderstand each other. For decades, MBTI has been used worldwide by couples, teachers and students, young people choosing careers, and organizations to improve relationships, team communication, organizational building and diagnostics. In the Fortune 500, 80% of companies have experience applying MBTI.',
        introEn: 'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers. It helps explain why people have different interests, excel at different jobs, and sometimes misunderstand each other. For decades, MBTI has been used worldwide by couples, teachers and students, young people choosing careers, and organizations to improve relationships, team communication, organizational building and diagnostics. In the Fortune 500, 80% of companies have experience applying MBTI.',
        type: 'mbti',
        testedCount: '120K+',
        likes: 13000
      },
      {
        id: 'disc40',
        name: 'DISC Personality Test',
        nameEn: 'DISC Personality Test',
        image: 'assets/images/disc-personality-test.jpg',
        intro: 'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.',
        introEn: 'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.',
        type: 'disc40',
        isJumpType: false,
        testedCount: '50K+',
        likes: 4500
      },
      {
        id: 'mgmt_en',
        name: 'Self-assessment of Management Skills',
        nameEn: 'Self-assessment of Management Skills',
        image: 'assets/images/self-assessment-of-management-skills.jpg',
        intro: 'Do you have a clear sense of purpose and efficient execution ability? This classic test quickly assesses your core management abilities such as planning, decision-making, and self-discipline through 15 questions. After completing the self-test, you will receive targeted ability analysis and improvement directions. Whether it\'s enhancing team efficiency or personal career development, you can find a breakthrough path. Spend a few minutes on the self-test and unlock your management potential!',
        introEn: 'Do you have a clear sense of purpose and efficient execution ability? This classic test quickly assesses your core management abilities such as planning, decision-making, and self-discipline through 15 questions. After completing the self-test, you will receive targeted ability analysis and improvement directions. Whether it\'s enhancing team efficiency or personal career development, you can find a breakthrough path. Spend a few minutes on the self-test and unlock your management potential!',
        type: 'mgmt_en',
        testedCount: '0',
        likes: 0
      },
      {
        id: 'observation',
        name: 'Observation ability test',
        nameEn: 'Observation ability test',
        image: 'assets/images/observation-ability-test.jpg',
        intro: 'Have you truly "seen" rather than just "looked" around you? This test, through 15 situational questions, helps you assess your unconscious observing habits - from detail capture to interpersonal perception, from environmental awareness to inner awareness. Observation is not only the ability to notice details, but also the key to understanding others and connecting with the world. After completing the test, you will receive a precise analysis of your cognitive style, clearly identifying your strengths and blind spots, and learn how to enhance your observation skills to improve communication, decision-making, and even creativity. Don\'t overthink, answer immediately, and unlock your observation potential in just a few minutes!',
        introEn: 'Have you truly "seen" rather than just "looked" around you? This test, through 15 situational questions, helps you assess your unconscious observing habits - from detail capture to interpersonal perception, from environmental awareness to inner awareness. Observation is not only the ability to notice details, but also the key to understanding others and connecting with the world. After completing the test, you will receive a precise analysis of your cognitive style, clearly identifying your strengths and blind spots, and learn how to enhance your observation skills to improve communication, decision-making, and even creativity. Don\'t overthink, answer immediately, and unlock your observation potential in just a few minutes!',
        type: 'observation',
        testedCount: '0',
        likes: 0
      },
      {
        id: 'introversion_en',
        name: 'Professional Test For Introversion vs Extroversion',
        nameEn: 'Professional Test For Introversion vs Extroversion',
        image: 'assets/images/professional-test-for-introversion-extraversion-degree.jpg',
        intro: 'Do you truly understand your social tendencies and energy sources? This professional test, through 70 carefully designed questions, helps you scientifically assess the extroverted and introverted traits in your personality. Extroverts often gain energy from interpersonal interactions, while introverts tend to restore their energy in solitude - and this is not simply a matter of being "lively" or "quiet", but rather about how you think, make decisions and perceive the world.',
        introEn: 'Do you truly understand your social tendencies and energy sources? This professional test, through 70 carefully designed questions, helps you scientifically assess the extroverted and introverted traits in your personality. Extroverts often gain energy from interpersonal interactions, while introverts tend to restore their energy in solitude - and this is not simply a matter of being "lively" or "quiet", but rather about how you think, make decisions and perceive the world.',
        type: 'introversion_extraversion',
        estimatedTime: 15,
        questionCount: 70,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'enneagram_en',
        name: 'Enneagram personality test free',
        nameEn: 'Enneagram personality test free',
        image: 'assets/images/enneagram-personality-test.jpg',
        intro: 'The Enneagram, also known as the Enneatypes or the Nine Personality Types, is a system that has been highly favored by MBA students at renowned international universities such as Stanford in recent years and has become one of the most popular courses. Over the past decade or so, it has gained widespread popularity in academic and business circles in Europe and America.',
        introEn: 'The Enneagram, also known as the Enneatypes or the Nine Personality Types, is a system that has been highly favored by MBA students at renowned international universities such as Stanford in recent years and has become one of the most popular courses. Over the past decade or so, it has gained widespread popularity in academic and business circles in Europe and America.',
        type: 'enneagram',
        estimatedTime: 30,
        questionCount: 180,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'eq_test_en',
        name: 'International Standard Emotional Intelligence Test',
        nameEn: 'International Standard Emotional Intelligence Test',
        image: 'assets/images/international-standard-emotional-intelligence-test.jpg',
        intro: 'Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe.',
        introEn: 'Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe.',
        type: 'eq_test',
        estimatedTime: 15,
        questionCount: 33,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'phil_test_en',
        name: 'Phil personality test',
        nameEn: 'Phil personality test',
        image: 'assets/images/phil-personality-test.jpg',
        intro: 'The Phil Personality Test is a psychological assessment instrument developed by Dr. Phil, a prominent psychologist, during his appearance on the television program hosted by renowned media personality Oprah Winfrey. This test categorizes personality types based on the analysis of behavioral patterns and psychological inclinations.',
        introEn: 'The Phil Personality Test is a psychological assessment instrument developed by Dr. Phil, a prominent psychologist, during his appearance on the television program hosted by renowned media personality Oprah Winfrey. This test categorizes personality types based on the analysis of behavioral patterns and psychological inclinations.',
        type: 'phil_test',
        estimatedTime: 5,
        questionCount: 10,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'four_colors_en',
        name: 'Four-colors Personality Analysis',
        nameEn: 'Four-colors Personality Analysis',
        image: 'assets/images/four-colors-personality-analysis.jpg',
        intro: 'FPA (Four-colors Personality Analysis) provides people with a simple and practical tool that everyone can quickly master and apply in real life and work. No matter what kind of occupation you are engaged in - whether in an office, a hospital, a store, a school or a construction site, you can gain insights into the personality traits of people around you through their dressing styles, job responsibilities and ways of interpersonal communication.',
        introEn: 'FPA (Four-colors Personality Analysis) provides people with a simple and practical tool that everyone can quickly master and apply in real life and work. No matter what kind of occupation you are engaged in - whether in an office, a hospital, a store, a school or a construction site, you can gain insights into the personality traits of people around you through their dressing styles, job responsibilities and ways of interpersonal communication.',
        type: 'four_colors',
        estimatedTime: 15,
        questionCount: 30,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'pdp_test_en',
        name: '行为风格测试 Professional Dyna-Metric Program',
        nameEn: 'Professional Dyna-Metric Program',
        image: 'assets/images/professional-dyna-metric-program.jpg',
        intro: 'PDP, or Professional Dyna-Metric Program, is a tool for behavioral style assessment. Behavioral style refers to the most proficient way of doing things in a person\'s natural endowment. It is a system used to measure an individual\'s behavioral traits, vitality, kinetic energy, stress, energy, and energy fluctuations.',
        introEn: 'PDP, or Professional Dyna-Metric Program, is a tool for behavioral style assessment. Behavioral style refers to the most proficient way of doing things in a person\'s natural endowment. It is a system used to measure an individual\'s behavioral traits, vitality, kinetic energy, stress, energy, and energy fluctuations.',
        type: 'pdp_test',
        estimatedTime: 10,
        questionCount: 30,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'mental_age_test_en',
        name: 'Check mental age test',
        nameEn: 'Check mental age test',
        image: 'assets/images/test-your-mental-age.jpg',
        intro: 'Whether a person is mature cannot be simply defined by their age, because one\'s years of life do not fully align with their behaviors and emotions. Some people are physically mature, yet their actions are as childish as those of a kid. On the other hand, there are individuals who, though still young children, have already gained a good understanding of many truths about the world.',
        introEn: 'Whether a person is mature cannot be simply defined by their age, because one\'s years of life do not fully align with their behaviors and emotions. Some people are physically mature, yet their actions are as childish as those of a kid. On the other hand, there are individuals who, though still young children, have already gained a good understanding of many truths about the world.',
        type: 'mental_age_test',
        estimatedTime: 8,
        questionCount: 20,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'holland_test_en',
        name: 'Holland Occupational Interest Test',
        nameEn: 'Holland Occupational Interest Test',
        image: 'assets/images/holland-occupational-interest-test.jpg',
        intro: 'Are you looking for a suitable career direction for yourself? Are you curious which jobs are more compatible with your personality traits? John Holland, a psychology professor at Johns Hopkins University in the United States and a renowned career guidance expert, put forward the far-reaching "Vocational Interest Theory" as early as 1959.',
        introEn: 'Are you looking for a suitable career direction for yourself? Are you curious which jobs are more compatible with your personality traits? John Holland, a psychology professor at Johns Hopkins University in the United States and a renowned career guidance expert, put forward the far-reaching "Vocational Interest Theory" as early as 1959.',
        type: 'holland_test',
        estimatedTime: 15,
        questionCount: 90,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'kelsey_test_en',
        name: 'Kelsey Temperament Type Test',
        nameEn: 'Kelsey Temperament Type Test',
        image: 'assets/images/kelsey-temperament-type-test.jpg',
        intro: 'The Kiersey Temperament Sorter is a widely utilized psychological assessment tool designed to help individuals understand their inherent temperament traits and behavioral tendencies. Grounded in the Kiersey Temperament Theory, this assessment categorizes human temperaments into four distinct types: Choleric, Sanguine, Melancholic, and Phlegmatic.',
        introEn: 'The Kiersey Temperament Sorter is a widely utilized psychological assessment tool designed to help individuals understand their inherent temperament traits and behavioral tendencies. Grounded in the Kiersey Temperament Theory, this assessment categorizes human temperaments into four distinct types: Choleric, Sanguine, Melancholic, and Phlegmatic.',
        type: 'kelsey_test',
        estimatedTime: 12,
        questionCount: 70,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'temperament_type_test',
        name: 'Temperament Type Test',
        nameEn: 'Temperament Type Test',
        image: 'assets/images/temperament-type-test.jpg',
        intro: 'Temperament refers to the dynamic characteristics of psychological activities, and it is similar to the concepts of "temper" or "natural disposition" commonly used in daily life. As the natural expression of personality traits, temperament is mainly shaped by the neural activity patterns of the brain and acquired habits. There is no distinction between good and bad, or superiority and inferiority, in terms of social value evaluation for different temperament types.',
        introEn: 'Temperament refers to the dynamic characteristics of psychological activities, and it is similar to the concepts of "temper" or "natural disposition" commonly used in daily life. As the natural expression of personality traits, temperament is mainly shaped by the neural activity patterns of the brain and acquired habits. There is no distinction between good and bad, or superiority and inferiority, in terms of social value evaluation for different temperament types.',
        type: 'temperament_type_test',
        estimatedTime: 15,
        questionCount: 60,
        isJumpType: false,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'personality_charm_1min',
        name: 'Find Out Your Personality Charm Level in Just 1 Minute',
        nameEn: 'Find Out Your Personality Charm Level in Just 1 Minute',
        image: 'assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
        intro: 'This ultra-convenient personality charm test can give you the answer in just 1 minute! Branching questions lead to 5 possible results.',
        introEn: 'This ultra-convenient personality charm test can give you the answer in just 1 minute! Branching questions lead to 5 possible results.',
        type: 'personality_charm',
        estimatedTime: 1,
        questionCount: 10,
        isJumpType: true,
        testedCount: '0',
        likes: 0
      },
      {
        id: 'social_anxiety_test',
        name: 'Social Test Anxiety Test',
        nameEn: 'Social Test Anxiety Test',
        image: 'assets/images/social-anxiety-level-test.jpg',
        intro: 'A 15-question scale covering multiple social situations to reflect your level of social anxiety. Not a diagnosis, but a quick self-check.',
        introEn: 'A 15-question scale covering multiple social situations to reflect your level of social anxiety. Not a diagnosis, but a quick self-check.',
        type: 'social_anxiety_test',
        estimatedTime: 6,
        questionCount: 15,
        isJumpType: false,
        testedCount: '0',
        likes: 0
      }
    ];
  }
}

// 创建全局API服务实例
window.ApiService = new ApiService();
