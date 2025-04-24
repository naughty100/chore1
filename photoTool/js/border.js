/**
 * border.js - 书签卡片编辑器的边框处理模块
 * 负责处理边框相关的UI交互和边框渲染
 */

// 边框管理类
class BorderManager {
    constructor() {
        // 边框设置控件
        this.borderStyleSelect = document.getElementById('borderStyle');
        this.borderWidthInput = document.getElementById('borderWidth');
        this.borderWidthValue = document.getElementById('borderWidthValue');
        this.borderColorInput = document.getElementById('borderColor');
        this.borderRadiusInput = document.getElementById('borderRadius');
        this.borderRadiusValue = document.getElementById('borderRadiusValue');
        
        // 阴影设置控件
        this.shadowDepthInput = document.getElementById('shadowDepth');
        this.shadowDepthValue = document.getElementById('shadowDepthValue');
        this.shadowColorInput = document.getElementById('shadowColor');
        this.shadowOpacityInput = document.getElementById('shadowOpacity');
        this.shadowOpacityValue = document.getElementById('shadowOpacityValue');
        this.shadowAngleInput = document.getElementById('shadowAngle');
        this.shadowAngleValue = document.getElementById('shadowAngleValue');
        
        // 边框设置
        this.borderSettings = {
            style: 'none',
            width: 2,
            color: '#000000',
            radius: 0,
            shadow: {
                depth: 5,
                color: '#000000',
                opacity: 30,
                angle: 45
            }
        };
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 初始化
    init() {
        // 更新UI
        this.updateUI();
    }
    
    // 更新UI
    updateUI() {
        // 更新边框样式
        this.borderStyleSelect.value = this.borderSettings.style;
        
        // 更新边框宽度
        this.borderWidthInput.value = this.borderSettings.width;
        this.borderWidthValue.textContent = `${this.borderSettings.width}px`;
        
        // 更新边框颜色
        this.borderColorInput.value = this.borderSettings.color;
        
        // 更新圆角半径
        this.borderRadiusInput.value = this.borderSettings.radius;
        this.borderRadiusValue.textContent = `${this.borderSettings.radius}px`;
        
        // 更新阴影设置
        this.shadowDepthInput.value = this.borderSettings.shadow.depth;
        this.shadowDepthValue.textContent = `${this.borderSettings.shadow.depth}px`;
        this.shadowColorInput.value = this.borderSettings.shadow.color;
        this.shadowOpacityInput.value = this.borderSettings.shadow.opacity;
        this.shadowOpacityValue.textContent = `${this.borderSettings.shadow.opacity}%`;
        this.shadowAngleInput.value = this.borderSettings.shadow.angle;
        this.shadowAngleValue.textContent = `${this.borderSettings.shadow.angle}°`;
        
        // 显示/隐藏阴影设置
        const showShadowSettings = this.borderSettings.style === '3d' || this.borderSettings.style === 'shadow';
        document.getElementById('shadowSettings').style.display = showShadowSettings ? 'block' : 'none';
    }
    
    // 应用边框样式到Canvas
    applyBorderToCanvas(ctx) {
        const { width, height } = ctx.canvas;
        
        // 保存当前状态
        ctx.save();
        
        // 应用圆角
        if (this.borderSettings.radius > 0) {
            this.applyRoundedCorners(ctx, width, height);
        }
        
        // 应用阴影
        if (this.borderSettings.style === 'shadow' || this.borderSettings.style === '3d') {
            this.applyShadow(ctx, width, height);
        }
        
        // 应用边框
        if (this.borderSettings.style !== 'none') {
            this.applyBorder(ctx, width, height);
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    // 应用圆角
    applyRoundedCorners(ctx, width, height) {
        const radius = this.borderSettings.radius;
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        
        // 创建裁剪区域
        ctx.clip();
    }
    
    // 应用阴影
    applyShadow(ctx, width, height) {
        const { depth, color, opacity, angle } = this.borderSettings.shadow;
        
        // 计算阴影偏移
        const angleRad = angle * Math.PI / 180;
        const offsetX = Math.cos(angleRad) * depth;
        const offsetY = Math.sin(angleRad) * depth;
        
        // 设置阴影
        ctx.shadowColor = this.hexToRgba(color, opacity / 100);
        ctx.shadowBlur = depth;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
    }
    
    // 应用边框
    applyBorder(ctx, width, height) {
        const { style, width: borderWidth, color, radius } = this.borderSettings;
        
        // 设置边框样式
        ctx.strokeStyle = color;
        ctx.lineWidth = borderWidth;
        
        // 根据边框样式绘制
        switch (style) {
            case 'solid':
                // 实线边框
                ctx.setLineDash([]);
                break;
                
            case 'dashed':
                // 虚线边框
                ctx.setLineDash([borderWidth * 2, borderWidth]);
                break;
                
            case 'double':
                // 双线边框
                // 先绘制外边框
                this.drawBorderPath(ctx, width, height, radius);
                ctx.stroke();
                
                // 再绘制内边框
                const innerWidth = width - borderWidth * 2;
                const innerHeight = height - borderWidth * 2;
                const innerRadius = Math.max(0, radius - borderWidth);
                
                ctx.beginPath();
                this.drawBorderPath(ctx, innerWidth, innerHeight, innerRadius, borderWidth, borderWidth);
                ctx.stroke();
                return;
                
            case '3d':
                // 3D立体边框
                // 绘制主边框
                ctx.setLineDash([]);
                this.drawBorderPath(ctx, width, height, radius);
                ctx.stroke();
                
                // 绘制3D效果
                const { depth, angle } = this.borderSettings.shadow;
                const angleRad = angle * Math.PI / 180;
                const dx = Math.cos(angleRad) * depth;
                const dy = Math.sin(angleRad) * depth;
                
                // 绘制连接线
                ctx.beginPath();
                // 右上角
                ctx.moveTo(width, radius);
                ctx.lineTo(width + dx, radius + dy);
                // 右下角
                ctx.moveTo(width, height - radius);
                ctx.lineTo(width + dx, height - radius + dy);
                // 左下角
                ctx.moveTo(radius, height);
                ctx.lineTo(radius + dx, height + dy);
                ctx.stroke();
                
                // 绘制背面边框
                ctx.beginPath();
                this.drawBorderPath(ctx, width, height, radius, dx, dy);
                ctx.stroke();
                return;
        }
        
        // 绘制边框路径
        this.drawBorderPath(ctx, width, height, radius);
        ctx.stroke();
    }
    
    // 绘制边框路径
    drawBorderPath(ctx, width, height, radius, offsetX = 0, offsetY = 0) {
        ctx.beginPath();
        
        if (radius > 0) {
            // 圆角边框
            ctx.moveTo(radius + offsetX, offsetY);
            ctx.lineTo(width - radius + offsetX, offsetY);
            ctx.quadraticCurveTo(width + offsetX, offsetY, width + offsetX, radius + offsetY);
            ctx.lineTo(width + offsetX, height - radius + offsetY);
            ctx.quadraticCurveTo(width + offsetX, height + offsetY, width - radius + offsetX, height + offsetY);
            ctx.lineTo(radius + offsetX, height + offsetY);
            ctx.quadraticCurveTo(offsetX, height + offsetY, offsetX, height - radius + offsetY);
            ctx.lineTo(offsetX, radius + offsetY);
            ctx.quadraticCurveTo(offsetX, offsetY, radius + offsetX, offsetY);
        } else {
            // 直角边框
            ctx.rect(offsetX, offsetY, width, height);
        }
        
        ctx.closePath();
    }
    
    // 将十六进制颜色转换为RGBA
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // 更新边框设置
    updateBorderSettings() {
        // 更新边框样式
        this.borderSettings.style = this.borderStyleSelect.value;
        
        // 更新边框宽度
        this.borderSettings.width = parseInt(this.borderWidthInput.value);
        this.borderWidthValue.textContent = `${this.borderSettings.width}px`;
        
        // 更新边框颜色
        this.borderSettings.color = this.borderColorInput.value;
        
        // 更新圆角半径
        this.borderSettings.radius = parseInt(this.borderRadiusInput.value);
        this.borderRadiusValue.textContent = `${this.borderSettings.radius}px`;
        
        // 更新阴影设置
        this.borderSettings.shadow.depth = parseInt(this.shadowDepthInput.value);
        this.shadowDepthValue.textContent = `${this.borderSettings.shadow.depth}px`;
        this.borderSettings.shadow.color = this.shadowColorInput.value;
        this.borderSettings.shadow.opacity = parseInt(this.shadowOpacityInput.value);
        this.shadowOpacityValue.textContent = `${this.borderSettings.shadow.opacity}%`;
        this.borderSettings.shadow.angle = parseInt(this.shadowAngleInput.value);
        this.shadowAngleValue.textContent = `${this.borderSettings.shadow.angle}°`;
        
        // 显示/隐藏阴影设置
        const showShadowSettings = this.borderSettings.style === '3d' || this.borderSettings.style === 'shadow';
        document.getElementById('shadowSettings').style.display = showShadowSettings ? 'block' : 'none';
        
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
        // 边框样式
        this.borderStyleSelect.addEventListener('change', () => {
            this.updateBorderSettings();
        });
        
        // 边框宽度
        this.borderWidthInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 边框颜色
        this.borderColorInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 圆角半径
        this.borderRadiusInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 阴影深度
        this.shadowDepthInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 阴影颜色
        this.shadowColorInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 阴影不透明度
        this.shadowOpacityInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
        
        // 阴影角度
        this.shadowAngleInput.addEventListener('input', () => {
            this.updateBorderSettings();
        });
    }
}

// 创建边框管理器实例
let borderManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待其他管理器初始化
    setTimeout(() => {
        borderManager = new BorderManager();
        borderManager.init();
    }, 100);
});
