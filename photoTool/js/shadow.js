/**
 * shadow.js - 书签卡片编辑器的阴影处理模块
 * 负责处理书签阴影的渲染和设置
 */

// 阴影管理器类
class ShadowManager {
    constructor() {
        // 阴影设置
        this.shadowSettings = {
            enabled: true,
            type: '3d',           // 'drop', '3d', 'glow'
            color: '#000000',
            opacity: 50,          // 0-100
            blur: 10,             // px
            offsetX: 5,           // px
            offsetY: 5,           // px
            depth: 10,            // px (仅用于3D阴影)
            spread: 5             // px (仅用于发光效果)
        };
        
        // 获取UI元素
        this.shadowEnabled = document.getElementById('shadowEnabled');
        this.shadowType = document.getElementById('shadowType');
        this.shadowColor = document.getElementById('shadowColor');
        this.shadowOpacity = document.getElementById('shadowOpacity');
        this.shadowOpacityValue = document.getElementById('shadowOpacityValue');
        this.shadowBlur = document.getElementById('shadowBlur');
        this.shadowBlurValue = document.getElementById('shadowBlurValue');
        this.shadowOffsetX = document.getElementById('shadowOffsetX');
        this.shadowOffsetXValue = document.getElementById('shadowOffsetXValue');
        this.shadowOffsetY = document.getElementById('shadowOffsetY');
        this.shadowOffsetYValue = document.getElementById('shadowOffsetYValue');
        this.shadowDepth = document.getElementById('shadowDepth');
        this.shadowDepthValue = document.getElementById('shadowDepthValue');
        this.shadowSpread = document.getElementById('shadowSpread');
        this.shadowSpreadValue = document.getElementById('shadowSpreadValue');
        
        // 特定类型的设置容器
        this.shadow3dSettings = document.getElementById('shadow3dSettings');
        this.shadowGlowSettings = document.getElementById('shadowGlowSettings');
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化UI
        this.updateUI();
    }
    
    // 绑定事件
    bindEvents() {
        // 启用/禁用阴影
        this.shadowEnabled.addEventListener('change', () => {
            this.shadowSettings.enabled = this.shadowEnabled.checked;
            this.applyShadow();
        });
        
        // 阴影类型
        this.shadowType.addEventListener('change', () => {
            this.shadowSettings.type = this.shadowType.value;
            this.updateTypeSpecificUI();
            this.applyShadow();
        });
        
        // 阴影颜色
        this.shadowColor.addEventListener('input', () => {
            this.shadowSettings.color = this.shadowColor.value;
            this.applyShadow();
        });
        
        // 不透明度
        this.shadowOpacity.addEventListener('input', () => {
            this.shadowSettings.opacity = parseInt(this.shadowOpacity.value);
            this.shadowOpacityValue.textContent = `${this.shadowSettings.opacity}%`;
            this.applyShadow();
        });
        
        // 模糊半径
        this.shadowBlur.addEventListener('input', () => {
            this.shadowSettings.blur = parseInt(this.shadowBlur.value);
            this.shadowBlurValue.textContent = `${this.shadowSettings.blur}px`;
            this.applyShadow();
        });
        
        // 水平偏移
        this.shadowOffsetX.addEventListener('input', () => {
            this.shadowSettings.offsetX = parseInt(this.shadowOffsetX.value);
            this.shadowOffsetXValue.textContent = `${this.shadowSettings.offsetX}px`;
            this.applyShadow();
        });
        
        // 垂直偏移
        this.shadowOffsetY.addEventListener('input', () => {
            this.shadowSettings.offsetY = parseInt(this.shadowOffsetY.value);
            this.shadowOffsetYValue.textContent = `${this.shadowSettings.offsetY}px`;
            this.applyShadow();
        });
        
        // 阴影深度 (3D)
        this.shadowDepth.addEventListener('input', () => {
            this.shadowSettings.depth = parseInt(this.shadowDepth.value);
            this.shadowDepthValue.textContent = `${this.shadowSettings.depth}px`;
            this.applyShadow();
        });
        
        // 扩散范围 (发光)
        this.shadowSpread.addEventListener('input', () => {
            this.shadowSettings.spread = parseInt(this.shadowSpread.value);
            this.shadowSpreadValue.textContent = `${this.shadowSettings.spread}px`;
            this.applyShadow();
        });
    }
    
    // 更新类型特定的UI
    updateTypeSpecificUI() {
        // 隐藏所有特定类型的设置
        this.shadow3dSettings.style.display = 'none';
        this.shadowGlowSettings.style.display = 'none';
        
        // 根据当前类型显示相应设置
        if (this.shadowSettings.type === '3d') {
            this.shadow3dSettings.style.display = 'block';
        } else if (this.shadowSettings.type === 'glow') {
            this.shadowGlowSettings.style.display = 'block';
        }
    }
    
