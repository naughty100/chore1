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

        // 背景图片设置
        this.background = {
            image: null,           // 背景图片对象
            originalImage: null,   // 原始图片（用于裁剪）
            imageRepeat: 'no-repeat', // 平铺方式
            imageFit: 'cover',     // 适应方式
            imageOpacity: 100,     // 不透明度
            cropInfo: null         // 裁剪信息
        };

        // 创建DOM元素
        this.element = document.createElement('div');
        this.element.className = 'bookmark-item-preview';
        this.element.id = `bookmark-preview-${id}`;

        // 创建预览图片元素
        this.previewElement = document.createElement('div');
        this.previewElement.className = 'bookmark-preview-content';
        this.previewElement.style.width = '100%';
        this.previewElement.style.height = '100%';
        this.previewElement.style.backgroundColor = '#FFFFFF';

        // 将预览元素添加到DOM元素中
        this.element.appendChild(this.previewElement);

        // Canvas只在导出时创建
        this.canvas = null;
        this.ctx = null;

        // 设置DOM元素的初始样式
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;

        // 确保位置设置为居中
        this.position.preset = 'center';
        this.position.x = 0;
        this.position.y = 0;

        // 初始化预览元素
        this.updatePreview();

        // 添加点击事件，用于选择书签
        this.element.addEventListener('click', () => {
            // 触发自定义事件，通知书签被点击
            const event = new CustomEvent('bookmark-clicked', { detail: { id: this.id } });
            document.dispatchEvent(event);
        });
    }

    // 更新预览元素
    updatePreview() {
        console.log(`更新书签 ${this.id} 的预览`);

        // 重置预览元素样式
        this.previewElement.style.backgroundColor = '#FFFFFF';
        this.previewElement.style.backgroundImage = 'none';

        // 如果有背景图片，设置背景图片
        if (this.background.image) {
            console.log(`书签 ${this.id} 有背景图片，准备设置，图片尺寸: ${this.background.image.width}x${this.background.image.height}`);
            this.setBackgroundImage();
        } else {
            console.log(`书签 ${this.id} 没有背景图片`);
        }
    }

    // 设置背景图片
    setBackgroundImage() {
        if (!this.background.image) {
            console.log(`书签 ${this.id}: 没有背景图片`);
            return;
        }

        console.log(`书签 ${this.id}: 设置背景图片，尺寸: ${this.background.image.width}x${this.background.image.height}`);

        // 获取图片URL
        const imgUrl = this.background.image.src;

        // 设置不透明度
        this.previewElement.style.opacity = this.background.imageOpacity / 100;

        // 根据适应方式设置背景图片
        if (this.background.imageRepeat === 'no-repeat') {
            // 设置背景图片
            this.previewElement.style.backgroundImage = `url(${imgUrl})`;
            this.previewElement.style.backgroundRepeat = 'no-repeat';

            // 根据适应方式设置背景尺寸和位置
            if (this.background.imageFit === 'cover') {
                this.previewElement.style.backgroundSize = 'cover';
                this.previewElement.style.backgroundPosition = 'center center';
                console.log(`书签 ${this.id}: 设置背景图片 (cover)`);
            } else if (this.background.imageFit === 'contain') {
                this.previewElement.style.backgroundSize = 'contain';
                this.previewElement.style.backgroundPosition = 'center center';
                console.log(`书签 ${this.id}: 设置背景图片 (contain)`);
            } else {
                // 居中显示（原始大小）
                this.previewElement.style.backgroundSize = 'auto';
                this.previewElement.style.backgroundPosition = 'center center';
                console.log(`书签 ${this.id}: 设置背景图片 (center)`);
            }
        } else {
            // 平铺
            this.previewElement.style.backgroundImage = `url(${imgUrl})`;
            this.previewElement.style.backgroundRepeat = this.background.imageRepeat;
            this.previewElement.style.backgroundSize = 'auto';
            console.log(`书签 ${this.id}: 设置背景图片 (${this.background.imageRepeat})`);
        }
    }

    // 创建用于导出的Canvas
    createExportCanvas() {
        // 创建Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // 清除Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制白色背景
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 如果有背景图片，绘制背景图片
        if (this.background.image) {
            this.drawBackgroundImageToCanvas();
        }

        return this.canvas;
    }

    // 绘制背景图片到Canvas（仅用于导出）
    drawBackgroundImageToCanvas() {
        if (!this.background.image || !this.ctx) return;

        // 保存当前状态
        this.ctx.save();

        // 设置全局透明度
        this.ctx.globalAlpha = this.background.imageOpacity / 100;

        // 根据适应方式绘制图片
        const img = this.background.image;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        if (this.background.imageRepeat === 'no-repeat') {
            // 不平铺
            if (this.background.imageFit === 'cover') {
                // 填满（保持比例，可能裁剪）
                const imgRatio = img.width / img.height;
                const canvasRatio = canvasWidth / canvasHeight;

                let drawWidth, drawHeight, drawX, drawY;

                if (imgRatio > canvasRatio) {
                    // 图片更宽，以高度为准
                    drawHeight = canvasHeight;
                    drawWidth = drawHeight * imgRatio;
                    drawX = (canvasWidth - drawWidth) / 2;
                    drawY = 0;
                } else {
                    // 图片更高，以宽度为准
                    drawWidth = canvasWidth;
                    drawHeight = drawWidth / imgRatio;
                    drawX = 0;
                    drawY = (canvasHeight - drawHeight) / 2;
                }

                this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            } else if (this.background.imageFit === 'contain') {
                // 包含（保持比例，可能留白）
                const imgRatio = img.width / img.height;
                const canvasRatio = canvasWidth / canvasHeight;

                let drawWidth, drawHeight, drawX, drawY;

                if (imgRatio < canvasRatio) {
                    // 图片更高，以高度为准
                    drawHeight = canvasHeight;
                    drawWidth = drawHeight * imgRatio;
                    drawX = (canvasWidth - drawWidth) / 2;
                    drawY = 0;
                } else {
                    // 图片更宽，以宽度为准
                    drawWidth = canvasWidth;
                    drawHeight = drawWidth / imgRatio;
                    drawX = 0;
                    drawY = (canvasHeight - drawHeight) / 2;
                }

                this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            } else {
                // 居中显示（原始大小）
                const drawX = (canvasWidth - img.width) / 2;
                const drawY = (canvasHeight - img.height) / 2;
                this.ctx.drawImage(img, drawX, drawY);
            }
        } else {
            // 创建图案
            const pattern = this.ctx.createPattern(img, this.background.imageRepeat);
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // 恢复状态
        this.ctx.restore();
    }

    // 设置书签位置
    setPosition(boardWidth, boardHeight) {
        // 获取原始尺寸（不考虑缩放）
        const originalWidth = this.width;
        const originalHeight = this.height;

        // 计算位置（不考虑缩放）
        const { x, y } = this.calculatePosition(boardWidth, boardHeight);

        // 更新DOM元素样式
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.width = `${originalWidth}px`;
        this.element.style.height = `${originalHeight}px`;

        // 设置缩放，使用transform-origin: center center确保从中心缩放
        this.element.style.transform = `scale(${this.scale / 100})`;
        this.element.style.transformOrigin = 'center center';

        console.log(`设置书签 ${this.id} 位置: (${x}, ${y}), 原始尺寸: ${originalWidth}x${originalHeight}, 缩放: ${this.scale}%`);
    }

    // 设置选中状态
    setSelected(selected) {
        if (selected) {
            this.element.classList.add('selected');
        } else {
            this.element.classList.remove('selected');
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
        // 使用原始尺寸，不考虑缩放
        const width = this.width;
        const height = this.height;
        let x, y;

        // 检查预设位置
        if (this.position.preset === 'center') {
            // 居中显示
            x = (boardWidth - width) / 2;
            y = (boardHeight - height) / 2;
            return { x, y };
        }

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

    // 渲染书签到指定的上下文（用于导出）
    render(ctx, x, y, width, height) {
        // 创建导出用的Canvas
        const exportCanvas = this.createExportCanvas();

        // 绘制到目标上下文
        ctx.drawImage(exportCanvas, x, y, width, height);

        console.log(`渲染书签 ${this.id}，位置: (${x}, ${y}), 尺寸: ${width}x${height}`);
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

        // 获取背景板容器
        this.boardContainer = document.querySelector('.background-board');

        // 创建书签容器
        this.bookmarksContainer = document.createElement('div');
        this.bookmarksContainer.className = 'bookmarks-container';
        this.bookmarksContainer.style.position = 'relative';
        this.bookmarksContainer.style.width = '100%';
        this.bookmarksContainer.style.height = '100%';

        // 将书签容器添加到背景板
        if (this.boardContainer) {
            this.boardContainer.appendChild(this.bookmarksContainer);
        }

        // 监听书签点击事件
        document.addEventListener('bookmark-clicked', (e) => {
            const clickedId = e.detail.id;
            const index = this.bookmarks.findIndex(bookmark => bookmark.id === clickedId);
            if (index !== -1) {
                this.selectBookmark(index);
            }
        });

        // 绑定事件
        this.bindEvents();

        // 创建默认书签
        this.addBookmark();

        // 选择第一个书签
        this.selectBookmark(0);
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

        // 背景图片选择事件
        const bgImageInput = document.getElementById('bgImage');
        if (bgImageInput) {
            bgImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadBackgroundImage(file);
                }
            });
        }

        // 图片裁剪应用按钮事件
        const applyCropBtn = document.getElementById('applyCropBtn');
        if (applyCropBtn) {
            applyCropBtn.addEventListener('click', () => {
                this.applyCrop();
            });
        }

        // 图片裁剪重置按钮事件
        const resetCropBtn = document.getElementById('resetCropBtn');
        if (resetCropBtn) {
            resetCropBtn.addEventListener('click', () => {
                this.resetCrop();
            });
        }

        // 重新裁剪图片按钮事件
        const reopenCropBtn = document.getElementById('reopenCropBtn');
        if (reopenCropBtn) {
            reopenCropBtn.addEventListener('click', () => {
                this.reopenCrop();
            });
        }

        // 图片平铺方式选择事件
        const imageRepeatSelect = document.getElementById('imageRepeat');
        if (imageRepeatSelect) {
            imageRepeatSelect.addEventListener('change', () => {
                this.updateImageSettings();
            });
        }

        // 图片适应方式选择事件
        const imageFitSelect = document.getElementById('imageFit');
        if (imageFitSelect) {
            imageFitSelect.addEventListener('change', () => {
                this.updateImageSettings();
            });
        }

        // 图片不透明度调整事件
        const imageOpacityInput = document.getElementById('imageOpacity');
        if (imageOpacityInput) {
            imageOpacityInput.addEventListener('input', () => {
                this.updateImageSettings();
            });
        }

        // 从图片提取颜色按钮事件
        const extractColorsBtn = document.getElementById('extractColorsBtn');
        if (extractColorsBtn) {
            extractColorsBtn.addEventListener('click', () => {
                this.extractColorsFromImage();
            });
        }

        // 书签缩放事件
        const bookmarkScale = document.getElementById('bookmarkScale');
        if (bookmarkScale) {
            bookmarkScale.addEventListener('input', () => {
                // 获取当前选中的书签
                const bookmark = this.getSelectedBookmark();
                if (bookmark) {
                    // 更新书签缩放比例
                    bookmark.scale = parseInt(bookmarkScale.value);

                    // 更新缩放值显示
                    const bookmarkScaleValue = document.getElementById('bookmarkScaleValue');
                    if (bookmarkScaleValue) {
                        bookmarkScaleValue.textContent = `${bookmark.scale}%`;
                    }

                    // 通知Canvas管理器更新UI
                    if (this.canvasManager) {
                        this.canvasManager.currentScale = bookmark.scale;
                        this.canvasManager.updateBookmarkPosition();
                    }
                }
            });
        }
    }

    // 加载背景图片
    loadBackgroundImage(file) {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark) {
            alert('请先选择一个书签');
            return;
        }

        console.log(`为书签 ${bookmark.id} 加载背景图片: ${file.name}`);

        const reader = new FileReader();

        reader.onload = (e) => {
            // 创建一个新的Image对象来加载原始图片
            const img = new Image();

            img.onload = () => {
                console.log(`图片加载完成，尺寸: ${img.width}x${img.height}`);

                // 保存原始图片，不进行任何压缩或缩放
                bookmark.background.image = img;
                bookmark.background.originalImage = img; // 保存原始图片以便后续裁剪

                // 设置默认图片设置
                bookmark.background.imageRepeat = 'no-repeat';
                bookmark.background.imageFit = 'cover';
                bookmark.background.imageOpacity = 100;

                // 更新UI
                this.updateBackgroundSettingsUI(bookmark);

                // 显示裁剪区域
                this.showImageCropArea(img);

                // 显示重新裁剪按钮
                const reopenCropBtn = document.getElementById('reopenCropBtn');
                if (reopenCropBtn) {
                    reopenCropBtn.style.display = 'block';
                }

                // 更新书签预览
                bookmark.updatePreview();

                // 获取背景板尺寸
                let boardWidth = 400;
                let boardHeight = 600;

                if (this.boardContainer) {
                    boardWidth = this.boardContainer.clientWidth;
                    boardHeight = this.boardContainer.clientHeight;
                }

                // 更新书签位置
                bookmark.setPosition(boardWidth, boardHeight);
            };

            // 设置图片源为文件读取结果
            img.src = e.target.result;
        };

        // 以DataURL方式读取文件，保留完整图片数据
        reader.readAsDataURL(file);
    }

    // 显示图片裁剪区域
    showImageCropArea(img) {
        // 获取裁剪容器
        const imageCropContainer = document.getElementById('imageCropContainer');
        if (!imageCropContainer) return;

        // 显示裁剪容器
        imageCropContainer.style.display = 'block';

        // 获取预览图片元素
        const cropPreviewImage = document.getElementById('cropPreviewImage');
        if (!cropPreviewImage) return;

        // 设置预览图片
        cropPreviewImage.src = img.src;

        // 获取裁剪选择框
        const cropSelection = document.getElementById('cropSelection');
        if (!cropSelection) return;

        // 等待图片加载完成后再计算尺寸
        cropPreviewImage.onload = () => {
            // 获取容器宽度
            const cropArea = document.querySelector('.image-crop-area');
            const containerWidth = cropArea ? cropArea.clientWidth : 280; // 默认宽度

            // 计算图片尺寸，保持原始宽高比
            const imgRatio = img.width / img.height;
            let imgWidth, imgHeight;

            // 设置图片宽度为容器宽度，高度按比例计算
            imgWidth = containerWidth;
            imgHeight = containerWidth / imgRatio;

            // 如果图片太高，限制最大高度
            const maxHeight = 300; // 最大高度
            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = maxHeight * imgRatio;
            }

            // 设置预览图片尺寸
            cropPreviewImage.style.width = `${imgWidth}px`;
            cropPreviewImage.style.height = `${imgHeight}px`;

            // 计算裁剪选择框的初始尺寸和位置
            // 默认为3:4比例，居中
            const selectionRatio = 3 / 4; // 书签比例
            let selectionWidth, selectionHeight;

            if (imgRatio > selectionRatio) {
                // 图片更宽，以高度为准
                selectionHeight = imgHeight * 0.8; // 80%的高度
                selectionWidth = selectionHeight * selectionRatio;
            } else {
                // 图片更高，以宽度为准
                selectionWidth = imgWidth * 0.8; // 80%的宽度
                selectionHeight = selectionWidth / selectionRatio;
            }

            // 居中定位
            const selectionLeft = (imgWidth - selectionWidth) / 2;
            const selectionTop = (imgHeight - selectionHeight) / 2;

            // 设置裁剪选择框的尺寸和位置
            cropSelection.style.width = `${selectionWidth}px`;
            cropSelection.style.height = `${selectionHeight}px`;
            cropSelection.style.left = `${selectionLeft}px`;
            cropSelection.style.top = `${selectionTop}px`;

            // 添加拖动和调整大小功能
            this.setupCropInteraction(cropSelection, cropPreviewImage);
        };
    }

    // 设置裁剪交互
    setupCropInteraction(cropSelection, cropPreviewImage) {
        let isDragging = false;
        let isResizing = false;
        let startX, startY;
        let startWidth;
        let startLeft, startTop;

        // 鼠标按下事件
        cropSelection.addEventListener('mousedown', (e) => {
            e.preventDefault();

            // 检查是否点击了右下角调整大小的区域
            const rect = cropSelection.getBoundingClientRect();
            const isResizeArea = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);

            if (isResizeArea) {
                // 调整大小
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = cropSelection.offsetWidth;
            } else {
                // 拖动
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = cropSelection.offsetLeft;
                startTop = cropSelection.offsetTop;
            }
        });

        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (!isDragging && !isResizing) return;

            e.preventDefault();

            if (isResizing) {
                // 调整大小
                const newWidth = startWidth + (e.clientX - startX);

                // 保持3:4比例
                const ratio = 3 / 4;
                let width = newWidth;
                let height = width / ratio;

                // 限制最小尺寸
                const minWidth = 50;
                if (width < minWidth) {
                    width = minWidth;
                    height = width / ratio;
                }

                // 限制最大尺寸
                const maxWidth = cropPreviewImage.offsetWidth;
                const maxHeight = cropPreviewImage.offsetHeight;
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / ratio;
                }
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * ratio;
                }

                // 确保选择框不超出图片边界
                const right = cropSelection.offsetLeft + width;
                const bottom = cropSelection.offsetTop + height;
                if (right > cropPreviewImage.offsetWidth) {
                    width = cropPreviewImage.offsetWidth - cropSelection.offsetLeft;
                    height = width / ratio;
                }
                if (bottom > cropPreviewImage.offsetHeight) {
                    height = cropPreviewImage.offsetHeight - cropSelection.offsetTop;
                    width = height * ratio;
                }

                // 应用新尺寸
                cropSelection.style.width = `${width}px`;
                cropSelection.style.height = `${height}px`;
            } else if (isDragging) {
                // 拖动
                const newLeft = startLeft + (e.clientX - startX);
                const newTop = startTop + (e.clientY - startY);

                // 限制不超出图片边界
                const maxLeft = cropPreviewImage.offsetWidth - cropSelection.offsetWidth;
                const maxTop = cropPreviewImage.offsetHeight - cropSelection.offsetHeight;

                const left = Math.max(0, Math.min(newLeft, maxLeft));
                const top = Math.max(0, Math.min(newTop, maxTop));

                // 应用新位置
                cropSelection.style.left = `${left}px`;
                cropSelection.style.top = `${top}px`;
            }
        });

        // 鼠标松开事件
        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
        });
    }

    // 应用裁剪
    applyCrop() {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark || !bookmark.background.originalImage) return;

        // 获取裁剪选择框和预览图片
        const cropSelection = document.getElementById('cropSelection');
        const cropPreviewImage = document.getElementById('cropPreviewImage');
        if (!cropSelection || !cropPreviewImage) return;

        // 计算裁剪参数
        const originalWidth = bookmark.background.originalImage.width;
        const originalHeight = bookmark.background.originalImage.height;

        const previewWidth = cropPreviewImage.offsetWidth;
        const previewHeight = cropPreviewImage.offsetHeight;

        const selectionLeft = cropSelection.offsetLeft;
        const selectionTop = cropSelection.offsetTop;
        const selectionWidth = cropSelection.offsetWidth;
        const selectionHeight = cropSelection.offsetHeight;

        // 计算原始图片上的裁剪区域
        const cropX = (selectionLeft / previewWidth) * originalWidth;
        const cropY = (selectionTop / previewHeight) * originalHeight;
        const cropWidth = (selectionWidth / previewWidth) * originalWidth;
        const cropHeight = (selectionHeight / previewHeight) * originalHeight;

        console.log(`裁剪书签 ${bookmark.id} 的背景图片，裁剪区域: (${cropX}, ${cropY}, ${cropWidth}, ${cropHeight})`);

        // 创建Canvas进行裁剪
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置Canvas尺寸为裁剪区域大小
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // 绘制裁剪区域
        ctx.drawImage(
            bookmark.background.originalImage,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );

        // 创建新图片
        const croppedImg = new Image();
        croppedImg.onload = () => {
            console.log(`裁剪后的图片加载完成，尺寸: ${croppedImg.width}x${croppedImg.height}`);

            // 更新书签背景图片
            bookmark.background.image = croppedImg;

            // 保存裁剪信息
            bookmark.background.cropInfo = {
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight,
                originalWidth: originalWidth,
                originalHeight: originalHeight
            };

            // 隐藏裁剪区域
            const imageCropContainer = document.getElementById('imageCropContainer');
            if (imageCropContainer) {
                imageCropContainer.style.display = 'none';
            }

            // 显示重新裁剪按钮
            const reopenCropBtn = document.getElementById('reopenCropBtn');
            if (reopenCropBtn) {
                reopenCropBtn.style.display = 'block';
            }

            // 更新书签预览
            bookmark.updatePreview();

            // 获取背景板尺寸
            let boardWidth = 400;
            let boardHeight = 600;

            if (this.boardContainer) {
                boardWidth = this.boardContainer.clientWidth;
                boardHeight = this.boardContainer.clientHeight;
            }

            // 更新书签位置
            bookmark.setPosition(boardWidth, boardHeight);
        };

        croppedImg.src = canvas.toDataURL('image/png');
    }

    // 重置裁剪
    resetCrop() {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark || !bookmark.background.originalImage) return;

        // 重新显示裁剪区域
        this.showImageCropArea(bookmark.background.originalImage);
    }

    // 重新打开裁剪
    reopenCrop() {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark || !bookmark.background.originalImage) return;

        // 重新显示裁剪区域
        this.showImageCropArea(bookmark.background.originalImage);
    }

    // 更新图片设置
    updateImageSettings() {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark) return;

        // 获取设置值
        const imageRepeatSelect = document.getElementById('imageRepeat');
        const imageFitSelect = document.getElementById('imageFit');
        const imageOpacityInput = document.getElementById('imageOpacity');

        if (imageRepeatSelect) {
            bookmark.background.imageRepeat = imageRepeatSelect.value;
        }

        if (imageFitSelect) {
            bookmark.background.imageFit = imageFitSelect.value;
        }

        if (imageOpacityInput) {
            bookmark.background.imageOpacity = parseInt(imageOpacityInput.value);

            // 更新UI
            const imageOpacityValue = document.getElementById('imageOpacityValue');
            if (imageOpacityValue) {
                imageOpacityValue.textContent = `${bookmark.background.imageOpacity}%`;
            }
        }

        console.log(`更新书签 ${bookmark.id} 的图片设置:`, {
            repeat: bookmark.background.imageRepeat,
            fit: bookmark.background.imageFit,
            opacity: bookmark.background.imageOpacity
        });

        // 更新书签预览
        bookmark.updatePreview();

        // 获取背景板尺寸
        let boardWidth = 400;
        let boardHeight = 600;

        if (this.boardContainer) {
            boardWidth = this.boardContainer.clientWidth;
            boardHeight = this.boardContainer.clientHeight;
        }

        // 更新书签位置
        bookmark.setPosition(boardWidth, boardHeight);
    }

    // 从图片提取颜色
    extractColorsFromImage() {
        // 获取当前选中的书签
        const bookmark = this.getSelectedBookmark();
        if (!bookmark || !bookmark.background.image) {
            alert('请先为书签添加背景图片');
            return;
        }

        // 创建Canvas来分析图片颜色
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置Canvas尺寸，使用原始图片尺寸以获得更准确的颜色
        canvas.width = bookmark.background.image.width;
        canvas.height = bookmark.background.image.height;

        // 绘制图片
        ctx.drawImage(bookmark.background.image, 0, 0);

        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // 收集颜色样本
        const colorSamples = [];
        const sampleSize = 10; // 每隔10个像素采样一次

        for (let i = 0; i < pixels.length; i += 4 * sampleSize) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // 跳过透明像素
            if (pixels[i + 3] < 128) continue;

            // 添加颜色样本
            colorSamples.push({ r, g, b });
        }

        // 使用简单的聚类算法找出主要颜色（提取3种颜色）
        const dominantColors = this.findDominantColors(colorSamples, 3);

        // 创建渐变
        if (dominantColors.length >= 3) {
            // 转换颜色为十六进制
            const hexColors = [
                this.rgbToHex(dominantColors[0]),
                this.rgbToHex(dominantColors[1]),
                this.rgbToHex(dominantColors[2])
            ];

            // 将提取的颜色传递给Canvas管理器，用于背景板
            if (canvasManager) {
                canvasManager.setExtractedColors(hexColors);

                // 立即应用到背景板
                const boardElement = document.querySelector('.background-board');
                // 获取当前渐变角度
                const gradientAngle = 45; // 默认角度

                // 创建一个三色渐变
                const gradient = `linear-gradient(${gradientAngle}deg, ${hexColors[0]}, ${hexColors[1]}, ${hexColors[2]})`;
                boardElement.style.background = gradient;

                // 显示应用提取颜色按钮
                const applyExtractedColorsBtn = document.getElementById('applyExtractedColors');
                if (applyExtractedColorsBtn) {
                    applyExtractedColorsBtn.style.display = 'block';
                }
            }

            // 显示日志
            console.log('已从图片提取颜色并应用到背景板');
        }
    }

    // 找出主要颜色
    findDominantColors(colorSamples, k) {
        if (colorSamples.length === 0) return [];

        // 随机选择初始中心点
        const centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(colorSamples[Math.floor(Math.random() * colorSamples.length)]);
        }

        // 最大迭代次数
        const maxIterations = 10;

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // 为每个样本分配最近的中心点
            const clusters = Array(k).fill().map(() => []);

            for (const sample of colorSamples) {
                let minDistance = Infinity;
                let closestCentroid = 0;

                for (let i = 0; i < k; i++) {
                    const distance = this.colorDistance(sample, centroids[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = i;
                    }
                }

                clusters[closestCentroid].push(sample);
            }

            // 更新中心点
            let changed = false;

            for (let i = 0; i < k; i++) {
                if (clusters[i].length === 0) continue;

                const newCentroid = this.averageColor(clusters[i]);

                if (!this.sameColor(newCentroid, centroids[i])) {
                    centroids[i] = newCentroid;
                    changed = true;
                }
            }

            // 如果中心点不再变化，则停止迭代
            if (!changed) break;
        }

        return centroids;
    }

    // 计算两个颜色之间的距离
    colorDistance(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return dr * dr + dg * dg + db * db;
    }

    // 计算一组颜色的平均值
    averageColor(colors) {
        let r = 0, g = 0, b = 0;

        for (const color of colors) {
            r += color.r;
            g += color.g;
            b += color.b;
        }

        return {
            r: Math.round(r / colors.length),
            g: Math.round(g / colors.length),
            b: Math.round(b / colors.length)
        };
    }

    // 检查两个颜色是否相同
    sameColor(color1, color2) {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
    }

    // 将RGB转换为十六进制颜色
    rgbToHex(color) {
        return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
    }

    // 添加新书签
    addBookmark() {
        const id = `bookmark_${this.bookmarks.length + 1}`;
        const bookmark = new Bookmark(id);

        // 确保位置设置为居中
        bookmark.position.preset = 'center';
        bookmark.position.x = 0;
        bookmark.position.y = 0;

        // 将书签DOM元素添加到书签容器
        if (this.bookmarksContainer) {
            this.bookmarksContainer.appendChild(bookmark.element);
        }

        this.bookmarks.push(bookmark);

        // 更新书签预览
        bookmark.updatePreview();

        // 设置书签位置
        if (this.boardContainer) {
            const boardWidth = this.boardContainer.clientWidth;
            const boardHeight = this.boardContainer.clientHeight;
            bookmark.setPosition(boardWidth, boardHeight);
        }

        // 更新布局
        this.updateLayout();

        // 更新UI
        this.updateBookmarkList();

        console.log(`添加新书签 ${id}，位置: (${bookmark.position.x}, ${bookmark.position.y}), 预设: ${bookmark.position.preset}`);

        return bookmark;
    }

    // 移除书签
    removeBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            // 获取要移除的书签
            const bookmark = this.bookmarks[index];

            // 从DOM中移除书签元素
            if (bookmark.element && bookmark.element.parentNode) {
                bookmark.element.parentNode.removeChild(bookmark.element);
            }

            // 从数组中移除书签
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

            console.log(`移除书签 ${bookmark.id}`);
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
            // 取消之前选中书签的选中状态
            if (this.selectedBookmarkIndex >= 0 && this.selectedBookmarkIndex < this.bookmarks.length) {
                this.bookmarks[this.selectedBookmarkIndex].setSelected(false);
            }

            // 更新选中的书签索引
            this.selectedBookmarkIndex = index;

            // 更新UI
            this.updateBookmarkList();

            // 获取选中的书签
            const bookmark = this.bookmarks[index];

            // 设置当前书签为选中状态
            bookmark.setSelected(true);

            // 确保书签位置设置正确
            if (bookmark.position.preset === 'center') {
                bookmark.position.x = 0;
                bookmark.position.y = 0;
            }

            // 更新背景设置UI
            this.updateBackgroundSettingsUI(bookmark);

            // 通知Canvas管理器更新UI
            if (this.canvasManager) {
                this.canvasManager.updateBookmarkUI(bookmark);
            }

            console.log(`已选择书签 ${index + 1}，位置: (${bookmark.position.x}, ${bookmark.position.y}), 预设: ${bookmark.position.preset}`);
        }
    }

    // 更新背景设置UI
    updateBackgroundSettingsUI(bookmark) {
        if (!bookmark) return;

        console.log(`更新书签 ${bookmark.id} 的背景设置UI`);

        // 更新书签缩放比例
        const bookmarkScale = document.getElementById('bookmarkScale');
        if (bookmarkScale) {
            bookmarkScale.value = bookmark.scale;

            // 更新缩放比例显示值
            const bookmarkScaleValue = document.getElementById('bookmarkScaleValue');
            if (bookmarkScaleValue) {
                bookmarkScaleValue.textContent = `${bookmark.scale}%`;
            }
        }

        // 更新图片平铺方式
        const imageRepeatSelect = document.getElementById('imageRepeat');
        if (imageRepeatSelect && bookmark.background.imageRepeat) {
            imageRepeatSelect.value = bookmark.background.imageRepeat;
            console.log(`设置平铺方式: ${bookmark.background.imageRepeat}`);
        }

        // 更新图片适应方式
        const imageFitSelect = document.getElementById('imageFit');
        if (imageFitSelect && bookmark.background.imageFit) {
            imageFitSelect.value = bookmark.background.imageFit;
            console.log(`设置适应方式: ${bookmark.background.imageFit}`);
        }

        // 更新图片不透明度
        const imageOpacityInput = document.getElementById('imageOpacity');
        if (imageOpacityInput) {
            imageOpacityInput.value = bookmark.background.imageOpacity;

            // 更新不透明度显示值
            const imageOpacityValue = document.getElementById('imageOpacityValue');
            if (imageOpacityValue) {
                imageOpacityValue.textContent = `${bookmark.background.imageOpacity}%`;
            }

            console.log(`设置不透明度: ${bookmark.background.imageOpacity}%`);
        }

        // 显示/隐藏重新裁剪按钮
        const reopenCropBtn = document.getElementById('reopenCropBtn');
        if (reopenCropBtn) {
            reopenCropBtn.style.display = bookmark.background.originalImage ? 'block' : 'none';
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
        this.bookmarks.forEach((_, index) => {
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

        // 获取背景板尺寸
        let boardWidth = 400;
        let boardHeight = 600;

        if (this.boardContainer) {
            boardWidth = this.boardContainer.clientWidth;
            boardHeight = this.boardContainer.clientHeight;

            console.log(`背景板尺寸: ${boardWidth}x${boardHeight}`);
        }

        // 更新每个书签的预览和位置
        for (const bookmark of this.bookmarks) {
            // 更新预览内容
            bookmark.updatePreview();

            // 更新DOM元素位置
            bookmark.setPosition(boardWidth, boardHeight);
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

    // 渲染所有书签到导出Canvas
    renderToExportCanvas(ctx, boardWidth, boardHeight) {
        console.log(`开始导出书签，背景板尺寸: ${boardWidth}x${boardHeight}`);

        // 遍历所有书签
        for (const bookmark of this.bookmarks) {
            // 计算书签在背景板中的位置
            const { x, y } = bookmark.calculatePosition(boardWidth, boardHeight);

            // 获取缩放后的尺寸
            const { width, height } = bookmark.getScaledDimensions();

            // 绘制书签内容到导出Canvas
            // 这里会调用 bookmark.render 方法，该方法会创建临时Canvas并绘制
            bookmark.render(ctx, x, y, width, height);

            console.log(`导出书签 ${bookmark.id}，位置: (${x}, ${y}), 尺寸: ${width}x${height}`);
        }
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
