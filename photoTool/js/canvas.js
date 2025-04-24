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
        this.boardGradientType = document.getElementById('boardGradientType');
        this.boardGradientAngle = document.getElementById('boardGradientAngle');
        this.boardGradientAngleValue = document.getElementById('boardGradientAngleValue');

        // 渐变位置控制
        this.gradientPos1 = document.getElementById('gradientPos1');
        this.gradientPos1Value = document.getElementById('gradientPos1Value');
        this.gradientPos2 = document.getElementById('gradientPos2');
        this.gradientPos2Value = document.getElementById('gradientPos2Value');
        this.gradientPos3 = document.getElementById('gradientPos3');
        this.gradientPos3Value = document.getElementById('gradientPos3Value');

        this.applyExtractedColorsBtn = document.getElementById('applyExtractedColors');
        this.extractedColors = null;
        this.gradientType = 'linear';
        this.gradientAngle = 45;

        // 渐变位置
        this.gradientPositions = [0, 50, 100];

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

        // 渐变类型事件
        this.boardGradientType.addEventListener('change', (e) => {
            this.gradientType = e.target.value;

            // 更新UI
            if (this.gradientType === 'none') {
                document.getElementById('boardGradientAngle').parentElement.style.display = 'none';
            } else {
                document.getElementById('boardGradientAngle').parentElement.style.display = 'block';
            }

            this.updateBackgroundBoard();
        });

        // 渐变角度事件
        this.boardGradientAngle.addEventListener('input', (e) => {
            this.gradientAngle = parseInt(e.target.value);
            this.boardGradientAngleValue.textContent = `${this.gradientAngle}°`;
            this.updateBackgroundBoard();
        });

        // 渐变位置事件
        this.gradientPos1.addEventListener('input', (e) => {
            this.gradientPositions[0] = parseInt(e.target.value);
            this.gradientPos1Value.textContent = `${this.gradientPositions[0]}%`;
            this.updateGradientPreview();
            this.updateBackgroundBoard();
        });

        this.gradientPos2.addEventListener('input', (e) => {
            this.gradientPositions[1] = parseInt(e.target.value);
            this.gradientPos2Value.textContent = `${this.gradientPositions[1]}%`;
            this.updateGradientPreview();
            this.updateBackgroundBoard();
        });

        this.gradientPos3.addEventListener('input', (e) => {
            this.gradientPositions[2] = parseInt(e.target.value);
            this.gradientPos3Value.textContent = `${this.gradientPositions[2]}%`;
            this.updateGradientPreview();
            this.updateBackgroundBoard();
        });

        // 应用提取的颜色到背景板
        this.applyExtractedColorsBtn.addEventListener('click', () => {
            if (this.extractedColors && this.extractedColors.length >= 2) {
                // 更新背景板
                this.updateBackgroundBoard();

                // 隐藏按钮
                this.applyExtractedColorsBtn.style.display = 'none';
            }
        });
    }

    // 更新背景板颜色和渐变
    updateBackgroundBoard() {
        const boardElement = document.querySelector('.background-board');

        if (this.gradientType === 'none') {
            // 纯色背景
            boardElement.style.background = this.boardColor;
        } else if (this.extractedColors && this.extractedColors.length >= 3) {
            // 使用提取的颜色创建渐变
            if (this.gradientType === 'linear') {
                // 线性渐变 - 使用自定义位置
                const pos1 = this.gradientPositions[0];
                const pos2 = this.gradientPositions[1];
                const pos3 = this.gradientPositions[2];

                boardElement.style.background = `linear-gradient(${this.gradientAngle}deg,
                    ${this.extractedColors[0]} ${pos1}%,
                    ${this.extractedColors[1]} ${pos2}%,
                    ${this.extractedColors[2]} ${pos3}%)`;
            } else {
                // 径向渐变 - 使用自定义位置
                const pos1 = this.gradientPositions[0];
                const pos2 = this.gradientPositions[1];
                const pos3 = this.gradientPositions[2];

                boardElement.style.background = `radial-gradient(circle,
                    ${this.extractedColors[0]} ${pos1}%,
                    ${this.extractedColors[1]} ${pos2}%,
                    ${this.extractedColors[2]} ${pos3}%)`;
            }
        } else {
            // 默认背景色
            boardElement.style.background = this.boardColor;
        }
    }

    // 设置提取的颜色
    setExtractedColors(colors) {
        this.extractedColors = colors;
        if (colors && colors.length >= 2) {
            this.applyExtractedColorsBtn.style.display = 'block';
            this.updateGradientPreview();
        }
    }

    // 更新渐变预览
    updateGradientPreview() {
        if (!this.extractedColors || this.extractedColors.length < 3) return;

        // 更新颜色预览
        const colorPreviews = document.querySelectorAll('.color-preview');
        if (colorPreviews.length >= 3) {
            colorPreviews[0].style.backgroundColor = this.extractedColors[0];
            colorPreviews[1].style.backgroundColor = this.extractedColors[1];
            colorPreviews[2].style.backgroundColor = this.extractedColors[2];
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
        if (this.gradientType === 'none') {
            // 纯色背景
            ctx.fillStyle = this.boardColor;
        } else if (this.extractedColors && this.extractedColors.length >= 3) {
            // 使用提取的颜色创建渐变
            if (this.gradientType === 'linear') {
                // 线性渐变 - 使用指定角度
                const angleRad = this.gradientAngle * Math.PI / 180;
                const gradientSize = Math.max(exportCanvas.width, exportCanvas.height);

                // 计算渐变起点和终点
                const centerX = exportCanvas.width / 2;
                const centerY = exportCanvas.height / 2;
                const startX = centerX - Math.cos(angleRad) * gradientSize / 2;
                const startY = centerY - Math.sin(angleRad) * gradientSize / 2;
                const endX = centerX + Math.cos(angleRad) * gradientSize / 2;
                const endY = centerY + Math.sin(angleRad) * gradientSize / 2;

                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

                // 使用自定义位置
                const pos1 = this.gradientPositions[0] / 100;
                const pos2 = this.gradientPositions[1] / 100;
                const pos3 = this.gradientPositions[2] / 100;

                gradient.addColorStop(pos1, this.extractedColors[0]);
                gradient.addColorStop(pos2, this.extractedColors[1]);
                gradient.addColorStop(pos3, this.extractedColors[2]);
                ctx.fillStyle = gradient;
            } else {
                // 径向渐变
                const gradient = ctx.createRadialGradient(
                    exportCanvas.width / 2, exportCanvas.height / 2, 0,
                    exportCanvas.width / 2, exportCanvas.height / 2, exportCanvas.width / 2
                );

                // 使用自定义位置
                const pos1 = this.gradientPositions[0] / 100;
                const pos2 = this.gradientPositions[1] / 100;
                const pos3 = this.gradientPositions[2] / 100;

                gradient.addColorStop(pos1, this.extractedColors[0]);
                gradient.addColorStop(pos2, this.extractedColors[1]);
                gradient.addColorStop(pos3, this.extractedColors[2]);
                ctx.fillStyle = gradient;
            }
        } else {
            // 默认背景色
            ctx.fillStyle = this.boardColor;
        }

        // 填充背景
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // 计算书签在背景板中的位置（水平居中，垂直有上下边距）
        const bookmarkX = (exportCanvas.width - this.canvas.width) / 2;

        // 添加上下边距，使书签在背景板中垂直居中，但留有一定边距
        const verticalMargin = exportCanvas.height * 0.15; // 上下边距各为背景板高度的15%
        const availableHeight = exportCanvas.height - (verticalMargin * 2); // 可用高度

        // 计算书签Y位置
        let bookmarkY;

        // 如果书签高度小于可用高度，则居中放置；否则，使用固定边距
        if (this.canvas.height <= availableHeight) {
            bookmarkY = (exportCanvas.height - this.canvas.height) / 2; // 垂直居中
        } else {
            bookmarkY = verticalMargin; // 使用固定上边距
        }

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
