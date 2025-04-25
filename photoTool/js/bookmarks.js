/**
 * bookmarks.js - 书签卡片编辑器的多书签管理模块
 * 负责管理多个书签的创建、布局和渲染
 */

// 单个书签类
class Bookmark {
    constructor(id) {
        this.id = id;
        this.width = 200;
        this.height = 600;
        this.scale = 100; // 缩放百分比
        this.position = {
            x: 0, // 百分比或像素，0表示居中
            y: 0, // 百分比或像素，0表示垂直居中
            xUnit: 'percent', // 'percent' 或 'px'
            yUnit: 'percent', // 'percent' 或 'px'
            preset: 'center' // 预设位置
        };
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // 设置Canvas尺寸
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // 初始化Canvas
        this.initCanvas();
    }

    // 初始化Canvas
    initCanvas() {
        // 清除Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染各个图层
        if (layerManager) {
            layerManager.renderLayers(this.ctx);
        }
    }

    // 获取缩放后的尺寸
    getScaledDimensions() {
        const scaleRatio = this.scale / 100;
        return {
            width: this.width * scaleRatio,
            height: this.height * scaleRatio
        };
    }

    // 计算在背景板中的位置
    calculatePosition(boardWidth, boardHeight) {
        const { width, height } = this.getScaledDimensions();
        let x, y;

        // X位置计算
        if (this.position.xUnit === 'px') {
            x = this.position.x;
        } else {
            // 百分比计算
            // 当百分比为0时，表示居中
            if (this.position.x === 0) {
                x = (boardWidth - width) / 2;
            } else {
                // 计算百分比位置
                const percentX = this.position.x;
                // 将百分比转换为相对于背景板的位置
                x = (boardWidth * (50 + percentX) / 100) - (width / 2);
            }
        }

        // Y位置计算
        if (this.position.yUnit === 'px') {
            y = this.position.y;
        } else {
            // 百分比计算
            // 当百分比为0时，表示垂直居中
            if (this.position.y === 0) {
                y = (boardHeight - height) / 2;
            } else {
                // 计算百分比位置
                const percentY = this.position.y;
                // 将百分比转换为相对于背景板的位置
                y = (boardHeight * percentY / 100);
            }
        }

        return { x, y };
    }

    // 应用预设位置
    applyPresetPosition(preset) {
        switch (preset) {
            case 'center':
                this.position.x = 0; // 水平居中
                this.position.y = 0; // 垂直居中
                this.position.xUnit = 'percent';
                this.position.yUnit = 'percent';
                break;

            case 'top':
                this.position.x = 0; // 水平居中
                this.position.y = 5; // 靠近顶部
                this.position.xUnit = 'percent';
                this.position.yUnit = 'percent';
                break;

            case 'bottom':
                this.position.x = 0; // 水平居中
                this.position.y = 70; // 靠近底部
                this.position.xUnit = 'percent';
                this.position.yUnit = 'percent';
                break;

            case 'left':
                this.position.x = -30; // 向左偏移
                this.position.y = 0; // 垂直居中
                this.position.xUnit = 'percent';
                this.position.yUnit = 'percent';
                break;

            case 'right':
                this.position.x = 30; // 向右偏移
                this.position.y = 0; // 垂直居中
                this.position.xUnit = 'percent';
                this.position.yUnit = 'percent';
                break;
        }
    }

    // 渲染书签到指定的上下文
    render(ctx, x, y, width, height) {
        ctx.drawImage(this.canvas, x, y, width, height);
    }
}

