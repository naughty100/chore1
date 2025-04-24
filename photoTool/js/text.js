/**
 * text.js - 书签卡片编辑器的文字处理模块
 * 负责处理文字相关的UI交互和文字渲染
 */

// 文字管理类
class TextManager {
    constructor() {
        // 获取文字图层
        this.textLayer = null;
        
        // 文字设置控件
        this.textContentInput = document.getElementById('textContent');
        this.textDirectionSelect = document.getElementById('textDirection');
        this.textFontSelect = document.getElementById('textFont');
        this.textSizeInput = document.getElementById('textSize');
        this.textSizeValue = document.getElementById('textSizeValue');
        this.textColorInput = document.getElementById('textColor');
        this.textXInput = document.getElementById('textX');
        this.textXValue = document.getElementById('textXValue');
        this.textYInput = document.getElementById('textY');
        this.textYValue = document.getElementById('textYValue');
        this.textShadowCheckbox = document.getElementById('textShadow');
        this.textOutlineCheckbox = document.getElementById('textOutline');
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 初始化
    init() {
        // 获取文字图层
        if (layerManager) {
            this.textLayer = layerManager.getLayer('text');
            
            // 更新UI
            this.updateUI();
        }
    }
    
    // 更新UI
    updateUI() {
        if (!this.textLayer) return;
        
        const data = this.textLayer.getData();
        
        // 更新文字内容
        this.textContentInput.value = data.content;
        
        // 更新文字方向
        this.textDirectionSelect.value = data.direction;
        
        // 更新字体
        this.textFontSelect.value = data.font;
        
        // 更新字体大小
        this.textSizeInput.value = data.size;
        this.textSizeValue.textContent = `${data.size}px`;
        
        // 更新字体颜色
        this.textColorInput.value = data.color;
        
        // 更新位置
        this.textXInput.value = data.x;
        this.textXValue.textContent = `${data.x}px`;
        this.textYInput.value = data.y;
        this.textYValue.textContent = `${data.y}px`;
        
        // 更新特效
        this.textShadowCheckbox.checked = data.shadow;
        this.textOutlineCheckbox.checked = data.outline;
    }
    
    // 更新文字设置
    updateTextSettings() {
        if (!this.textLayer) return;
        
        const data = this.textLayer.getData();
        
        // 更新文字内容
        data.content = this.textContentInput.value;
        
        // 更新文字方向
        data.direction = this.textDirectionSelect.value;
        
        // 更新字体
        data.font = this.textFontSelect.value;
        
        // 更新字体大小
        data.size = parseInt(this.textSizeInput.value);
        this.textSizeValue.textContent = `${data.size}px`;
        
        // 更新字体颜色
        data.color = this.textColorInput.value;
        
        // 更新位置
        data.x = parseInt(this.textXInput.value);
        this.textXValue.textContent = `${data.x}px`;
        data.y = parseInt(this.textYInput.value);
        this.textYValue.textContent = `${data.y}px`;
        
        // 更新特效
        data.shadow = this.textShadowCheckbox.checked;
        data.outline = this.textOutlineCheckbox.checked;
        
        // 更新文字图层数据
        this.textLayer.setData(data);
        
        // 重新渲染
        this.render();
    }
    
    // 渲染
    render() {
        if (canvasManager) {
            canvasManager.render();
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 文字内容
        this.textContentInput.addEventListener('input', () => {
            this.updateTextSettings();
        });
        
        // 文字方向
        this.textDirectionSelect.addEventListener('change', () => {
            this.updateTextSettings();
        });
        
        // 字体
        this.textFontSelect.addEventListener('change', () => {
            this.updateTextSettings();
        });
        
        // 字体大小
        this.textSizeInput.addEventListener('input', () => {
            this.updateTextSettings();
        });
        
        // 字体颜色
        this.textColorInput.addEventListener('input', () => {
            this.updateTextSettings();
        });
        
        // 位置
        this.textXInput.addEventListener('input', () => {
            this.updateTextSettings();
        });
        
        this.textYInput.addEventListener('input', () => {
            this.updateTextSettings();
        });
        
        // 特效
        this.textShadowCheckbox.addEventListener('change', () => {
            this.updateTextSettings();
        });
        
        this.textOutlineCheckbox.addEventListener('change', () => {
            this.updateTextSettings();
        });
    }
}

// 创建文字管理器实例
let textManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待图层管理器初始化
    setTimeout(() => {
        textManager = new TextManager();
        textManager.init();
    }, 100);
});
