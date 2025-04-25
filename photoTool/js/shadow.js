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
            color: '#000000',
            opacity: 50,          // 0-100
            blur: 10,             // px
            offsetX: 5,           // px
            offsetY: 5,           // px
            angle: 45             // 光源角度 (0-360度)
        };

        // 检查浏览器是否支持CSS滤镜
        this.supportsFilter = this.checkFilterSupport();

        // 获取UI元素
        this.shadowEnabled = document.getElementById('shadowEnabled');
        this.shadowColor = document.getElementById('shadowColor');
        this.shadowOpacity = document.getElementById('shadowOpacity');
        this.shadowOpacityValue = document.getElementById('shadowOpacityValue');
        this.shadowBlur = document.getElementById('shadowBlur');
        this.shadowBlurValue = document.getElementById('shadowBlurValue');
        this.shadowOffsetX = document.getElementById('shadowOffsetX');
        this.shadowOffsetXValue = document.getElementById('shadowOffsetXValue');
        this.shadowOffsetY = document.getElementById('shadowOffsetY');
        this.shadowOffsetYValue = document.getElementById('shadowOffsetYValue');
        this.shadowAngle = document.getElementById('shadowAngle');
        this.shadowAngleValue = document.getElementById('shadowAngleValue');

        // 特定类型的设置容器
        this.shadowAngleSettings = document.getElementById('shadowAngleSettings');

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

        // 光源角度
        this.shadowAngle.addEventListener('input', () => {
            this.shadowSettings.angle = parseInt(this.shadowAngle.value);
            this.shadowAngleValue.textContent = `${this.shadowSettings.angle}°`;

            // 根据角度自动调整偏移量
            // 将角度转换为弧度
            const angleRad = this.shadowSettings.angle * Math.PI / 180;
            // 计算偏移量（使用固定距离，根据角度分解为x和y分量）
            const distance = Math.sqrt(Math.pow(this.shadowSettings.offsetX, 2) + Math.pow(this.shadowSettings.offsetY, 2));
            this.shadowSettings.offsetX = Math.round(Math.cos(angleRad) * distance);
            this.shadowSettings.offsetY = Math.round(Math.sin(angleRad) * distance);

            // 更新UI
            this.shadowOffsetX.value = this.shadowSettings.offsetX;
            this.shadowOffsetXValue.textContent = `${this.shadowSettings.offsetX}px`;
            this.shadowOffsetY.value = this.shadowSettings.offsetY;
            this.shadowOffsetYValue.textContent = `${this.shadowSettings.offsetY}px`;

            this.applyShadow();
        });
    }

    // 更新UI设置
    updateTypeSpecificUI() {
        // 光源角度控制始终可见
        this.shadowAngleSettings.style.display = 'block';
    }

    // 更新UI以匹配当前设置
    updateUI() {
        this.shadowEnabled.checked = this.shadowSettings.enabled;
        this.shadowColor.value = this.shadowSettings.color;
        this.shadowOpacity.value = this.shadowSettings.opacity;
        this.shadowOpacityValue.textContent = `${this.shadowSettings.opacity}%`;
        this.shadowBlur.value = this.shadowSettings.blur;
        this.shadowBlurValue.textContent = `${this.shadowSettings.blur}px`;
        this.shadowOffsetX.value = this.shadowSettings.offsetX;
        this.shadowOffsetXValue.textContent = `${this.shadowSettings.offsetX}px`;
        this.shadowOffsetY.value = this.shadowSettings.offsetY;
        this.shadowOffsetYValue.textContent = `${this.shadowSettings.offsetY}px`;
        this.shadowAngle.value = this.shadowSettings.angle;
        this.shadowAngleValue.textContent = `${this.shadowSettings.angle}°`;

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

        // 获取光源角度（转换为弧度）
        const angleRad = this.shadowSettings.angle * Math.PI / 180;

        // 普通阴影 - 使用光源角度计算偏移
        const offsetDistance = Math.sqrt(Math.pow(this.shadowSettings.offsetX, 2) + Math.pow(this.shadowSettings.offsetY, 2));
        const offsetX = Math.cos(angleRad) * offsetDistance;
        const offsetY = Math.sin(angleRad) * offsetDistance;

        // 创建渐变阴影效果
        // 使用多层阴影，每层具有不同的模糊半径和不透明度，模拟深度感
        let shadows = [];

        // 主阴影
        shadows.push(`${offsetX}px ${offsetY}px ${this.shadowSettings.blur}px ${rgbaColor}`);

        // 添加额外的阴影层，模拟深度和模糊效果
        if (this.shadowSettings.blur > 0) {
            // 添加2-3层额外的阴影，每层具有不同的模糊半径和不透明度
            for (let i = 1; i <= 3; i++) {
                const layerOpacity = opacity * (1 - i * 0.2); // 逐渐降低不透明度
                const layerColor = this.hexToRgba(this.shadowSettings.color, layerOpacity);
                const layerBlur = this.shadowSettings.blur * (1 + i * 0.3); // 逐渐增加模糊半径
                const layerOffsetX = offsetX * (1 + i * 0.1); // 略微增加偏移
                const layerOffsetY = offsetY * (1 + i * 0.1);

                shadows.push(`${layerOffsetX}px ${layerOffsetY}px ${layerBlur}px ${layerColor}`);
            }
        }

        // 应用阴影效果
        canvasContainer.style.boxShadow = shadows.join(', ');
        canvasContainer.style.filter = 'none';
    }

    // 检查浏览器是否支持CSS滤镜
    checkFilterSupport() {
        try {
            // 创建一个临时元素
            const el = document.createElement('div');
            // 尝试设置filter属性
            el.style.filter = 'blur(1px)';
            // 如果支持，filter属性会被保留
            const supported = el.style.filter !== '';
            console.log(`ShadowManager: CSS滤镜支持: ${supported ? '是' : '否'}`);
            return supported;
        } catch (e) {
            console.log('ShadowManager: 检查CSS滤镜支持时出错', e);
            return false;
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

    // 创建带阴影的Canvas
    applyShadowToCanvas(_, x, y, width, height) {
        if (!this.shadowSettings.enabled) {
            console.log('ShadowManager: 阴影已禁用，跳过导出阴影');
            return null;
        }

        console.log(`ShadowManager: 导出阴影 - 位置: (${x}, ${y}), 尺寸: ${width}x${height}`);

        // 创建一个临时Canvas来绘制带阴影的书签
        const tempCanvas = document.createElement('canvas');
        // 设置临时Canvas的尺寸，留出足够的空间给阴影
        const shadowMargin = Math.max(this.shadowSettings.blur * 3, 50);
        tempCanvas.width = width + shadowMargin * 2;
        tempCanvas.height = height + shadowMargin * 2;

        console.log(`ShadowManager: 创建阴影Canvas - 尺寸: ${tempCanvas.width}x${tempCanvas.height}, 边距: ${shadowMargin}px`);

        const tempCtx = tempCanvas.getContext('2d');

        // 计算颜色（考虑透明度）
        const opacity = this.shadowSettings.opacity / 100;

        // 获取光源角度（转换为弧度）
        const angleRad = this.shadowSettings.angle * Math.PI / 180;

        // 清除临时Canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 普通阴影 - 使用光源角度计算偏移
        const offsetDistance = Math.sqrt(Math.pow(this.shadowSettings.offsetX, 2) + Math.pow(this.shadowSettings.offsetY, 2));
        const offsetX = Math.cos(angleRad) * offsetDistance;
        const offsetY = Math.sin(angleRad) * offsetDistance;

        console.log(`ShadowManager: 导出阴影 - 偏移: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}), 模糊: ${this.shadowSettings.blur}px`);

        // 创建渐变阴影效果
        // 使用多层阴影，每层具有不同的模糊半径和不透明度，模拟深度感

        // 第一层：主阴影
        tempCtx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity);
        tempCtx.shadowBlur = this.shadowSettings.blur;
        tempCtx.shadowOffsetX = offsetX;
        tempCtx.shadowOffsetY = offsetY;

        // 在临时Canvas上绘制一个与书签大小相同的矩形
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.01)'; // 几乎透明的白色，只用于生成阴影
        tempCtx.fillRect(shadowMargin, shadowMargin, width, height);

        // 添加额外的阴影层，模拟深度和模糊效果
        if (this.shadowSettings.blur > 0) {
            // 添加2-3层额外的阴影，每层具有不同的模糊半径和不透明度
            for (let i = 1; i <= 3; i++) {
                // 保存当前状态
                tempCtx.save();

                const layerOpacity = opacity * (1 - i * 0.2); // 逐渐降低不透明度
                tempCtx.shadowColor = this.hexToRgba(this.shadowSettings.color, layerOpacity);
                tempCtx.shadowBlur = this.shadowSettings.blur * (1 + i * 0.3); // 逐渐增加模糊半径
                tempCtx.shadowOffsetX = offsetX * (1 + i * 0.1); // 略微增加偏移
                tempCtx.shadowOffsetY = offsetY * (1 + i * 0.1);

                // 绘制一个与书签大小相同但略微偏移的矩形
                tempCtx.fillStyle = 'rgba(255, 255, 255, 0)'; // 完全透明，只为了生成阴影
                tempCtx.fillRect(
                    shadowMargin + (i * 2),
                    shadowMargin + (i * 2),
                    width - (i * 4),
                    height - (i * 4)
                );

                // 恢复状态
                tempCtx.restore();
            }
        }

        console.log('ShadowManager: 阴影绘制完成');

        // 返回临时Canvas，以便后续处理
        return {
            canvas: tempCanvas,
            offsetX: shadowMargin,
            offsetY: shadowMargin
        };
    }
}

// 创建阴影管理器实例
let shadowManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    shadowManager = new ShadowManager();
});
