/**
 * layers.js - 书签卡片编辑器的图层管理模块
 * 负责管理背景层、图案层、文字层和图标层的绘制顺序和状态
 */

// 图层类
class Layer {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.visible = true;
        this.data = {};
    }

    // 设置图层数据
    setData(data) {
        this.data = { ...this.data, ...data };
    }

    // 获取图层数据
    getData() {
        return this.data;
    }

    // 设置图层可见性
    setVisible(visible) {
        this.visible = visible;
    }

    // 渲染图层
    render(_ctx) {
        // 由子类实现
    }
}

// 背景图层类
class BackgroundLayer extends Layer {
    constructor(id) {
        super(id, 'background');

        // 默认背景设置
        this.data = {
            type: 'solid',
            color: '#8B0000',
            gradient: {
                type: 'linear',
                angle: 45,
                stops: [
                    { color: '#FF0000', position: 0 },
                    { color: '#0000FF', position: 100 }
                ]
            },
            image: null,
            imageRepeat: 'repeat',
            imageOpacity: 100,
            pattern: {
                type: 'stripes',
                color1: '#FFFFFF',
                color2: '#000000',
                size: 20,
                angle: 45
            }
        };
    }

    // 渲染背景
    render(ctx) {
        if (!this.visible) return;

        const { width, height } = ctx.canvas;

        switch (this.data.type) {
            case 'solid':
                // 绘制纯色背景
                ctx.fillStyle = this.data.color;
                ctx.fillRect(0, 0, width, height);
                break;

            case 'gradient':
                // 绘制渐变背景
                let gradient;
                const { gradient: gradientData } = this.data;

                if (gradientData.type === 'linear') {
                    // 计算渐变起点和终点
                    const angle = gradientData.angle * Math.PI / 180;
                    const x0 = width / 2 - Math.cos(angle) * width / 2;
                    const y0 = height / 2 - Math.sin(angle) * height / 2;
                    const x1 = width / 2 + Math.cos(angle) * width / 2;
                    const y1 = height / 2 + Math.sin(angle) * height / 2;

                    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                } else {
                    // 径向渐变
                    gradient = ctx.createRadialGradient(
                        width / 2, height / 2, 0,
                        width / 2, height / 2, Math.max(width, height) / 2
                    );
                }

                // 添加渐变色标
                gradientData.stops.forEach(stop => {
                    gradient.addColorStop(stop.position / 100, stop.color);
                });

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;

            case 'image':
                // 绘制图片背景
                if (this.data.image) {
                    const img = this.data.image;
                    const opacity = this.data.imageOpacity / 100;

                    // 保存当前状态
                    ctx.save();

                    // 设置透明度
                    ctx.globalAlpha = opacity;

                    // 根据平铺方式绘制图片
                    switch (this.data.imageRepeat) {
                        case 'no-repeat':
                            // 不平铺，根据适应方式绘制
                            // 获取适应方式，默认为cover
                            const imageFit = this.data.imageFit || 'cover';

                            let w, h, x, y;

                            switch (imageFit) {
                                case 'contain':
                                    // 包含全图 - 确保整个图片都可见
                                    const scaleContain = Math.min(width / img.width, height / img.height);
                                    w = img.width * scaleContain;
                                    h = img.height * scaleContain;
                                    x = (width - w) / 2;
                                    y = (height - h) / 2;
                                    break;

                                case 'cover':
                                    // 填满书签 - 可能裁剪图片的一部分
                                    const scaleCover = Math.max(width / img.width, height / img.height);
                                    w = img.width * scaleCover;
                                    h = img.height * scaleCover;
                                    x = (width - w) / 2;
                                    y = (height - h) / 2;
                                    break;

                                case 'center':
                                    // 居中显示 - 保持原始尺寸
                                    w = img.width;
                                    h = img.height;
                                    x = (width - w) / 2;
                                    y = (height - h) / 2;

                                    // 如果图片太大，缩小到适合书签
                                    if (w > width || h > height) {
                                        const scale = Math.min(width / w, height / h);
                                        w *= scale;
                                        h *= scale;
                                        x = (width - w) / 2;
                                        y = (height - h) / 2;
                                    }
                                    break;

                                default:
                                    // 默认为cover
                                    const scaleDefault = Math.max(width / img.width, height / img.height);
                                    w = img.width * scaleDefault;
                                    h = img.height * scaleDefault;
                                    x = (width - w) / 2;
                                    y = (height - h) / 2;
                            }

                            // 绘制图片
                            ctx.drawImage(img, x, y, w, h);
                            break;

                        case 'repeat':
                            // 创建图案
                            const pattern = ctx.createPattern(img, 'repeat');
                            ctx.fillStyle = pattern;
                            ctx.fillRect(0, 0, width, height);
                            break;

                        case 'repeat-x':
                            // 水平平铺
                            for (let x = 0; x < width; x += img.width) {
                                ctx.drawImage(img, x, (height - img.height) / 2);
                            }
                            break;

                        case 'repeat-y':
                            // 垂直平铺
                            for (let y = 0; y < height; y += img.height) {
                                ctx.drawImage(img, (width - img.width) / 2, y);
                            }
                            break;
                    }

                    // 恢复状态
                    ctx.restore();
                }
                break;

            case 'pattern':
                // 绘制几何图案
                const { pattern: patternData } = this.data;

                // 创建离屏Canvas来生成图案
                const patternCanvas = document.createElement('canvas');
                const patternCtx = patternCanvas.getContext('2d');
                const size = patternData.size;

                // 设置图案Canvas尺寸
                patternCanvas.width = size * 2;
                patternCanvas.height = size * 2;

                // 根据图案类型绘制
                switch (patternData.type) {
                    case 'stripes':
                        // 绘制斜条纹
                        patternCtx.fillStyle = patternData.color1;
                        patternCtx.fillRect(0, 0, size * 2, size * 2);

                        patternCtx.fillStyle = patternData.color2;
                        patternCtx.save();
                        patternCtx.translate(size, size);
                        patternCtx.rotate(patternData.angle * Math.PI / 180);
                        patternCtx.fillRect(-size * 2, -size / 2, size * 4, size);
                        patternCtx.restore();
                        break;

                    case 'hexagons':
                        // 绘制六边形网格
                        patternCtx.fillStyle = patternData.color1;
                        patternCtx.fillRect(0, 0, size * 2, size * 2);

                        patternCtx.fillStyle = patternData.color2;
                        const hexSize = size / 2;

                        // 绘制六边形
                        patternCtx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = (60 * i + patternData.angle) * Math.PI / 180;
                            const x = size + hexSize * Math.cos(angle);
                            const y = size + hexSize * Math.sin(angle);

                            if (i === 0) {
                                patternCtx.moveTo(x, y);
                            } else {
                                patternCtx.lineTo(x, y);
                            }
                        }
                        patternCtx.closePath();
                        patternCtx.fill();
                        break;

                    case 'dots':
                        // 绘制圆点
                        patternCtx.fillStyle = patternData.color1;
                        patternCtx.fillRect(0, 0, size * 2, size * 2);

                        patternCtx.fillStyle = patternData.color2;
                        patternCtx.beginPath();
                        patternCtx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
                        patternCtx.arc(size * 1.5, size * 1.5, size / 4, 0, Math.PI * 2);
                        patternCtx.fill();
                        break;

                    case 'zigzag':
                        // 绘制锯齿形
                        patternCtx.fillStyle = patternData.color1;
                        patternCtx.fillRect(0, 0, size * 2, size * 2);

                        patternCtx.strokeStyle = patternData.color2;
                        patternCtx.lineWidth = size / 4;

                        patternCtx.beginPath();
                        patternCtx.moveTo(0, size);
                        patternCtx.lineTo(size / 2, size / 2);
                        patternCtx.lineTo(size, size);
                        patternCtx.lineTo(size * 1.5, size * 1.5);
                        patternCtx.lineTo(size * 2, size);
                        patternCtx.stroke();
                        break;
                }

                // 创建图案
                const pattern = ctx.createPattern(patternCanvas, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, width, height);
                break;
        }
    }
}