    // 更新UI以匹配当前设置
    updateUI() {
        this.shadowEnabled.checked = this.shadowSettings.enabled;
        this.shadowType.value = this.shadowSettings.type;
        this.shadowColor.value = this.shadowSettings.color;
        this.shadowOpacity.value = this.shadowSettings.opacity;
        this.shadowOpacityValue.textContent = `${this.shadowSettings.opacity}%`;
        this.shadowBlur.value = this.shadowSettings.blur;
        this.shadowBlurValue.textContent = `${this.shadowSettings.blur}px`;
        this.shadowOffsetX.value = this.shadowSettings.offsetX;
        this.shadowOffsetXValue.textContent = `${this.shadowSettings.offsetX}px`;
        this.shadowOffsetY.value = this.shadowSettings.offsetY;
        this.shadowOffsetYValue.textContent = `${this.shadowSettings.offsetY}px`;
        this.shadowDepth.value = this.shadowSettings.depth;
        this.shadowDepthValue.textContent = `${this.shadowSettings.depth}px`;
        this.shadowSpread.value = this.shadowSettings.spread;
        this.shadowSpreadValue.textContent = `${this.shadowSettings.spread}px`;
        
        // 更新类型特定的UI
        this.updateTypeSpecificUI();
        
        // 应用阴影
        this.applyShadow();
    }
    
    // 应用阴影到书签
    applyShadow() {
        const canvasContainer = document.querySelector('.canvas-container');
        
        if (!canvasContainer) return;
        
        if (!this.shadowSettings.enabled) {
            // 禁用阴影
            canvasContainer.style.boxShadow = 'none';
            canvasContainer.style.filter = 'none';
            return;
        }
        
        // 计算颜色（考虑透明度）
        const opacity = this.shadowSettings.opacity / 100;
        const rgbaColor = this.hexToRgba(this.shadowSettings.color, opacity);
        
        // 根据阴影类型应用不同的效果
        switch (this.shadowSettings.type) {
            case 'drop':
                // 普通阴影
                canvasContainer.style.boxShadow = `${this.shadowSettings.offsetX}px ${this.shadowSettings.offsetY}px ${this.shadowSettings.blur}px ${rgbaColor}`;
                canvasContainer.style.filter = 'none';
                break;
                
            case '3d':
                // 3D立体阴影 - 使用多层阴影创建深度感
                let shadows = [];
                const depth = this.shadowSettings.depth;
                
                // 创建多层阴影
                for (let i = 1; i <= depth; i++) {
                    const stepOpacity = opacity * (1 - i / (depth * 1.5));
                    const stepColor = this.hexToRgba(this.shadowSettings.color, stepOpacity);
                    shadows.push(`${this.shadowSettings.offsetX * i / depth}px ${this.shadowSettings.offsetY * i / depth}px ${this.shadowSettings.blur}px ${stepColor}`);
                }
                
                canvasContainer.style.boxShadow = shadows.join(', ');
                canvasContainer.style.filter = 'none';
                break;
                
            case 'glow':
                // 发光效果 - 使用box-shadow和filter结合
                const spread = this.shadowSettings.spread;
                canvasContainer.style.boxShadow = `0 0 ${this.shadowSettings.blur}px ${spread}px ${rgbaColor}`;
                canvasContainer.style.filter = `drop-shadow(0 0 ${this.shadowSettings.blur / 2}px ${rgbaColor})`;
                break;
        }
    }
    
    // 将十六进制颜色转换为RGBA
    hexToRgba(hex, alpha) {
        // 移除#前缀
        hex = hex.replace('#', '');
        
        // 解析RGB值
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        
        // 返回RGBA格式
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // 获取当前阴影设置
    getShadowSettings() {
        return { ...this.shadowSettings };
    }
    
    // 应用阴影到导出的Canvas
    applyShadowToCanvas(ctx, x, y, width, height) {
        if (!this.shadowSettings.enabled) return;
        
        // 保存当前状态
        ctx.save();
        
        // 计算颜色（考虑透明度）
        const opacity = this.shadowSettings.opacity / 100;
        
        // 根据阴影类型应用不同的效果
        switch (this.shadowSettings.type) {
            case 'drop':
                // 普通阴影
                ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity);
                ctx.shadowBlur = this.shadowSettings.blur;
                ctx.shadowOffsetX = this.shadowSettings.offsetX;
                ctx.shadowOffsetY = this.shadowSettings.offsetY;
                break;
                
            case '3d':
                // 3D立体阴影 - 绘制多层阴影
                const depth = this.shadowSettings.depth;
                
                // 先绘制阴影层
                for (let i = depth; i > 0; i--) {
                    const stepOpacity = opacity * (1 - i / (depth * 1.5));
                    ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, stepOpacity);
                    
                    const offsetX = this.shadowSettings.offsetX * i / depth;
                    const offsetY = this.shadowSettings.offsetY * i / depth;
                    
                    // 绘制阴影层
                    ctx.beginPath();
                    ctx.rect(
                        x + offsetX, 
                        y + offsetY, 
                        width, 
                        height
                    );
                    ctx.fill();
                }
                break;
                
            case 'glow':
                // 发光效果
                const spread = this.shadowSettings.spread;
                ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity);
                ctx.shadowBlur = this.shadowSettings.blur;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // 绘制一个比实际书签大一些的矩形作为发光源
                ctx.beginPath();
                ctx.rect(
                    x - spread, 
                    y - spread, 
                    width + spread * 2, 
                    height + spread * 2
                );
                ctx.fill();
                break;
        }
        
        // 恢复状态
        ctx.restore();
    }
}

// 创建阴影管理器实例
let shadowManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    shadowManager = new ShadowManager();
});
