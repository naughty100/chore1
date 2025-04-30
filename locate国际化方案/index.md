# 网站多语言国际化方案

## 多语言资源管理核心方案

### 1. 多语言资源管理方式

#### 1.1 语言资源存储方式

**键值对存储**：
- 使用 JSON/YAML 格式存储翻译文本
- 按语言划分不同文件或在同一文件中区分不同语言
- 推荐结构化命名规则，如 `page.component.textName`

```json
// en.json
{
  "home": {
    "welcome": "Welcome to our website",
    "search": "Search"
  }
}

// ja.json
{
  "home": {
    "welcome": "ウェブサイトへようこそ",
    "search": "検索"
  }
}
```

#### 1.2 语言资源获取方式
##### 1. 动态加载

根据用户选择的语言按需加载对应资源文件：

```javascript
// 按需动态加载语言包
const loadLocaleResource = async (locale) => {
  try {
    const module = await import(`./locales/${locale}.json`);
    i18n.addResourceBundle(locale, 'translation', module.default);
    i18n.changeLanguage(locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
    i18n.changeLanguage('en'); // 回退到默认语言
  }
};

// 语言切换时调用
function switchLanguage(newLocale) {
  loadLocaleResource(newLocale);
}
```

**适用场景**：
- 支持多种语言（4种以上）
- 翻译内容较多
- 用户通常只使用1-2种语言

**优缺点**：
- ✅ 减小初始加载体积
- ✅ 按需加载提高效率
- ✅ 可以按模块/页面分割语言包
- ❌ 首次切换语言时有加载延迟

##### 3. API请求

通过后端API动态获取翻译内容：

```javascript
// 从API获取语言资源
const fetchTranslations = async (locale) => {
  try {
    const response = await fetch(`/api/translations/${locale}`);
    if (!response.ok) throw new Error('Failed to fetch translations');
    
    const translations = await response.json();
    i18n.addResourceBundle(locale, 'translation', translations);
    i18n.changeLanguage(locale);
    
    // 缓存到本地存储
    localStorage.setItem(`translations_${locale}`, JSON.stringify(translations));
    localStorage.setItem('translationLastUpdate', new Date().toUTCString());
  } catch (error) {
    console.error('Error loading translations:', error);
    
    // 尝试从本地缓存加载
    const cachedTranslations = localStorage.getItem(`translations_${locale}`);
    if (cachedTranslations) {
      i18n.addResourceBundle(locale, 'translation', JSON.parse(cachedTranslations));
      i18n.changeLanguage(locale);
    } else {
      i18n.changeLanguage('en'); // 回退到默认语言
    }
  }
};
```

**适用场景**：
- 翻译内容频繁更新
- 需要个性化/动态翻译内容
- 内容量大且需要版本控制

**优缺点**：
- ✅ 无需重新部署即可更新翻译
- ✅ 可以针对用户提供个性化翻译
- ✅ 支持增量更新
- ❌ 依赖网络连接
- ❌ 需要后端支持和额外API维护

### 2. 前端组件国际化实现

#### 2.1 React中的实现 (使用react-i18next)

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function Header() {
  // 获取翻译函数和i18n实例
  const { t, i18n } = useTranslation();
  
  return (
    <header>
      {/* 基础文本翻译 */}
      <h1>{t('header.welcome')}</h1>
      
      {/* 带参数的翻译 */}
      <p>{t('header.greeting', { name: 'Alex' })}</p>
      
      {/* 复数形式 */}
      <p>{t('header.items', { count: 5 })}</p>
      
      {/* 语言切换 */}
      <div className="language-switcher">
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('ja')}>日本語</button>
      </div>
    </header>
  );
}