// 文字图层类
class TextLayer extends Layer {
    constructor(id) {
        super(id, 'text');

        // 默认文字设置
        this.data = {
            content: '书签示例文字',
            direction: 'vertical',
            font: 'SimSun',
            size: 24,
            color: '#FFFFFF',
            x: 100,
            y: 100,
            shadow: false,
            outline: false
        };
    }

    // 渲染文字
    render(ctx) {
        if (!this.visible || !this.data.content) return;

        // 保存当前状态
        ctx.save();

        // 设置文字样式
        ctx.font = `${this.data.size}px ${this.data.font}`;
        ctx.fillStyle = this.data.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 添加文字阴影
        if (this.data.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }

        // 根据方向绘制文字
        if (this.data.direction === 'vertical') {
            // 竖排文字
            const chars = this.data.content.split('');
            const lineHeight = this.data.size * 1.2;

            // 检测英文单词
            const words = [];
            let currentWord = '';
            let isEnglish = false;

            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                const code = char.charCodeAt(0);

                // 检查是否是英文字符
                const isEnglishChar = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);

                if (isEnglishChar) {
                    // 英文字符
                    currentWord += char;
                    isEnglish = true;
                } else {
                    // 非英文字符
                    if (isEnglish && currentWord) {
                        words.push({ type: 'english', content: currentWord });
                        currentWord = '';
                    }
                    words.push({ type: 'chinese', content: char });
                    isEnglish = false;
                }
            }

