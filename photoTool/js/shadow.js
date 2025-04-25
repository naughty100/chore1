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
            angle: 45,            // 光源角度 (0-360度)
            depth: 10,            // px (仅用于3D阴影)
            spread: 5             // px (仅用于发光效果)
        };

        // 检查浏览器是否支持CSS滤镜
        this.supportsFilter = this.checkFilterSupport();

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
        this.shadowAngle = document.getElementById('shadowAngle');
        this.shadowAngleValue = document.getElementById('shadowAngleValue');
        this.shadowDepth = document.getElementById('shadowDepth');
        this.shadowDepthValue = document.getElementById('shadowDepthValue');
        this.shadowSpread = document.getElementById('shadowSpread');
        this.shadowSpreadValue = document.getElementById('shadowSpreadValue');

        // 特定类型的设置容器
        this.shadowAngleSettings = document.getElementById('shadowAngleSettings');
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

        // 光源角度
        this.shadowAngle.addEventListener('input', () => {
            this.shadowSettings.angle = parseInt(this.shadowAngle.value);
            this.shadowAngleValue.textContent = `${this.shadowSettings.angle}°`;

            // 如果是普通阴影，根据角度自动调整偏移量
            if (this.shadowSettings.type === 'drop') {
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
            }

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

        // 光源角度控制对所有类型都可见
        this.shadowAngleSettings.style.display = 'block';
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
        this.shadowAngle.value = this.shadowSettings.angle;
        this.shadowAngleValue.textContent = `${this.shadowSettings.angle}°`;
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

        // 获取光源角度（转换为弧度）
        const angleRad = this.shadowSettings.angle * Math.PI / 180;

        // 根据阴影类型应用不同的效果
        switch (this.shadowSettings.type) {
            case 'drop':
                // 普通阴影 - 使用光源角度计算偏移
                const offsetDistance = Math.sqrt(Math.pow(this.shadowSettings.offsetX, 2) + Math.pow(this.shadowSettings.offsetY, 2));
                const offsetX = Math.cos(angleRad) * offsetDistance;
                const offsetY = Math.sin(angleRad) * offsetDistance;

                canvasContainer.style.boxShadow = `${offsetX}px ${offsetY}px ${this.shadowSettings.blur}px ${rgbaColor}`;
                canvasContainer.style.filter = 'none';
                break;

            case '3d':
                // 3D立体阴影 - 使用多层阴影创建深度感，考虑光源角度
                let shadows = [];
                const depth = this.shadowSettings.depth;

                // 计算偏移距离的基准值（用于保持一致的阴影大小）
                const baseDistance = 5; // 基准距离，单位为像素

                // 基于光源角度计算基本偏移方向
                const baseOffsetX = Math.cos(angleRad) * baseDistance;
                const baseOffsetY = Math.sin(angleRad) * baseDistance;

                console.log(`ShadowManager: 预览3D阴影 - 深度: ${depth}, 角度: ${this.shadowSettings.angle}°, 基础偏移: (${baseOffsetX.toFixed(2)}, ${baseOffsetY.toFixed(2)})`);

                // 创建多层阴影 - 从最远的层开始，这样近的层会覆盖远的层
                for (let i = depth; i > 0; i--) {
                    // 计算每层的不透明度，越远的层越透明
                    const stepOpacity = opacity * (1 - i / (depth * 1.5));
                    const stepColor = this.hexToRgba(this.shadowSettings.color, stepOpacity);

                    // 根据深度和光源角度计算每层的偏移
                    const layerOffsetX = baseOffsetX * i / 5; // 除以5使偏移更合理
                    const layerOffsetY = baseOffsetY * i / 5;

                    // 添加阴影定义
                    shadows.push(`${layerOffsetX}px ${layerOffsetY}px ${this.shadowSettings.blur}px ${stepColor}`);
                }

                // 添加一个额外的模糊阴影，使效果更加柔和
                if (this.shadowSettings.blur > 0) {
                    const blurColor = this.hexToRgba(this.shadowSettings.color, opacity * 0.3);
                    shadows.push(`${baseOffsetX * depth / 10}px ${baseOffsetY * depth / 10}px ${this.shadowSettings.blur * 1.5}px ${blurColor}`);
                }

                canvasContainer.style.boxShadow = shadows.join(', ');
                canvasContainer.style.filter = 'none';
                break;

            case 'glow':
                // 发光效果 - 使用box-shadow和filter结合，考虑光源角度
                const spread = this.shadowSettings.spread;

                // 根据光源角度调整发光效果的偏移
                const glowOffsetX = Math.cos(angleRad) * (spread / 3);
                const glowOffsetY = Math.sin(angleRad) * (spread / 3);

                canvasContainer.style.boxShadow = `${glowOffsetX}px ${glowOffsetY}px ${this.shadowSettings.blur}px ${spread}px ${rgbaColor}`;
                canvasContainer.style.filter = `drop-shadow(${glowOffsetX/2}px ${glowOffsetY/2}px ${this.shadowSettings.blur / 2}px ${rgbaColor})`;
                break;
        }
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

    // 应用阴影到导出的Canvas
    applyShadowToCanvas(ctx, x, y, width, height) {
        if (!this.shadowSettings.enabled) {
            console.log('ShadowManager: 阴影已禁用，跳过导出阴影');
            return;
        }

        console.log(`ShadowManager: 导出阴影 - 类型: ${this.shadowSettings.type}, 位置: (${x}, ${y}), 尺寸: ${width}x${height}`);

        // 保存当前状态
        ctx.save();

        // 计算颜色（考虑透明度）
        const opacity = this.shadowSettings.opacity / 100;

        // 获取光源角度（转换为弧度）
        const angleRad = this.shadowSettings.angle * Math.PI / 180;

        // 根据阴影类型应用不同的效果
        switch (this.shadowSettings.type) {
            case 'drop':
                // 普通阴影 - 使用光源角度计算偏移
                const offsetDistance = Math.sqrt(Math.pow(this.shadowSettings.offsetX, 2) + Math.pow(this.shadowSettings.offsetY, 2));
                const offsetX = Math.cos(angleRad) * offsetDistance;
                const offsetY = Math.sin(angleRad) * offsetDistance;

                console.log(`ShadowManager: 导出普通阴影 - 偏移: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}), 模糊: ${this.shadowSettings.blur}px`);

                // 使用多层阴影增强模糊效果
                // 第一层：主阴影
                ctx.save();
                ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity);
                ctx.shadowBlur = this.shadowSettings.blur * 1.5; // 增加模糊半径
                ctx.shadowOffsetX = offsetX;
                ctx.shadowOffsetY = offsetY;

                // 绘制一个与书签大小相同的矩形，这样阴影会显示出来
                ctx.fillStyle = 'rgba(0,0,0,0)'; // 透明填充
                ctx.fillRect(x, y, width, height);
                ctx.restore();

                // 第二层：辅助阴影，增强模糊效果
                if (this.shadowSettings.blur > 0) {
                    ctx.save();
                    // 只有在浏览器支持的情况下才使用CSS滤镜
                    if (this.supportsFilter) {
                        ctx.filter = `blur(${this.shadowSettings.blur / 2}px)`; // 使用CSS滤镜增强模糊
                    } else {
                        // 如果不支持滤镜，使用shadowBlur作为替代
                        ctx.shadowBlur = this.shadowSettings.blur / 2;
                        ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * 0.2);
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                    }

                    // 绘制一个半透明的阴影层
                    ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * 0.2);

                    // 创建一个偏移的矩形
                    ctx.beginPath();
                    ctx.rect(
                        x + offsetX * 0.8,
                        y + offsetY * 0.8,
                        width,
                        height
                    );
                    ctx.fill();
                    ctx.restore();
                }
                break;

            case '3d':
                // 3D立体阴影 - 绘制多层阴影，考虑光源角度
                const depth = this.shadowSettings.depth;
                console.log(`ShadowManager: 导出3D阴影 - 深度: ${depth}, 角度: ${this.shadowSettings.angle}°, 模糊: ${this.shadowSettings.blur}px`);

                // 计算偏移距离的基准值（与预览保持一致）
                const baseDistance = 5; // 基准距离，单位为像素

                // 基于光源角度计算基本偏移方向
                const baseOffsetX = Math.cos(angleRad) * baseDistance;
                const baseOffsetY = Math.sin(angleRad) * baseDistance;

                // 先绘制阴影层 - 从最远的层开始，这样近的层会覆盖远的层
                for (let i = depth; i > 0; i--) {
                    // 计算每层的不透明度，与预览保持一致
                    const stepOpacity = opacity * (1 - i / (depth * 1.5));
                    ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, stepOpacity);

                    // 根据深度和光源角度计算每层的偏移，与预览保持一致
                    const layerOffsetX = baseOffsetX * i / 5; // 除以5使偏移更合理
                    const layerOffsetY = baseOffsetY * i / 5;

                    // 绘制阴影层
                    ctx.beginPath();
                    ctx.rect(
                        x + layerOffsetX,
                        y + layerOffsetY,
                        width,
                        height
                    );
                    ctx.fill();
                }

                // 添加模糊效果，使阴影更加柔和
                if (this.shadowSettings.blur > 0) {
                    // 使用多层模糊效果，确保模糊效果明显
                    for (let b = 1; b <= 3; b++) {
                        ctx.save();

                        // 根据循环次数调整模糊参数
                        const blurFactor = b * 0.8; // 逐渐增加模糊半径
                        const opacityFactor = 0.3 / b; // 逐渐降低不透明度

                        ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * opacityFactor);
                        ctx.shadowBlur = this.shadowSettings.blur * blurFactor;
                        ctx.shadowOffsetX = baseOffsetX * depth / (10 - b); // 调整偏移
                        ctx.shadowOffsetY = baseOffsetY * depth / (10 - b);

                        // 绘制一个与书签大小相同但略微偏移的矩形
                        ctx.fillStyle = 'rgba(0,0,0,0)'; // 透明填充
                        ctx.fillRect(
                            x + (baseOffsetX * b / 10),
                            y + (baseOffsetY * b / 10),
                            width,
                            height
                        );

                        ctx.restore();
                    }

                    // 添加一个整体的模糊效果
                    ctx.save();
                    // 只有在浏览器支持的情况下才使用CSS滤镜
                    if (this.supportsFilter) {
                        ctx.filter = `blur(${this.shadowSettings.blur / 2}px)`; // 使用CSS滤镜增强模糊
                    } else {
                        // 如果不支持滤镜，使用shadowBlur作为替代
                        ctx.shadowBlur = this.shadowSettings.blur / 2;
                        ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * 0.15);
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                    }

                    // 绘制一个半透明的阴影层
                    ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * 0.15);

                    // 创建一个比书签略大的矩形
                    const blurMargin = this.shadowSettings.blur / 2;
                    ctx.beginPath();
                    ctx.rect(
                        x + baseOffsetX - blurMargin,
                        y + baseOffsetY - blurMargin,
                        width + blurMargin * 2,
                        height + blurMargin * 2
                    );
                    ctx.fill();

                    ctx.restore();
                }
                break;

            case 'glow':
                // 发光效果 - 考虑光源角度
                const spread = this.shadowSettings.spread;
                console.log(`ShadowManager: 导出发光效果 - 扩散: ${spread}px, 角度: ${this.shadowSettings.angle}°, 模糊: ${this.shadowSettings.blur}px`);

                // 根据光源角度调整发光效果的偏移
                const glowOffsetX = Math.cos(angleRad) * (spread / 3);
                const glowOffsetY = Math.sin(angleRad) * (spread / 3);

                // 创建多层发光效果，使其更加明显

                // 使用CSS滤镜创建基础发光效果
                ctx.save();
                // 只有在浏览器支持的情况下才使用CSS滤镜
                if (this.supportsFilter) {
                    ctx.filter = `blur(${this.shadowSettings.blur}px)`;
                } else {
                    // 如果不支持滤镜，使用shadowBlur作为替代
                    ctx.shadowBlur = this.shadowSettings.blur;
                    ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * 0.3);
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                // 绘制一个比实际书签大一些的矩形作为发光基础
                ctx.beginPath();
                ctx.rect(
                    x - spread * 1.2,
                    y - spread * 1.2,
                    width + spread * 2.4,
                    height + spread * 2.4
                );
                ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * 0.3);
                ctx.fill();
                ctx.restore();

                // 第一层：外部发光
                ctx.save();
                ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity);
                ctx.shadowBlur = this.shadowSettings.blur * 2; // 显著增加模糊半径
                ctx.shadowOffsetX = glowOffsetX;
                ctx.shadowOffsetY = glowOffsetY;

                // 绘制一个比实际书签大一些的矩形作为发光源
                ctx.beginPath();
                ctx.rect(
                    x - spread,
                    y - spread,
                    width + spread * 2,
                    height + spread * 2
                );
                ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * 0.4);
                ctx.fill();
                ctx.restore();

                // 第二层：内部发光
                ctx.save();
                ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * 0.8);
                ctx.shadowBlur = this.shadowSettings.blur * 1.5;
                ctx.shadowOffsetX = glowOffsetX / 2;
                ctx.shadowOffsetY = glowOffsetY / 2;

                // 绘制一个与书签大小相同的矩形
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * 0.2);
                ctx.fill();
                ctx.restore();

                // 第三层：增强发光边缘
                for (let i = 1; i <= 3; i++) {
                    ctx.save();

                    // 根据循环调整参数
                    const spreadFactor = 1 - (i * 0.2); // 逐渐减小扩散范围
                    const blurFactor = 0.5 + (i * 0.5); // 逐渐增加模糊

                    // 只有在浏览器支持的情况下才使用CSS滤镜
                    if (this.supportsFilter) {
                        ctx.filter = `blur(${this.shadowSettings.blur * blurFactor}px)`;
                    } else {
                        // 如果不支持滤镜，使用shadowBlur作为替代
                        ctx.shadowBlur = this.shadowSettings.blur * blurFactor;
                        ctx.shadowColor = this.hexToRgba(this.shadowSettings.color, opacity * (0.3 / i));
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                    }

                    // 绘制一个逐渐缩小的矩形
                    ctx.beginPath();
                    const margin = spread * spreadFactor;
                    ctx.rect(
                        x - margin + (glowOffsetX * i / 3),
                        y - margin + (glowOffsetY * i / 3),
                        width + margin * 2,
                        height + margin * 2
                    );
                    ctx.fillStyle = this.hexToRgba(this.shadowSettings.color, opacity * (0.3 / i));
                    ctx.fill();
                    ctx.restore();
                }
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