// 书签管理器类
class BookmarkManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.bookmarks = [];
        this.selectedBookmarkIndex = -1;
        this.spacing = 20; // 书签之间的间距（像素）
        this.layoutType = 'auto'; // 布局类型：auto, grid, horizontal, vertical, custom

        // 初始化UI元素
        this.bookmarkCountSelect = document.getElementById('bookmarkCount');
        this.bookmarkListContainer = document.getElementById('bookmarkList');
        this.bookmarkSpacingInput = document.getElementById('bookmarkSpacing');
        this.bookmarkSpacingValue = document.getElementById('bookmarkSpacingValue');

        // 绑定事件
        this.bindEvents();

        // 创建默认书签
        this.addBookmark();
    }

    // 绑定事件
    bindEvents() {
        // 书签数量选择事件
        if (this.bookmarkCountSelect) {
            this.bookmarkCountSelect.addEventListener('change', (e) => {
                const count = parseInt(e.target.value);
                this.setBookmarkCount(count);
            });
        }

        // 书签间距调整事件
        if (this.bookmarkSpacingInput) {
            this.bookmarkSpacingInput.addEventListener('input', (e) => {
                this.spacing = parseInt(e.target.value);
                this.bookmarkSpacingValue.textContent = `${this.spacing}px`;
                this.updateLayout();
            });
        }

        // 添加书签按钮事件
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        if (addBookmarkBtn) {
            addBookmarkBtn.addEventListener('click', () => {
                // 检查是否已达到最大书签数量
                if (this.bookmarks.length >= 8) {
                    alert('最多只能添加8个书签');
                    return;
                }

                // 添加新书签
                this.addBookmark();

                // 选中新添加的书签
                this.selectBookmark(this.bookmarks.length - 1);

                // 更新书签数量选择器
                if (this.bookmarkCountSelect) {
                    this.bookmarkCountSelect.value = this.bookmarks.length.toString();
                }
            });
        }

        // 删除书签按钮事件
        const removeBookmarkBtn = document.getElementById('removeBookmarkBtn');
        if (removeBookmarkBtn) {
            removeBookmarkBtn.addEventListener('click', () => {
                // 检查是否有选中的书签
                if (this.selectedBookmarkIndex < 0) {
                    alert('请先选择要删除的书签');
                    return;
                }

                // 检查是否只剩一个书签
                if (this.bookmarks.length <= 1) {
                    alert('至少需要保留一个书签');
                    return;
                }

                // 删除选中的书签
                this.removeBookmark(this.selectedBookmarkIndex);

                // 更新书签数量选择器
                if (this.bookmarkCountSelect) {
                    this.bookmarkCountSelect.value = this.bookmarks.length.toString();
                }
            });
        }
    }

    // 添加新书签
    addBookmark() {
        const id = `bookmark_${this.bookmarks.length + 1}`;
        const bookmark = new Bookmark(id);
        this.bookmarks.push(bookmark);

        // 更新布局
        this.updateLayout();

        // 更新UI
        this.updateBookmarkList();

        return bookmark;
    }

    // 移除书签
    removeBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            this.bookmarks.splice(index, 1);

            // 更新选中的书签
            if (this.selectedBookmarkIndex === index) {
                this.selectedBookmarkIndex = Math.min(index, this.bookmarks.length - 1);
            } else if (this.selectedBookmarkIndex > index) {
                this.selectedBookmarkIndex--;
            }

            // 更新布局
            this.updateLayout();

            // 更新UI
            this.updateBookmarkList();
        }
    }

    // 设置书签数量
    setBookmarkCount(count) {
        // 确保count在1-8之间
        count = Math.max(1, Math.min(8, count));

        // 当前书签数量
        const currentCount = this.bookmarks.length;

        if (count > currentCount) {
            // 添加书签
            for (let i = currentCount; i < count; i++) {
                this.addBookmark();
            }
        } else if (count < currentCount) {
            // 移除书签
            for (let i = currentCount - 1; i >= count; i--) {
                this.removeBookmark(i);
            }
        }

        // 更新布局
        this.updateLayout();
    }

    // 选择书签
    selectBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            this.selectedBookmarkIndex = index;

            // 更新UI
            this.updateBookmarkList();

            // 通知Canvas管理器更新UI
            if (this.canvasManager) {
                this.canvasManager.updateBookmarkUI(this.bookmarks[index]);
            }
        }
    }

    // 获取当前选中的书签
    getSelectedBookmark() {
        if (this.selectedBookmarkIndex >= 0 && this.selectedBookmarkIndex < this.bookmarks.length) {
            return this.bookmarks[this.selectedBookmarkIndex];
        }
        return null;
    }

    // 更新书签列表UI
    updateBookmarkList() {
        if (!this.bookmarkListContainer) return;

        // 清空列表
        this.bookmarkListContainer.innerHTML = '';

        // 添加书签列表项
        this.bookmarks.forEach((bookmark, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'bookmark-item';
            if (index === this.selectedBookmarkIndex) {
                listItem.classList.add('selected');
            }

            listItem.textContent = `书签 ${index + 1}`;
            listItem.addEventListener('click', () => {
                this.selectBookmark(index);
            });

            this.bookmarkListContainer.appendChild(listItem);
        });
    }

    // 更新所有书签的布局
    updateLayout() {
        if (this.layoutType === 'auto') {
            this.applyAutoLayout();
        } else if (this.layoutType === 'grid') {
            this.applyGridLayout();
        } else if (this.layoutType === 'horizontal') {
            this.applyHorizontalLayout();
        } else if (this.layoutType === 'vertical') {
            this.applyVerticalLayout();
        }

        // 通知Canvas管理器重新渲染
        if (this.canvasManager) {
            this.canvasManager.render();
        }
    }

    // 根据书签数量自动选择布局
    applyAutoLayout() {
        const count = this.bookmarks.length;

        switch(count) {
            case 1: this.applySingleLayout(); break;
            case 2: this.applyDoubleLayout(); break;
            case 3: this.applyTripleLayout(); break;
            case 4: this.applyQuadLayout(); break;
            case 5: this.applyPentaLayout(); break;
            case 6: this.applyHexaLayout(); break;
            case 7: this.applyHeptaLayout(); break;
            case 8: this.applyOctaLayout(); break;
        }
    }

    // 单个书签布局
    applySingleLayout() {
        if (this.bookmarks.length === 0) return;

        // 单个书签居中
        const bookmark = this.bookmarks[0];
        bookmark.position.x = 0;
        bookmark.position.y = 0;
        bookmark.position.xUnit = 'percent';
        bookmark.position.yUnit = 'percent';
        bookmark.position.preset = 'center';
    }

    // 两个书签布局
    applyDoubleLayout() {
        if (this.bookmarks.length < 2) return;

        // 两个书签水平排列
        this.bookmarks[0].position.x = -25;
        this.bookmarks[0].position.y = 0;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = 25;
        this.bookmarks[1].position.y = 0;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';
    }

    // 三个书签布局
    applyTripleLayout() {
        if (this.bookmarks.length < 3) return;

        // 三角形布局：上方一个居中，下方两个左右对称
        this.bookmarks[0].position.x = 0;
        this.bookmarks[0].position.y = 10;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = -25;
        this.bookmarks[1].position.y = 60;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = 25;
        this.bookmarks[2].position.y = 60;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';
    }

    // 四个书签布局
    applyQuadLayout() {
        if (this.bookmarks.length < 4) return;

        // 2×2网格布局
        this.bookmarks[0].position.x = -25;
        this.bookmarks[0].position.y = 20;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = 25;
        this.bookmarks[1].position.y = 20;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = -25;
        this.bookmarks[2].position.y = 60;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';

        this.bookmarks[3].position.x = 25;
        this.bookmarks[3].position.y = 60;
        this.bookmarks[3].position.xUnit = 'percent';
        this.bookmarks[3].position.yUnit = 'percent';
    }

    // 五个书签布局
    applyPentaLayout() {
        if (this.bookmarks.length < 5) return;

        // 十字布局：中央一个，上下左右各一个
        this.bookmarks[0].position.x = 0;
        this.bookmarks[0].position.y = 40;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = 0;
        this.bookmarks[1].position.y = 10;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = 25;
        this.bookmarks[2].position.y = 40;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';

        this.bookmarks[3].position.x = 0;
        this.bookmarks[3].position.y = 70;
        this.bookmarks[3].position.xUnit = 'percent';
        this.bookmarks[3].position.yUnit = 'percent';

        this.bookmarks[4].position.x = -25;
        this.bookmarks[4].position.y = 40;
        this.bookmarks[4].position.xUnit = 'percent';
        this.bookmarks[4].position.yUnit = 'percent';
    }

    // 六个书签布局
    applyHexaLayout() {
        if (this.bookmarks.length < 6) return;

        // 2×3网格布局
        this.bookmarks[0].position.x = -25;
        this.bookmarks[0].position.y = 15;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = 0;
        this.bookmarks[1].position.y = 15;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = 25;
        this.bookmarks[2].position.y = 15;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';

        this.bookmarks[3].position.x = -25;
        this.bookmarks[3].position.y = 60;
        this.bookmarks[3].position.xUnit = 'percent';
        this.bookmarks[3].position.yUnit = 'percent';

        this.bookmarks[4].position.x = 0;
        this.bookmarks[4].position.y = 60;
        this.bookmarks[4].position.xUnit = 'percent';
        this.bookmarks[4].position.yUnit = 'percent';

        this.bookmarks[5].position.x = 25;
        this.bookmarks[5].position.y = 60;
        this.bookmarks[5].position.xUnit = 'percent';
        this.bookmarks[5].position.yUnit = 'percent';
    }

    // 七个书签布局
    applyHeptaLayout() {
        if (this.bookmarks.length < 7) return;

        // 六边形+中心布局
        this.bookmarks[0].position.x = 0;
        this.bookmarks[0].position.y = 40;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = 0;
        this.bookmarks[1].position.y = 10;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = 20;
        this.bookmarks[2].position.y = 20;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';

        this.bookmarks[3].position.x = 20;
        this.bookmarks[3].position.y = 60;
        this.bookmarks[3].position.xUnit = 'percent';
        this.bookmarks[3].position.yUnit = 'percent';

        this.bookmarks[4].position.x = 0;
        this.bookmarks[4].position.y = 70;
        this.bookmarks[4].position.xUnit = 'percent';
        this.bookmarks[4].position.yUnit = 'percent';

        this.bookmarks[5].position.x = -20;
        this.bookmarks[5].position.y = 60;
        this.bookmarks[5].position.xUnit = 'percent';
        this.bookmarks[5].position.yUnit = 'percent';

        this.bookmarks[6].position.x = -20;
        this.bookmarks[6].position.y = 20;
        this.bookmarks[6].position.xUnit = 'percent';
        this.bookmarks[6].position.yUnit = 'percent';
    }

    // 八个书签布局
    applyOctaLayout() {
        if (this.bookmarks.length < 8) return;

        // 2×4网格布局
        this.bookmarks[0].position.x = -30;
        this.bookmarks[0].position.y = 20;
        this.bookmarks[0].position.xUnit = 'percent';
        this.bookmarks[0].position.yUnit = 'percent';

        this.bookmarks[1].position.x = -10;
        this.bookmarks[1].position.y = 20;
        this.bookmarks[1].position.xUnit = 'percent';
        this.bookmarks[1].position.yUnit = 'percent';

        this.bookmarks[2].position.x = 10;
        this.bookmarks[2].position.y = 20;
        this.bookmarks[2].position.xUnit = 'percent';
        this.bookmarks[2].position.yUnit = 'percent';

        this.bookmarks[3].position.x = 30;
        this.bookmarks[3].position.y = 20;
        this.bookmarks[3].position.xUnit = 'percent';
        this.bookmarks[3].position.yUnit = 'percent';

        this.bookmarks[4].position.x = -30;
        this.bookmarks[4].position.y = 60;
        this.bookmarks[4].position.xUnit = 'percent';
        this.bookmarks[4].position.yUnit = 'percent';

        this.bookmarks[5].position.x = -10;
        this.bookmarks[5].position.y = 60;
        this.bookmarks[5].position.xUnit = 'percent';
        this.bookmarks[5].position.yUnit = 'percent';

        this.bookmarks[6].position.x = 10;
        this.bookmarks[6].position.y = 60;
        this.bookmarks[6].position.xUnit = 'percent';
        this.bookmarks[6].position.yUnit = 'percent';

        this.bookmarks[7].position.x = 30;
        this.bookmarks[7].position.y = 60;
        this.bookmarks[7].position.xUnit = 'percent';
        this.bookmarks[7].position.yUnit = 'percent';
    }

    // 应用网格布局
    applyGridLayout() {
        const count = this.bookmarks.length;
        if (count === 0) return;

        // 根据书签数量确定行列数
        let rows, cols;
        if (count <= 3) {
            rows = 1;
            cols = count;
        } else if (count <= 6) {
            rows = 2;
            cols = Math.ceil(count / 2);
        } else {
            rows = 3;
            cols = Math.ceil(count / 3);
        }

        // 计算每个书签的位置
        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            // 计算在网格中的位置
            const xPercent = (col / (cols - 1 || 1) - 0.5) * 80; // -40% 到 40%
            const yPercent = (row / (rows - 1 || 1)) * 70 + 15; // 15% 到 85%

            this.bookmarks[i].position.x = xPercent;
            this.bookmarks[i].position.y = yPercent;
            this.bookmarks[i].position.xUnit = 'percent';
            this.bookmarks[i].position.yUnit = 'percent';
        }
    }

    // 应用水平布局
    applyHorizontalLayout() {
        const count = this.bookmarks.length;
        if (count === 0) return;

        // 水平排列所有书签
        for (let i = 0; i < count; i++) {
            // 计算水平位置，均匀分布
            const xPercent = (i / (count - 1 || 1) - 0.5) * 80; // -40% 到 40%

            this.bookmarks[i].position.x = xPercent;
            this.bookmarks[i].position.y = 40; // 垂直居中偏下
            this.bookmarks[i].position.xUnit = 'percent';
            this.bookmarks[i].position.yUnit = 'percent';
        }
    }

    // 应用垂直布局
    applyVerticalLayout() {
        const count = this.bookmarks.length;
        if (count === 0) return;

        // 垂直排列所有书签
        for (let i = 0; i < count; i++) {
            // 计算垂直位置，均匀分布
            const yPercent = (i / (count - 1 || 1)) * 70 + 15; // 15% 到 85%

            this.bookmarks[i].position.x = 0; // 水平居中
            this.bookmarks[i].position.y = yPercent;
            this.bookmarks[i].position.xUnit = 'percent';
            this.bookmarks[i].position.yUnit = 'percent';
        }
    }

    // 渲染所有书签到导出Canvas
    renderToExportCanvas(ctx, boardWidth, boardHeight) {
        // 渲染每个书签
        for (const bookmark of this.bookmarks) {
            // 获取书签在背景板中的位置
            const { x, y } = bookmark.calculatePosition(boardWidth, boardHeight);

            // 获取缩放后的尺寸
            const { width, height } = bookmark.getScaledDimensions();

            // 如果启用了阴影，使用临时Canvas创建带阴影的书签
            if (shadowManager && shadowManager.getShadowSettings().enabled) {
                // 创建带阴影的书签
                const shadowResult = shadowManager.applyShadowToCanvas(null, 0, 0, width, height);

                if (shadowResult) {
                    // 获取带阴影的临时Canvas
                    const shadowCanvas = shadowResult.canvas;
                    const shadowOffsetX = shadowResult.offsetX;
                    const shadowOffsetY = shadowResult.offsetY;

                    // 在阴影Canvas上绘制实际的书签内容
                    const shadowCtx = shadowCanvas.getContext('2d');
                    shadowCtx.save();
                    shadowCtx.drawImage(bookmark.canvas, shadowOffsetX, shadowOffsetY, width, height);
                    shadowCtx.restore();

                    // 将带阴影的书签绘制到导出Canvas上
                    ctx.drawImage(
                        shadowCanvas,
                        0, 0, shadowCanvas.width, shadowCanvas.height,
                        x - shadowOffsetX, y - shadowOffsetY, shadowCanvas.width, shadowCanvas.height
                    );
                } else {
                    // 如果阴影创建失败，直接绘制书签
                    bookmark.render(ctx, x, y, width, height);
                }
            } else {
                // 直接渲染书签
                bookmark.render(ctx, x, y, width, height);
            }
        }
    }
}

// 创建书签管理器实例
let bookmarkManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 书签管理器将在canvas.js中初始化
});