            // 处理最后一个英文单词
            if (isEnglish && currentWord) {
                words.push({ type: 'english', content: currentWord });
            }

            // 绘制文字
            let y = this.data.y;

            for (let i = 0; i < words.length; i++) {
                const word = words[i];

                if (word.type === 'chinese') {
                    // 绘制中文字符
                    if (this.data.outline) {
                        ctx.strokeStyle = this.data.color;
                        ctx.lineWidth = 2;
                        ctx.strokeText(word.content, this.data.x, y);
                    } else {
                        ctx.fillText(word.content, this.data.x, y);
                    }
                    y += lineHeight;
                } else {
                    // 绘制英文单词
                    ctx.save();
                    ctx.translate(this.data.x, y);
                    ctx.rotate(-Math.PI / 2);

                    if (this.data.outline) {
                        ctx.strokeStyle = this.data.color;
                        ctx.lineWidth = 2;
                        ctx.strokeText(word.content, 0, 0);
                    } else {
                        ctx.fillText(word.content, 0, 0);
                    }

                    ctx.restore();
                    y += word.content.length * (this.data.size * 0.6) + lineHeight / 2;
                }
            }
        } else {
            // 横排文字
            if (this.data.outline) {
                ctx.strokeStyle = this.data.color;
                ctx.lineWidth = 2;
                ctx.strokeText(this.data.content, this.data.x, this.data.y);
            } else {
                ctx.fillText(this.data.content, this.data.x, this.data.y);
            }
        }

        // 恢复状态
        ctx.restore();
    }
}

// 图标图层类
class IconLayer extends Layer {
    constructor(id) {
        super(id, 'icon');

        // 默认图标设置
        this.data = {
            image: null,
            x: 100,
            y: 300,
            size: 40,
            rotation: 0,
            opacity: 100
        };
    }

    // 渲染图标
    render(ctx) {
        if (!this.visible || !this.data.image) return;

        // 保存当前状态
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = this.data.opacity / 100;

        // 移动到图标位置
        ctx.translate(this.data.x, this.data.y);

        // 旋转
        ctx.rotate(this.data.rotation * Math.PI / 180);

        // 绘制图标
        const size = this.data.size;
        ctx.drawImage(this.data.image, -size / 2, -size / 2, size, size);

        // 恢复状态
        ctx.restore();
    }
}

// 图层管理器类
class LayerManager {
    constructor() {
        // 图层列表
        this.layers = [];

        // 初始化默认图层
        this.initDefaultLayers();
    }

    // 初始化默认图层
    initDefaultLayers() {
        // 创建背景图层
        this.addLayer(new BackgroundLayer('background'));

        // 创建文字图层
        this.addLayer(new TextLayer('text'));

        // 创建图标图层
        this.addLayer(new IconLayer('icon'));
    }

    // 添加图层
    addLayer(layer) {
        this.layers.push(layer);
    }

    // 获取图层
    getLayer(id) {
        return this.layers.find(layer => layer.id === id);
    }

    // 渲染所有图层
    renderLayers(ctx) {
        // 按顺序渲染图层
        this.layers.forEach(layer => {
            layer.render(ctx);
        });
    }

    // 获取所有图层数据
    getLayersData() {
        const data = {};

        this.layers.forEach(layer => {
            data[layer.id] = {
                type: layer.type,
                visible: layer.visible,
                data: layer.getData()
            };
        });

        return data;
    }

    // 设置图层数据
    setLayersData(data) {
        for (const id in data) {
            const layer = this.getLayer(id);

            if (layer) {
                layer.setVisible(data[id].visible);
                layer.setData(data[id].data);
            }
        }
    }
}

// 创建图层管理器实例
let layerManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    layerManager = new LayerManager();
});