// HOC包装整个应用或按需使用
export default withTranslation()(App);
```

#### 2.2 Vue中的实现 (使用vue-i18n)

```vue
<template>
  <div>
    <!-- 基础文本翻译 -->
    <h1>{{ $t('header.welcome') }}</h1>
    
    <!-- 带参数的翻译 -->
    <p>{{ $t('header.greeting', { name: 'Alex' }) }}</p>
    
    <!-- 复数形式 -->
    <p>{{ $tc('header.items', count) }}</p>
    
    <!-- HTML内容翻译 -->
    <p v-html="$t('header.htmlContent')"></p>
    
    <!-- 语言切换 -->
    <select v-model="$i18n.locale">
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 5
    }
  }
}
</script>
```

### 3. 高级优化策略

#### 3.1 按路由/页面分割语言包

```javascript
// 路由守卫中动态加载页面翻译
router.beforeEach(async (to, from, next) => {
  const currentLocale = i18n.language;
  
  try {
    // 只加载当前页面需要的翻译
    const pageTranslation = await import(`./locales/${currentLocale}/pages/${to.name}.json`);
    i18n.addResourceBundle(currentLocale, to.name, pageTranslation.default, true);
  } catch (e) {
    console.warn(`No translations for page ${to.name}`);
  }
  
  next();
});
```

#### 3.2 命名空间划分

将翻译按功能模块拆分，按需加载：

```javascript
// 只在需要时加载特定功能模块的翻译
async function loadCheckoutTranslations() {
  // 加载结账页面的翻译命名空间
  await i18n.loadNamespaces('checkout');
  renderCheckoutForm();
}

// 使用特定命名空间的翻译
function renderCheckoutForm() {
  const title = i18n.t('checkout:title');
  document.getElementById('checkout-title').textContent = title;
}
```

#### 3.3 增量更新检查

```javascript
// 定期检查翻译更新
function setupTranslationUpdater(intervalMinutes = 60) {
  setInterval(async () => {
    const currentLocale = i18n.language;
    const lastUpdate = localStorage.getItem('translationLastUpdate');
    
    try {
      const response = await fetch(`/api/translations/${currentLocale}/updates`, {
        headers: {
          'If-Modified-Since': lastUpdate || ''
        }
      });
      
      if (response.status === 200) {
        // 有新翻译可用
        const updates = await response.json();
        i18n.addResourceBundle(currentLocale, 'translation', updates, true, true);
        localStorage.setItem('translationLastUpdate', new Date().toUTCString());
      }
    } catch (error) {
      console.warn('Failed to check for translation updates');
    }
  }, intervalMinutes * 60 * 1000);
}
```

### 4. 实用开发模式与最佳实践

#### 4.1 自动提取翻译键

使用工具自动从代码中提取需要翻译的文本：

```javascript
// 使用 i18next-scanner 等工具扫描代码中的翻译键
// package.json
{
  "scripts": {
    "extract-translations": "i18next-scanner --config i18next-scanner.config.js 'src/**/*.{js,jsx,vue}'"
  }
}
```

#### 4.2 开发模式下的辅助功能

```javascript
// 开发环境下显示缺失翻译的键名
if (process.env.NODE_ENV === 'development') {
  i18n.on('missingKey', (lng, ns, key) => {
    console.warn(`Missing translation: [${lng}] ${ns}:${key}`);
  });
}

// 可视化标记未翻译内容
const showMissingTranslations = true;
if (showMissingTranslations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (!i18n.exists(key)) {
      element.style.border = '1px dashed red';
      element.title = `Missing translation: ${key}`;
    }
  });
}
```

#### 4.3 可维护性最佳实践

1. **避免字符串拼接**：不要拼接翻译字符串，使用参数替代
   ```javascript
   // 错误做法
   t('greeting.start') + username + t('greeting.end')
   
   // 正确做法
   t('greeting.full', { username: username })
   ```

2. **使用命名空间**：按功能或页面组织翻译
   ```javascript
   // 按页面/功能组织
   t('home:welcome')
   t('checkout:paymentTitle')
   ```

3. **为复杂内容使用组件**：翻译包含格式化或复杂HTML的内容
   ```jsx
   // Trans组件处理包含HTML的翻译
   <Trans i18nKey="description">
     请访问 <a href="{{url}}">帮助中心</a> 了解更多
   </Trans>
   ```

4. **集中定义翻译键**：保持键名一致性
   ```javascript
   // 常量定义
   export const TRANSLATION_KEYS = {
     WELCOME: 'home.welcome',
     SEARCH: 'common.search',
     // ...其他键
   };
   
   // 使用常量
   t(TRANSLATION_KEYS.WELCOME)
   ```