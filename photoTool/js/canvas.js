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

        // 背景板设置
        this.boardColor = '#F5F5F5';
        this.boardColorInput = document.getElementById('boardColor');
        this.applyExtractedColorsBtn = document.getElementById('applyExtractedColors');
        this.extractedColors = null;

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

        // 背景板颜色事件
        this.boardColorInput.addEventListener('input', (e) => {
            this.boardColor = e.target.value;
            this.updateBackgroundBoard();
        });

        // 应用提取的颜色到背景板
        this.applyExtractedColorsBtn.addEventListener('click', () => {
            if (this.extractedColors && this.extractedColors.length >= 2) {
                // 创建渐变背景
                const boardElement = document.querySelector('.background-board');
                const gradient = `linear-gradient(45deg, ${this.extractedColors[0]}, ${this.extractedColors[1]})`;
                boardElement.style.background = gradient;

                // 隐藏按钮
                this.applyExtractedColorsBtn.style.display = 'none';
            }
        });
    }

    // 更新背景板颜色
    updateBackgroundBoard() {
        const boardElement = document.querySelector('.background-board');
        boardElement.style.backgroundColor = this.boardColor;
    }

    // 设置提取的颜色
    setExtractedColors(colors) {
        this.extractedColors = colors;
        if (colors && colors.length >= 2) {
            this.applyExtractedColorsBtn.style.display = 'block';
        }
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

    // 导出为图片（包含背景板）
    exportImage() {
        // 创建一个新的Canvas来绘制完整的书签（包括背景板）
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');

        // 获取背景板元素
        const boardElement = document.querySelector('.background-board');
        const boardStyle = getComputedStyle(boardElement);

        // 设置导出Canvas的尺寸为背景板的尺寸
        exportCanvas.width = parseInt(boardStyle.width);
        exportCanvas.height = parseInt(boardStyle.height);

        // 绘制背景板
        if (boardStyle.background.includes('gradient')) {
            // 如果背景是渐变
            const gradient = ctx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);

            // 尝试从背景板样式中提取颜色
            if (this.extractedColors && this.extractedColors.length >= 2) {
                gradient.addColorStop(0, this.extractedColors[0]);
                gradient.addColorStop(1, this.extractedColors[1]);
                ctx.fillStyle = gradient;
            } else {
                // 默认渐变
                ctx.fillStyle = boardStyle.backgroundColor || '#f5f5f5';
            }
        } else {
            // 纯色背景
            ctx.fillStyle = boardStyle.backgroundColor || '#f5f5f5';
        }

        // 填充背景
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // 计算书签在背景板中的位置（居中）
        const bookmarkX = (exportCanvas.width - this.canvas.width) / 2;
        const bookmarkY = (exportCanvas.height - this.canvas.height) / 2;

        // 绘制书签
        ctx.drawImage(this.canvas, bookmarkX, bookmarkY);

        // 导出为图片
        const dataURL = exportCanvas.toDataURL('image/png');
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
