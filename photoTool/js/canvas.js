/**
 * canvas.js - 书签卡片编辑器的Canvas核心模块
 * 负责Canvas初始化、缩放、坐标系统和基本绘制功能
 */

// Canvas管理类
class BookmarkCanvas {
    constructor(canvasId) {
        // 获取Canvas元素
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // 设置标准尺寸
        this.standardWidth = 200;
        this.standardHeight = 600;

        // 缩放比例
        this.scale = 1;

        // 初始化Canvas
        this.initCanvas();

        // 绑定事件
        this.bindEvents();
    }

    // 初始化Canvas
    initCanvas() {
        // 设置Canvas尺寸
        this.canvas.width = this.standardWidth;
        this.canvas.height = this.standardHeight;

        // 清除Canvas
        this.clear();
    }

    // 清除Canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 设置缩放比例
    setScale(scale) {
        this.scale = scale;

        // 更新Canvas尺寸
        this.canvas.style.width = `${this.standardWidth * this.scale}px`;
        this.canvas.style.height = `${this.standardHeight * this.scale}px`;

        // 更新缩放显示
        document.getElementById('zoomLevel').textContent = `${Math.round(this.scale * 100)}%`;

        // 重新绘制
        this.render();
    }

    // 放大
    zoomIn() {
        if (this.scale < 3) {
            this.setScale(this.scale + 0.1);
        }
    }

    // 缩小
    zoomOut() {
        if (this.scale > 0.3) {
            this.setScale(this.scale - 0.1);
        }
    }

    // 绑定事件
    bindEvents() {
        // 缩放按钮事件
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());

        // 鼠标滚轮缩放
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });
    }

    // 渲染Canvas
    render() {
        // 清除Canvas
        this.clear();

        // 渲染各个图层
        if (layerManager) {
            layerManager.renderLayers(this.ctx);
        }

        // 渲染边框
        if (borderManager) {
            borderManager.applyBorderToCanvas(this.ctx);
        }
    }

    // 获取Canvas数据URL
    getDataURL() {
        return this.canvas.toDataURL('image/png');
    }

    // 导出为图片
    exportImage() {
        const dataURL = this.getDataURL();
        const link = document.createElement('a');
        link.download = '书签卡片.png';
        link.href = dataURL;
        link.click();
    }
}

// 创建Canvas管理器实例
let canvasManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    canvasManager = new BookmarkCanvas('bookmarkCanvas');
});
