/**
 * main.js - 书签卡片编辑器的主模块
 * 负责初始化应用和处理全局UI交互
 */

// 主应用类
class BookmarkEditor {
    constructor() {
        // 标签页
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // 模板项
        this.templateItems = document.querySelectorAll('.template-item');
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 切换标签页
    switchTab(tabId) {
        // 更新标签按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        
        // 更新标签内容
        this.tabPanes.forEach(pane => {
            const isActive = pane.id === `${tabId}-tab`;
            pane.style.display = isActive ? 'block' : 'none';
        });
    }
    
    // 应用模板
    applyTemplate(templateId) {
        if (!layerManager) return;
        
        // 获取背景图层
        const backgroundLayer = layerManager.getLayer('background');
        
        // 获取文字图层
        const textLayer = layerManager.getLayer('text');
        
        // 根据模板ID设置不同的样式
        switch (templateId) {
            case 'template1':
                // 红色简约
                if (backgroundLayer) {
                    backgroundLayer.setData({
                        type: 'solid',
                        color: '#8B0000'
                    });
                }
                
                if (textLayer) {
                    textLayer.setData({
                        content: '红色简约书签',
                        direction: 'vertical',
                        font: 'SimSun',
                        size: 28,
                        color: '#FFFFFF',
                        x: 100,
                        y: 100,
                        shadow: true,
                        outline: false
                    });
                }
                break;
                
            case 'template2':
                // 粉色渐变
                if (backgroundLayer) {
                    backgroundLayer.setData({
                        type: 'gradient',
                        gradient: {
                            type: 'linear',
                            angle: 45,
                            stops: [
                                { color: '#ff9a9e', position: 0 },
                                { color: '#fad0c4', position: 100 }
                            ]
                        }
                    });
                }
                
                if (textLayer) {
                    textLayer.setData({
                        content: '粉色渐变书签',
                        direction: 'vertical',
                        font: 'Microsoft YaHei',
                        size: 24,
                        color: '#FFFFFF',
                        x: 100,
                        y: 150,
                        shadow: true,
                        outline: false
                    });
                }
                break;
                
            case 'template3':
                // 海浪纹理
                if (backgroundLayer) {
                    // 创建海浪图片
                    const img = new Image();
                    img.onload = () => {
                        backgroundLayer.setData({
                            type: 'image',
                            image: img,
                            imageRepeat: 'repeat',
                            imageOpacity: 80
                        });
                        
                        // 重新渲染
                        if (canvasManager) canvasManager.render();
                    };
                    img.src = 'assets/textures/waves.jpg';
                }
                
                if (textLayer) {
                    textLayer.setData({
                        content: '海浪纹理书签',
                        direction: 'vertical',
                        font: 'KaiTi',
                        size: 30,
                        color: '#FFFFFF',
                        x: 100,
                        y: 120,
                        shadow: false,
                        outline: true
                    });
                }
                break;
                
            case 'template4':
                // 斜条纹
                if (backgroundLayer) {
                    backgroundLayer.setData({
                        type: 'pattern',
                        pattern: {
                            type: 'stripes',
                            color1: '#606dbc',
                            color2: '#465298',
                            size: 20,
                            angle: 45
                        }
                    });
                }
                
                if (textLayer) {
                    textLayer.setData({
                        content: '斜条纹书签',
                        direction: 'vertical',
                        font: 'Arial',
                        size: 26,
                        color: '#FFFFFF',
                        x: 100,
                        y: 130,
                        shadow: true,
                        outline: false
                    });
                }
                break;
        }
        
        // 更新UI
        if (backgroundManager) backgroundManager.updateUI();
        if (textManager) textManager.updateUI();
        
        // 重新渲染
        if (canvasManager) canvasManager.render();
    }
    
    // 绑定事件
    bindEvents() {
        // 标签页切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // 模板应用
        this.templateItems.forEach(item => {
            item.addEventListener('click', () => {
                const templateId = item.getAttribute('data-template');
                this.applyTemplate(templateId);
            });
        });
    }
}

// 创建主应用实例
let bookmarkEditor;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主应用
    bookmarkEditor = new BookmarkEditor();
    
    // 创建示例海浪纹理图片
    createExampleTexture();
});
