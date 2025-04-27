/**
 * canvas.js - 书签卡片编辑器的Canvas核心模块
 * 负责Canvas初始化、缩放、坐标系统和基本绘制功能
 * 支持高清图片处理和DPR适配
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

        // 获取设备像素比
        this.dpr = window.devicePixelRatio || 1;

        // 缩放比例
        this.scale = 1;

        // 背景板设置
        this.boardColor = '#F5F5F5';
        this.boardColorInput = document.getElementById('boardColor');
        this.boardGradientType = document.getElementById('boardGradientType');
        this.boardGradientAngle = document.getElementById('boardGradientAngle');
        this.boardGradientAngleValue = document.getElementById('boardGradientAngleValue');

        // 背景板尺寸和比例
        this.boardRatio = document.getElementById('boardRatio');
        this.boardWidth = document.getElementById('boardWidth');
        this.boardHeight = document.getElementById('boardHeight');

        // 书签缩放
        this.bookmarkScale = document.getElementById('bookmarkScale');
        this.bookmarkScaleValue = document.getElementById('bookmarkScaleValue');
        this.currentScale = 100; // 当前缩放百分比

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

        // 书签位置控制
        this.bookmarkPosition = document.getElementById('bookmarkPosition');
        this.bookmarkX = document.getElementById('bookmarkX');
        this.bookmarkY = document.getElementById('bookmarkY');
        this.bookmarkXUnit = document.getElementById('bookmarkXUnit');
        this.bookmarkYUnit = document.getElementById('bookmarkYUnit');

        // 书签位置数据
        this.bookmarkPositionData = {
            x: 0, // 百分比或像素，0表示居中
            y: 0, // 百分比或像素，0表示垂直居中
            xUnit: 'percent', // 'percent' 或 'px'
            yUnit: 'percent', // 'percent' 或 'px'
            preset: 'center' // 预设位置
        };

        // 拖动状态
        this.dragState = {
            dragging: false,
            startX: 0,
            startY: 0,
            startBookmarkX: 0,
            startBookmarkY: 0
        };

        // 初始化Canvas
        this.initCanvas();

        // 绑定事件
        this.bindEvents();
    }

    // 初始化Canvas
    initCanvas() {
        // 设置Canvas尺寸，考虑设备像素比以支持高清显示
        const displayWidth = this.standardWidth;
        const displayHeight = this.standardHeight;

        // 设置Canvas的CSS尺寸
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        // 设置Canvas的实际尺寸（乘以设备像素比）
        this.canvas.width = Math.floor(displayWidth * this.dpr);
        this.canvas.height = Math.floor(displayHeight * this.dpr);

        // 缩放上下文以匹配设备像素比
        this.ctx.scale(this.dpr, this.dpr);

        // 清除Canvas
        this.clear();

        // 初始化背景板尺寸和书签位置
        setTimeout(() => {
            // 初始化背景板尺寸
            this.updateBoardSize();

            // 初始化书签缩放
            this.applyBookmarkScale();

            // 初始化书签位置
            this.updateBookmarkPositionUI();
            this.updateBookmarkPosition();
        }, 100);
    }

    // 清除Canvas
    clear() {
        // 考虑DPR缩放后的尺寸
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
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
            console.log(`设置渐变角度: ${this.gradientAngle}°`); // 添加日志
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

        // 书签位置预设选择事件
        this.bookmarkPosition.addEventListener('change', (e) => {
            this.bookmarkPositionData.preset = e.target.value;

            // 根据预设更新位置
            if (e.target.value !== 'custom') {
                this.applyPresetPosition(e.target.value);
            }

            // 更新UI
            this.updateBookmarkPositionUI();

            // 更新书签位置
            this.updateBookmarkPosition();
        });

        // X位置输入事件
        this.bookmarkX.addEventListener('input', (e) => {
            this.bookmarkPositionData.x = parseFloat(e.target.value);
            this.bookmarkPositionData.preset = 'custom';
            this.bookmarkPosition.value = 'custom';
            this.updateBookmarkPosition();
        });

        // Y位置输入事件
        this.bookmarkY.addEventListener('input', (e) => {
            this.bookmarkPositionData.y = parseFloat(e.target.value);
            this.bookmarkPositionData.preset = 'custom';
            this.bookmarkPosition.value = 'custom';
            this.updateBookmarkPosition();
        });

        // X单位选择事件
        this.bookmarkXUnit.addEventListener('change', (e) => {
            this.bookmarkPositionData.xUnit = e.target.value;
            this.bookmarkPositionData.preset = 'custom';
            this.bookmarkPosition.value = 'custom';
            this.updateBookmarkPosition();
        });

        // Y单位选择事件
        this.bookmarkYUnit.addEventListener('change', (e) => {
            this.bookmarkPositionData.yUnit = e.target.value;
            this.bookmarkPositionData.preset = 'custom';
            this.bookmarkPosition.value = 'custom';
            this.updateBookmarkPosition();
        });

        // 书签拖动事件
        this.canvas.addEventListener('mousedown', (e) => {
            // 获取Canvas容器
            const canvasContainer = document.querySelector('.canvas-container');

            // 获取当前位置
            const currentLeft = parseInt(canvasContainer.style.left) || 0;
            const currentTop = parseInt(canvasContainer.style.top) || 0;

            // 设置拖动状态
            this.dragState.dragging = true;
            this.dragState.startX = e.clientX;
            this.dragState.startY = e.clientY;
            this.dragState.startBookmarkX = currentLeft;
            this.dragState.startBookmarkY = currentTop;

            // 切换到自定义位置
            this.bookmarkPositionData.preset = 'custom';
            this.bookmarkPosition.value = 'custom';

            // 阻止默认事件和冒泡
            e.preventDefault();
            e.stopPropagation();
        });

        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (!this.dragState.dragging) return;

            // 计算移动距离
            const deltaX = e.clientX - this.dragState.startX;
            const deltaY = e.clientY - this.dragState.startY;

            // 获取背景板尺寸
            const boardElement = document.querySelector('.background-board');
            const boardWidth = boardElement.offsetWidth;
            const boardHeight = boardElement.offsetHeight;

            // 计算新位置（像素）
            const newLeft = this.dragState.startBookmarkX + deltaX;
            const newTop = this.dragState.startBookmarkY + deltaY;

            // 更新书签位置数据
            if (this.bookmarkPositionData.xUnit === 'px') {
                this.bookmarkPositionData.x = newLeft;
            } else {
                // 获取当前缩放比例
                const scaleRatio = this.currentScale / 100;

                // 获取缩放后的书签尺寸
                const scaledWidth = this.canvas.width * scaleRatio;

                // 计算书签中心点
                const bookmarkCenterX = newLeft + scaledWidth / 2;

                // 计算背景板中心点
                const boardCenterX = boardWidth / 2;

                // 计算中心点偏移量
                const offsetFromCenter = bookmarkCenterX - boardCenterX;

                // 将偏移转换为百分比（相对于背景板宽度的百分比）
                this.bookmarkPositionData.x = (offsetFromCenter / boardWidth) * 100 * 2; // *2因为我们使用的是-50%到50%的范围
            }

            if (this.bookmarkPositionData.yUnit === 'px') {
                this.bookmarkPositionData.y = newTop;
            } else {
                // 将像素位置转换为百分比
                this.bookmarkPositionData.y = (newTop / boardHeight) * 100;
            }

            // 更新UI
            this.updateBookmarkPositionUI();

            // 更新书签位置
            this.updateBookmarkPosition();

            // 阻止默认事件
            e.preventDefault();
        });

        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            this.dragState.dragging = false;
        });

        // 背景板比例选择事件
        this.boardRatio.addEventListener('change', (e) => {
            const ratio = e.target.value;

            if (ratio !== 'custom') {
                // 解析比例
                const [width, height] = ratio.split(':').map(Number);

                // 保持当前宽度，调整高度
                const currentWidth = parseInt(this.boardWidth.value);
                const newHeight = Math.round(currentWidth * height / width);

                // 更新输入框
                this.boardHeight.value = newHeight;

                // 应用新尺寸
                this.updateBoardSize();
            }
        });

        // 背景板宽度输入事件
        this.boardWidth.addEventListener('input', (e) => {
            const width = parseInt(e.target.value);

            // 如果不是自定义比例，则根据比例调整高度
            if (this.boardRatio.value !== 'custom') {
                const [ratioWidth, ratioHeight] = this.boardRatio.value.split(':').map(Number);
                const newHeight = Math.round(width * ratioHeight / ratioWidth);
                this.boardHeight.value = newHeight;
            }

            // 切换到自定义比例
            this.boardRatio.value = 'custom';

            // 应用新尺寸
            this.updateBoardSize();
        });

        // 背景板高度输入事件
        this.boardHeight.addEventListener('input', () => {
            // 切换到自定义比例
            this.boardRatio.value = 'custom';

            // 应用新尺寸
            this.updateBoardSize();
        });

        // 书签缩放事件
        this.bookmarkScale.addEventListener('input', (e) => {
            this.currentScale = parseInt(e.target.value);
            this.bookmarkScaleValue.textContent = `${this.currentScale}%`;

            // 应用缩放
            this.applyBookmarkScale();

            // 更新书签位置
            this.updateBookmarkPosition();
        });

        // 监听背景板大小变化（拖拽调整大小）
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target.classList.contains('background-board')) {
                    // 更新尺寸输入框
                    this.boardWidth.value = Math.round(entry.contentRect.width);
                    this.boardHeight.value = Math.round(entry.contentRect.height);

                    // 切换到自定义比例
                    this.boardRatio.value = 'custom';

                    // 更新书签位置
                    this.updateBookmarkPosition();
                }
            }
        });

        // 观察背景板元素
        resizeObserver.observe(document.querySelector('.background-board'));
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
                console.log('canvas this.gradientAngle: ',this.gradientAngle)
                boardElement.style.background = `linear-gradient(${(this.gradientAngle + 90) % 360}deg,
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

    // 应用预设位置
    applyPresetPosition(preset) {
        switch (preset) {
            case 'center':
                this.bookmarkPositionData.x = 0; // 水平居中
                this.bookmarkPositionData.y = 0; // 垂直居中
                this.bookmarkPositionData.xUnit = 'percent';
                this.bookmarkPositionData.yUnit = 'percent';
                break;

            case 'top':
                this.bookmarkPositionData.x = 0; // 水平居中
                this.bookmarkPositionData.y = 5; // 靠近顶部
                this.bookmarkPositionData.xUnit = 'percent';
                this.bookmarkPositionData.yUnit = 'percent';
                break;

            case 'bottom':
                this.bookmarkPositionData.x = 0; // 水平居中
                this.bookmarkPositionData.y = 70; // 靠近底部
                this.bookmarkPositionData.xUnit = 'percent';
                this.bookmarkPositionData.yUnit = 'percent';
                break;

            case 'left':
                this.bookmarkPositionData.x = -30; // 向左偏移
                this.bookmarkPositionData.y = 0; // 垂直居中
                this.bookmarkPositionData.xUnit = 'percent';
                this.bookmarkPositionData.yUnit = 'percent';
                break;

            case 'right':
                this.bookmarkPositionData.x = 30; // 向右偏移
                this.bookmarkPositionData.y = 0; // 垂直居中
                this.bookmarkPositionData.xUnit = 'percent';
                this.bookmarkPositionData.yUnit = 'percent';
                break;
        }
    }

    // 更新书签位置UI
    updateBookmarkPositionUI() {
        // 更新输入框
        this.bookmarkX.value = this.bookmarkPositionData.x;
        this.bookmarkY.value = this.bookmarkPositionData.y;

        // 更新单位选择
        this.bookmarkXUnit.value = this.bookmarkPositionData.xUnit;
        this.bookmarkYUnit.value = this.bookmarkPositionData.yUnit;
    }

    // 更新背景板尺寸
    updateBoardSize() {
        const boardElement = document.querySelector('.background-board');
        const width = parseInt(this.boardWidth.value);
        const height = parseInt(this.boardHeight.value);

        // 应用新尺寸
        boardElement.style.width = `${width}px`;
        boardElement.style.height = `${height}px`;

        // 更新书签位置
        this.updateBookmarkPosition();
    }

    // 应用书签缩放
    applyBookmarkScale() {
        // 更新书签位置，考虑缩放因素
        this.updateBookmarkPosition();
    }

    // 更新书签位置
    updateBookmarkPosition() {
        // 如果存在书签管理器，使用它来更新所有书签的位置
        if (bookmarkManager) {
            // 获取当前选中的书签
            const selectedBookmark = bookmarkManager.getSelectedBookmark();
            if (selectedBookmark) {
                // 更新选中书签的位置数据
                selectedBookmark.position = this.bookmarkPositionData;

                // 更新选中书签的缩放比例
                selectedBookmark.scale = this.currentScale;

                // 重新渲染所有书签
                bookmarkManager.updateLayout();
            }

            // 更新单个书签的显示（用于编辑预览）
            this.updateSingleBookmarkDisplay();
        } else {
            // 兼容旧版本的单书签位置更新
            this.updateSingleBookmarkDisplay();
        }
    }

    // 更新单个书签显示（用于编辑预览）
    updateSingleBookmarkDisplay() {
        const canvasContainer = document.querySelector('.canvas-container');
        const boardElement = document.querySelector('.background-board');

        // 获取当前缩放比例
        const scaleRatio = this.currentScale / 100;

        // 重要：设置transform-origin为左上角，这样缩放不会影响位置计算
        canvasContainer.style.transformOrigin = 'top left';

        // 应用缩放
        canvasContainer.style.transform = `scale(${scaleRatio})`;

        // 计算位置
        let x, y;

        // 获取原始书签尺寸（未缩放）
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;

        // 获取缩放后的书签尺寸
        const scaledWidth = originalWidth * scaleRatio;
        const scaledHeight = originalHeight * scaleRatio;

        // X位置计算
        if (this.bookmarkPositionData.xUnit === 'px') {
            x = this.bookmarkPositionData.x;
        } else {
            // 百分比计算
            const boardWidth = boardElement.offsetWidth;

            // 当百分比为0时，表示居中
            if (this.bookmarkPositionData.x === 0) {
                x = (boardWidth - scaledWidth) / 2;
            } else {
                // 计算百分比位置
                const percentX = this.bookmarkPositionData.x;
                // 将百分比转换为相对于背景板的位置
                x = (boardWidth * (50 + percentX) / 100) - (scaledWidth / 2);
            }
        }

        // Y位置计算
        if (this.bookmarkPositionData.yUnit === 'px') {
            y = this.bookmarkPositionData.y;
        } else {
            // 百分比计算
            const boardHeight = boardElement.offsetHeight;

            // 当百分比为0时，表示垂直居中
            if (this.bookmarkPositionData.y === 0) {
                y = (boardHeight - scaledHeight) / 2;
            } else {
                // 计算百分比位置
                const percentY = this.bookmarkPositionData.y;
                // 将百分比转换为相对于背景板的位置
                y = (boardHeight * percentY / 100);
            }
        }

        // 应用位置 - 使用绝对定位
        canvasContainer.style.left = `${x}px`;
        canvasContainer.style.top = `${y}px`;
    }

    // 渲染Canvas
    render() {
        // 清除Canvas
        this.clear();

        // 不再需要在主Canvas上渲染书签，因为书签现在是DOM元素
        // 只需要在导出时渲染

        // 兼容旧版本，渲染图层
        if (layerManager) {
            layerManager.renderLayers(this.ctx);
        }
    }

    // 更新书签UI
    updateBookmarkUI(bookmark) {
        if (!bookmark) return;

        // 更新位置UI
        this.bookmarkPositionData = bookmark.position;
        this.updateBookmarkPositionUI();

        // 更新缩放UI
        this.currentScale = bookmark.scale;

        // 确保书签位置正确
        if (bookmark.position.preset === 'center') {
            bookmark.position.x = 0;
            bookmark.position.y = 0;
        }

        // 通知书签管理器更新布局
        if (this.bookmarkManager) {
            this.bookmarkManager.updateLayout();
        }

        // 重新渲染Canvas
        this.render();

        console.log(`Canvas: 更新书签UI，位置: (${bookmark.position.x}, ${bookmark.position.y}), 预设: ${bookmark.position.preset}`);
    }

    // 更新书签位置
    updateBookmarkPosition() {
        // 重新渲染Canvas
        this.render();
    }

    // 获取Canvas数据URL
    getDataURL() {
        return this.canvas.toDataURL('image/png');
    }

    // 导出为图片（包含背景板）
    exportImage() {
        console.log('BookmarkCanvas: 开始导出图片');

        // 创建一个新的Canvas来绘制完整的书签（包括背景板）
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d', { willReadFrequently: true });

        // 启用图像平滑，使模糊效果更好
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 设置导出Canvas的尺寸为背景板的实际尺寸，并考虑设备像素比以实现高清导出
        const boardWidth = parseInt(this.boardWidth.value);
        const boardHeight = parseInt(this.boardHeight.value);

        // 应用设备像素比以获得高清输出
        exportCanvas.width = boardWidth * this.dpr;
        exportCanvas.height = boardHeight * this.dpr;

        // 缩放上下文以匹配设备像素比
        ctx.scale(this.dpr, this.dpr);

        // 绘制背景板
        if (this.gradientType === 'none') {
            // 纯色背景
            ctx.fillStyle = this.boardColor;
        } else if (this.extractedColors && this.extractedColors.length >= 3) {
            // 使用提取的颜色创建渐变
            if (this.gradientType === 'linear') {
                // 线性渐变 - 使用指定角度
                // 注意：这里需要使用正确的角度值
                // 在Canvas中，角度是从x轴正方向开始，逆时针旋转
                // 而在CSS中，角度是从y轴负方向开始，顺时针旋转
                // 所以需要进行转换：Canvas角度 = CSS角度
                const canvasAngle = this.gradientAngle;
                const angleRad = canvasAngle * Math.PI / 180;

                // 使用与layers.js中完全相同的计算方式
                // 计算渐变起点和终点
                const x0 = boardWidth / 2 - Math.cos(angleRad) * boardWidth / 2;
                const y0 = boardHeight / 2 - Math.sin(angleRad) * boardHeight / 2;
                const x1 = boardWidth / 2 + Math.cos(angleRad) * boardWidth / 2;
                const y1 = boardHeight / 2 + Math.sin(angleRad) * boardHeight / 2;

                console.log(`渐变角度: ${this.gradientAngle}°, 起点: (${x0}, ${y0}), 终点: (${x1}, ${y1})`);

                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

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
                    boardWidth / 2, boardHeight / 2, 0,
                    boardWidth / 2, boardHeight / 2, Math.max(boardWidth, boardHeight) / 2
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

        // 填充背景 - 注意这里需要使用正确的尺寸（考虑DPR缩放）
        ctx.fillRect(0, 0, boardWidth, boardHeight);

        // 如果存在书签管理器，使用它来渲染所有书签
        if (bookmarkManager) {
            bookmarkManager.renderToExportCanvas(ctx, boardWidth, boardHeight);
        } else {
            // 兼容旧版本的单书签渲染
            this.renderSingleBookmarkToExport(ctx, boardWidth, boardHeight);
        }

        // 导出为图片
        const dataURL = exportCanvas.toDataURL('image/png');

        // 创建唯一的文件名（使用时间戳）
        const timestamp = new Date().getTime();
        const filename = `书签卡片_${timestamp}.png`;

        // 创建下载链接
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;

        // 添加到文档中，触发点击，然后移除
        document.body.appendChild(link);
        link.click();

        // 延迟移除链接元素
        setTimeout(() => {
            document.body.removeChild(link);
            console.log(`BookmarkCanvas: 导出完成: ${filename}`);
        }, 100);
    }

    // 渲染单个书签到导出Canvas（兼容旧版本）
    renderSingleBookmarkToExport(ctx, boardWidth, boardHeight) {
        // 计算书签在背景板中的位置（使用用户设置的位置）
        let bookmarkX, bookmarkY;

        // 获取当前缩放比例
        const scaleRatio = this.currentScale / 100;

        // 获取原始书签尺寸（未缩放）
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;

        // 获取缩放后的书签尺寸
        const scaledWidth = originalWidth * scaleRatio;
        const scaledHeight = originalHeight * scaleRatio;

        // X位置计算
        if (this.bookmarkPositionData.xUnit === 'px') {
            bookmarkX = this.bookmarkPositionData.x;
        } else {
            // 百分比计算
            // 当百分比为0时，表示居中
            if (this.bookmarkPositionData.x === 0) {
                bookmarkX = (boardWidth - scaledWidth) / 2;
            } else {
                // 计算百分比位置
                const percentX = this.bookmarkPositionData.x;
                // 将百分比转换为相对于背景板的位置
                bookmarkX = (boardWidth * (50 + percentX) / 100) - (scaledWidth / 2);
            }
        }

        // Y位置计算
        if (this.bookmarkPositionData.yUnit === 'px') {
            bookmarkY = this.bookmarkPositionData.y;
        } else {
            // 百分比计算
            // 当百分比为0时，表示垂直居中
            if (this.bookmarkPositionData.y === 0) {
                bookmarkY = (boardHeight - scaledHeight) / 2;
            } else {
                // 计算百分比位置
                const percentY = this.bookmarkPositionData.y;
                // 将百分比转换为相对于背景板的位置
                bookmarkY = (boardHeight * percentY / 100);
            }
        }

        // 创建临时Canvas来处理缩放
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // 设置临时Canvas尺寸，考虑设备像素比
        tempCanvas.width = scaledWidth * this.dpr;
        tempCanvas.height = scaledHeight * this.dpr;

        // 缩放上下文以匹配设备像素比
        tempCtx.scale(this.dpr, this.dpr);

        // 在临时Canvas上绘制缩放后的书签
        tempCtx.drawImage(this.canvas, 0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr,
                          0, 0, scaledWidth, scaledHeight);

        // 如果启用了阴影，使用临时Canvas创建带阴影的书签
        if (shadowManager && shadowManager.getShadowSettings().enabled) {
            console.log('Canvas: 应用阴影到导出图片');

            // 创建带阴影的书签
            const shadowResult = shadowManager.applyShadowToCanvas(null, 0, 0, scaledWidth, scaledHeight);

            if (shadowResult) {
                // 获取带阴影的临时Canvas
                const shadowCanvas = shadowResult.canvas;
                const shadowOffsetX = shadowResult.offsetX;
                const shadowOffsetY = shadowResult.offsetY;

                // 在阴影Canvas上绘制实际的书签内容
                const shadowCtx = shadowCanvas.getContext('2d');

                // 先保存当前状态
                shadowCtx.save();

                // 绘制书签内容到阴影Canvas上
                shadowCtx.drawImage(tempCanvas, shadowOffsetX, shadowOffsetY, scaledWidth, scaledHeight);

                // 恢复状态
                shadowCtx.restore();

                // 将带阴影的书签绘制到导出Canvas上
                ctx.drawImage(
                    shadowCanvas,
                    0, 0, shadowCanvas.width, shadowCanvas.height,
                    bookmarkX - shadowOffsetX, bookmarkY - shadowOffsetY, shadowCanvas.width, shadowCanvas.height
                );

                console.log('Canvas: 阴影应用成功');
            } else {
                // 如果阴影创建失败，直接绘制书签
                console.log('Canvas: 阴影创建失败，直接绘制书签');
                ctx.drawImage(tempCanvas, bookmarkX, bookmarkY, scaledWidth, scaledHeight);
            }
        } else {
            console.log('Canvas: 导出时未应用阴影');

            // 将缩放后的书签直接绘制到导出Canvas上
            ctx.drawImage(tempCanvas, bookmarkX, bookmarkY, scaledWidth, scaledHeight);
        }
    }
}

// 创建Canvas管理器实例
let canvasManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    canvasManager = new BookmarkCanvas('bookmarkCanvas');

    // 初始化书签管理器
    bookmarkManager = new BookmarkManager(canvasManager);
});
