/**
 * layers.js - 书签卡片编辑器的图层管理模块
 * 简化版本 - 仅保留背景层
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
                    // 在Canvas中，角度是从x轴正方向开始，逆时针旋转
                    // 而在CSS中，角度是从y轴负方向开始，顺时针旋转
                    // 所以需要进行转换：Canvas角度 = CSS角度
                    const canvasAngle = gradientData.angle;
                    const angle = canvasAngle * Math.PI / 180;
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
