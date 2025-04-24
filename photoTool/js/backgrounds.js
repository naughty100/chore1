/**
 * backgrounds.js - 书签卡片编辑器的背景处理模块
 * 负责处理背景相关的UI交互和背景渲染
 */

// 背景管理类
class BackgroundManager {
    constructor() {
        // 获取背景图层
        this.backgroundLayer = null;

        // 背景设置面板
        this.bgTypeRadios = document.getElementsByName('bgType');
        this.bgSettings = document.querySelectorAll('.bg-settings');

        // 纯色背景设置
        this.bgColorInput = document.getElementById('bgColor');

        // 渐变背景设置
        this.gradientTypeSelect = document.getElementById('gradientType');
        this.gradientAngleInput = document.getElementById('gradientAngle');
        this.gradientAngleValue = document.getElementById('gradientAngleValue');
        this.addColorStopBtn = document.getElementById('addColorStop');

        // 图片背景设置
        this.bgImageInput = document.getElementById('bgImage');
        this.imageRepeatSelect = document.getElementById('imageRepeat');
        this.imageFitSelect = document.getElementById('imageFit');
        this.imageOpacityInput = document.getElementById('imageOpacity');
        this.imageOpacityValue = document.getElementById('imageOpacityValue');
        this.imageCropContainer = document.getElementById('imageCropContainer');
        this.cropPreviewImage = document.getElementById('cropPreviewImage');
        this.cropSelection = document.getElementById('cropSelection');
        this.applyCropBtn = document.getElementById('applyCropBtn');
        this.resetCropBtn = document.getElementById('resetCropBtn');
        this.reopenCropBtn = document.getElementById('reopenCropBtn');
        this.extractColorsBtn = document.getElementById('extractColorsBtn');

        // 裁剪区域状态
        this.cropState = {
            dragging: false,
            resizing: false,
            startX: 0,
            startY: 0,
            cropX: 0,
            cropY: 0,
            cropWidth: 0,
            cropHeight: 0,
            imageWidth: 0,
            imageHeight: 0
        };

        // 几何图案设置
        this.patternTypeSelect = document.getElementById('patternType');
        this.patternColor1Input = document.getElementById('patternColor1');
        this.patternColor2Input = document.getElementById('patternColor2');
        this.patternSizeInput = document.getElementById('patternSize');
        this.patternSizeValue = document.getElementById('patternSizeValue');
        this.patternAngleInput = document.getElementById('patternAngle');
        this.patternAngleValue = document.getElementById('patternAngleValue');

        // 绑定事件
        this.bindEvents();
    }

    // 初始化
    init() {
        // 获取背景图层
        if (layerManager) {
            this.backgroundLayer = layerManager.getLayer('background');

            // 更新UI
            this.updateUI();
        }
    }

    // 更新UI
    updateUI() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();

        // 设置背景类型
        this.setBackgroundType(data.type);

        // 更新纯色背景设置
        this.bgColorInput.value = data.color;

        // 更新渐变背景设置
        this.gradientTypeSelect.value = data.gradient.type;
        this.gradientAngleInput.value = data.gradient.angle;
        this.gradientAngleValue.textContent = `${data.gradient.angle}°`;

        // 更新渐变色标
        this.updateGradientStops(data.gradient.stops);

        // 更新图片背景设置
        this.imageRepeatSelect.value = data.imageRepeat;
        this.imageOpacityInput.value = data.imageOpacity;
        this.imageOpacityValue.textContent = `${data.imageOpacity}%`;

        // 更新几何图案设置
        this.patternTypeSelect.value = data.pattern.type;
        this.patternColor1Input.value = data.pattern.color1;
        this.patternColor2Input.value = data.pattern.color2;
        this.patternSizeInput.value = data.pattern.size;
        this.patternSizeValue.textContent = `${data.pattern.size}px`;
        this.patternAngleInput.value = data.pattern.angle;
        this.patternAngleValue.textContent = `${data.pattern.angle}°`;
    }

    // 设置背景类型
    setBackgroundType(type) {
        // 设置单选按钮
        this.bgTypeRadios.forEach(radio => {
            radio.checked = radio.value === type;
        });

        // 显示对应的设置面板
        this.bgSettings.forEach(panel => {
            panel.style.display = 'none';
        });

        document.getElementById(`${type}-settings`).style.display = 'block';

        // 更新背景图层数据
        if (this.backgroundLayer) {
            const data = this.backgroundLayer.getData();
            data.type = type;
            this.backgroundLayer.setData(data);

            // 重新渲染
            this.render();
        }
    }

    // 更新渐变色标
    updateGradientStops(stops) {
        // 清除现有色标
        const gradientColors = document.querySelector('.gradient-colors');
        gradientColors.innerHTML = '';

        // 添加色标
        stops.forEach(stop => {
            const colorStop = document.createElement('div');
            colorStop.className = 'color-stop';

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'gradient-color';
            colorInput.value = stop.color;

            const positionInput = document.createElement('input');
            positionInput.type = 'range';
            positionInput.className = 'gradient-position';
            positionInput.min = 0;
            positionInput.max = 100;
            positionInput.value = stop.position;

            const positionValue = document.createElement('span');
            positionValue.className = 'position-value';
            positionValue.textContent = `${stop.position}%`;

            colorStop.appendChild(colorInput);
            colorStop.appendChild(positionInput);
            colorStop.appendChild(positionValue);

            gradientColors.appendChild(colorStop);

            // 添加事件监听器
            colorInput.addEventListener('input', () => this.updateGradient());
            positionInput.addEventListener('input', (e) => {
                positionValue.textContent = `${e.target.value}%`;
                this.updateGradient();
            });
        });
    }

    // 更新渐变
    updateGradient() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        const stops = [];

        // 获取所有色标
        const colorStops = document.querySelectorAll('.color-stop');

        colorStops.forEach(stop => {
            const color = stop.querySelector('.gradient-color').value;
            const position = parseInt(stop.querySelector('.gradient-position').value);

            stops.push({ color, position });
        });

        // 按位置排序
        stops.sort((a, b) => a.position - b.position);

        // 更新背景图层数据
        data.gradient.stops = stops;
        this.backgroundLayer.setData(data);

        // 重新渲染
        this.render();
    }

    // 添加渐变色标
    addGradientStop() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        const stops = data.gradient.stops;

        // 计算新色标的位置
        let position = 50;
        if (stops.length >= 2) {
            // 找到中间位置
            stops.sort((a, b) => a.position - b.position);
            for (let i = 0; i < stops.length - 1; i++) {
                const gap = stops[i + 1].position - stops[i].position;
                if (gap > 10) {
                    position = stops[i].position + gap / 2;
                    break;
                }
            }
        }

        // 添加新色标
        const newStop = {
            color: '#FFFFFF',
            position: Math.round(position)
        };

        stops.push(newStop);

        // 更新UI
        this.updateGradientStops(stops);

        // 更新背景
        this.updateGradient();
    }

    // 加载背景图片
    loadBackgroundImage(file) {
        if (!file || !this.backgroundLayer) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // 更新背景图层数据
                const data = this.backgroundLayer.getData();
                data.image = img;
                data.originalImage = img; // 保存原始图片
                this.backgroundLayer.setData(data);

                // 显示裁剪区域
                this.showImageCropArea(img);

                // 重新渲染
                this.render();
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    // 显示图片裁剪区域
    showImageCropArea(img) {
        // 显示裁剪容器
        this.imageCropContainer.style.display = 'block';

        // 设置预览图片
        this.cropPreviewImage.src = img.src;

        // 等待图片加载完成后再计算尺寸
        this.cropPreviewImage.onload = () => {
            // 获取容器宽度
            const containerWidth = this.imageCropContainer.clientWidth || 280; // 默认宽度

            // 计算图片尺寸，保持原始宽高比
            const imgRatio = img.width / img.height;
            let imgWidth, imgHeight;

            // 设置图片宽度为容器宽度，高度按比例计算
            imgWidth = containerWidth;
            imgHeight = containerWidth / imgRatio;

            // 如果图片太高，限制最大高度
            const maxHeight = 500; // 最大高度
            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = maxHeight * imgRatio;
            }

            // 设置图片尺寸
            this.cropPreviewImage.style.width = `${imgWidth}px`;
            this.cropPreviewImage.style.height = `${imgHeight}px`;

            // 设置裁剪区域容器的高度，确保能完全显示图片
            const cropAreaElement = this.cropPreviewImage.parentElement;
            cropAreaElement.style.height = `${imgHeight}px`;

            // 初始化裁剪区域 - 使用更合理的默认尺寸
            // 对于竖图，默认选择中间部分；对于横图，选择中心区域
            let cropWidth, cropHeight, cropX, cropY;

            if (imgRatio < 1) {
                // 竖图 - 选择中间部分，宽度为图片宽度，高度为图片高度的一半
                cropWidth = imgWidth * 0.8;
                cropHeight = Math.min(imgHeight * 0.6, 300);
                cropX = (imgWidth - cropWidth) / 2;
                cropY = (imgHeight - cropHeight) / 2;
            } else {
                // 横图 - 选择中心区域，宽高比接近书签比例
                cropWidth = Math.min(imgWidth * 0.3, 200);
                cropHeight = Math.min(imgHeight * 0.8, cropWidth * 3);
                cropX = (imgWidth - cropWidth) / 2;
                cropY = (imgHeight - cropHeight) / 2;
            }

            // 设置选区位置和大小
            this.cropSelection.style.left = `${cropX}px`;
            this.cropSelection.style.top = `${cropY}px`;
            this.cropSelection.style.width = `${cropWidth}px`;
            this.cropSelection.style.height = `${cropHeight}px`;

            // 更新裁剪状态
            this.cropState.cropX = cropX;
            this.cropState.cropY = cropY;
            this.cropState.cropWidth = cropWidth;
            this.cropState.cropHeight = cropHeight;
            this.cropState.imageWidth = imgWidth;
            this.cropState.imageHeight = imgHeight;

            // 绑定裁剪区域事件
            this.bindCropEvents();
        };
    }

    // 绑定裁剪区域事件
    bindCropEvents() {
        // 移除之前的事件监听器
        if (this.cropMouseDownHandler) {
            this.cropSelection.removeEventListener('mousedown', this.cropMouseDownHandler);
        }
        if (this.cropMouseMoveHandler) {
            document.removeEventListener('mousemove', this.cropMouseMoveHandler);
        }
        if (this.cropMouseUpHandler) {
            document.removeEventListener('mouseup', this.cropMouseUpHandler);
        }

        // 创建事件处理函数
        this.cropMouseDownHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 获取裁剪区域的位置
            const rect = this.cropSelection.getBoundingClientRect();

            // 检查是否点击了调整大小的手柄
            const isResizeHandle =
                e.clientX > rect.right - 15 &&
                e.clientX < rect.right + 5 &&
                e.clientY > rect.bottom - 15 &&
                e.clientY < rect.bottom + 5;

            if (isResizeHandle) {
                this.cropState.resizing = true;
            } else {
                this.cropState.dragging = true;
            }

            // 记录起始位置
            this.cropState.startX = e.clientX;
            this.cropState.startY = e.clientY;

            // 防止事件冒泡
            return false;
        };

        this.cropMouseMoveHandler = (e) => {
            if (!this.cropState.dragging && !this.cropState.resizing) return;

            // 获取图片容器
            const cropAreaElement = this.cropPreviewImage.parentElement;

            // 计算移动距离，考虑滚动位置
            const dx = e.clientX - this.cropState.startX;
            const dy = e.clientY - this.cropState.startY;

            if (this.cropState.dragging) {
                // 移动裁剪区域
                let newX = this.cropState.cropX + dx;
                let newY = this.cropState.cropY + dy;

                // 限制在图片范围内
                newX = Math.max(0, Math.min(newX, this.cropState.imageWidth - this.cropState.cropWidth));
                newY = Math.max(0, Math.min(newY, this.cropState.imageHeight - this.cropState.cropHeight));

                // 更新裁剪区域位置
                this.cropSelection.style.left = `${newX}px`;
                this.cropSelection.style.top = `${newY}px`;

                // 更新状态
                this.cropState.cropX = newX;
                this.cropState.cropY = newY;

                // 确保选区在可视区域内 - 如果选区移出可视区域，自动滚动
                const selectionRect = this.cropSelection.getBoundingClientRect();
                const containerRect = cropAreaElement.getBoundingClientRect();

                // 向下滚动
                if (selectionRect.bottom > containerRect.bottom) {
                    cropAreaElement.scrollTop += (selectionRect.bottom - containerRect.bottom + 10);
                }

                // 向上滚动
                if (selectionRect.top < containerRect.top) {
                    cropAreaElement.scrollTop -= (containerRect.top - selectionRect.top + 10);
                }
            } else if (this.cropState.resizing) {
                // 调整裁剪区域大小
                let newWidth = this.cropState.cropWidth + dx;
                let newHeight = this.cropState.cropHeight + dy;

                // 限制最小尺寸和最大尺寸
                newWidth = Math.max(20, Math.min(newWidth, this.cropState.imageWidth - this.cropState.cropX));
                newHeight = Math.max(20, Math.min(newHeight, this.cropState.imageHeight - this.cropState.cropY));

                // 更新裁剪区域大小
                this.cropSelection.style.width = `${newWidth}px`;
                this.cropSelection.style.height = `${newHeight}px`;

                // 更新状态
                this.cropState.cropWidth = newWidth;
                this.cropState.cropHeight = newHeight;

                // 如果调整大小导致选区超出可视区域，自动滚动
                const selectionRect = this.cropSelection.getBoundingClientRect();
                const containerRect = cropAreaElement.getBoundingClientRect();

                // 向下滚动
                if (selectionRect.bottom > containerRect.bottom) {
                    cropAreaElement.scrollTop += (selectionRect.bottom - containerRect.bottom + 10);
                }
            }

            // 更新起始位置
            this.cropState.startX = e.clientX;
            this.cropState.startY = e.clientY;
        };

        this.cropMouseUpHandler = () => {
            // 重置拖动状态
            this.cropState.dragging = false;
            this.cropState.resizing = false;
        };

        // 添加事件监听器
        this.cropSelection.addEventListener('mousedown', this.cropMouseDownHandler);
        document.addEventListener('mousemove', this.cropMouseMoveHandler);
        document.addEventListener('mouseup', this.cropMouseUpHandler);

        // 应用裁剪按钮
        this.applyCropBtn.onclick = () => this.applyCrop();

        // 重置裁剪按钮
        this.resetCropBtn.onclick = () => this.resetCrop();
    }

    // 应用裁剪
    applyCrop() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        if (!data.originalImage) return;

        // 创建Canvas进行裁剪
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算原始图片中的裁剪区域
        const originalWidth = data.originalImage.width;
        const originalHeight = data.originalImage.height;

        const scaleX = originalWidth / this.cropState.imageWidth;
        const scaleY = originalHeight / this.cropState.imageHeight;

        const cropX = this.cropState.cropX * scaleX;
        const cropY = this.cropState.cropY * scaleY;
        const cropWidth = this.cropState.cropWidth * scaleX;
        const cropHeight = this.cropState.cropHeight * scaleY;

        // 设置Canvas尺寸
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // 绘制裁剪后的图片
        ctx.drawImage(
            data.originalImage,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );

        // 创建新图片
        const croppedImg = new Image();
        croppedImg.onload = () => {
            // 更新背景图层数据
            data.image = croppedImg;
            // 保留原始图片，以便再次裁剪
            data.originalImage = data.originalImage;
            // 设置为不平铺模式，确保裁剪区域正确显示
            data.imageRepeat = 'no-repeat';
            // 设置适应方式为填满书签
            data.imageFit = 'cover';
            // 更新UI
            this.imageRepeatSelect.value = 'no-repeat';
            this.imageFitSelect.value = 'cover';
            // 保存裁剪信息
            data.cropInfo = {
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight,
                originalWidth: originalWidth,
                originalHeight: originalHeight
            };

            this.backgroundLayer.setData(data);

            // 隐藏裁剪区域
            this.imageCropContainer.style.display = 'none';

            // 重新渲染
            this.render();
        };

        croppedImg.src = canvas.toDataURL('image/png');
    }

    // 重置裁剪
    resetCrop() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        if (!data.originalImage) return;

        // 恢复原始图片
        data.image = data.originalImage;
        // 清除裁剪信息
        data.cropInfo = null;

        this.backgroundLayer.setData(data);

        // 隐藏裁剪区域
        this.imageCropContainer.style.display = 'none';

        // 重新渲染
        this.render();
    }

    // 重新打开裁剪区域
    reopenCrop() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        if (!data.originalImage) return;

        // 显示裁剪区域
        this.showImageCropArea(data.originalImage);
    }

    // 从图片提取颜色
    extractColorsFromImage() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();
        if (!data.image) return;

        // 创建Canvas来分析图片颜色
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置Canvas尺寸
        canvas.width = data.image.width;
        canvas.height = data.image.height;

        // 绘制图片
        ctx.drawImage(data.image, 0, 0);

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

        // 使用K-means聚类算法找出主要颜色
        const dominantColors = this.findDominantColors(colorSamples, 2);

        // 创建渐变
        if (dominantColors.length >= 2) {
            // 切换到渐变背景
            this.setBackgroundType('gradient');

            // 更新渐变设置
            const gradientData = data.gradient;
            gradientData.type = 'linear';
            gradientData.angle = 45;
            gradientData.stops = [
                { color: this.rgbToHex(dominantColors[0]), position: 0 },
                { color: this.rgbToHex(dominantColors[1]), position: 100 }
            ];

            // 更新背景图层数据
            data.gradient = gradientData;
            this.backgroundLayer.setData(data);

            // 更新UI
            this.updateUI();

            // 重新渲染
            this.render();
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
        return Math.sqrt(
            Math.pow(color1.r - color2.r, 2) +
            Math.pow(color1.g - color2.g, 2) +
            Math.pow(color1.b - color2.b, 2)
        );
    }

    // 计算颜色的平均值
    averageColor(colors) {
        if (colors.length === 0) return { r: 0, g: 0, b: 0 };

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

    // 判断两个颜色是否相同
    sameColor(color1, color2) {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
    }

    // 将RGB转换为十六进制颜色
    rgbToHex(color) {
        return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
    }

    // 更新图片设置
    updateImageSettings() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();

        // 更新图片设置
        data.imageRepeat = this.imageRepeatSelect.value;
        data.imageFit = this.imageFitSelect.value;
        data.imageOpacity = parseInt(this.imageOpacityInput.value);

        // 更新UI
        this.imageOpacityValue.textContent = `${data.imageOpacity}%`;

        // 更新背景图层数据
        this.backgroundLayer.setData(data);

        // 重新渲染
        this.render();
    }

    // 更新几何图案设置
    updatePatternSettings() {
        if (!this.backgroundLayer) return;

        const data = this.backgroundLayer.getData();

        // 更新几何图案设置
        data.pattern.type = this.patternTypeSelect.value;
        data.pattern.color1 = this.patternColor1Input.value;
        data.pattern.color2 = this.patternColor2Input.value;
        data.pattern.size = parseInt(this.patternSizeInput.value);
        data.pattern.angle = parseInt(this.patternAngleInput.value);

        // 更新UI
        this.patternSizeValue.textContent = `${data.pattern.size}px`;
        this.patternAngleValue.textContent = `${data.pattern.angle}°`;

        // 更新背景图层数据
        this.backgroundLayer.setData(data);

        // 重新渲染
        this.render();
    }

    // 渲染
    render() {
        if (canvasManager) {
            canvasManager.render();
        }
    }

    // 绑定事件
    bindEvents() {
        // 背景类型切换
        this.bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setBackgroundType(e.target.value);
                }
            });
        });

        // 纯色背景设置
        this.bgColorInput.addEventListener('input', () => {
            if (this.backgroundLayer) {
                const data = this.backgroundLayer.getData();
                data.color = this.bgColorInput.value;
                this.backgroundLayer.setData(data);
                this.render();
            }
        });

        // 渐变背景设置
        this.gradientTypeSelect.addEventListener('change', () => {
            if (this.backgroundLayer) {
                const data = this.backgroundLayer.getData();
                data.gradient.type = this.gradientTypeSelect.value;
                this.backgroundLayer.setData(data);
                this.render();
            }
        });

        this.gradientAngleInput.addEventListener('input', () => {
            if (this.backgroundLayer) {
                const angle = parseInt(this.gradientAngleInput.value);
                this.gradientAngleValue.textContent = `${angle}°`;

                const data = this.backgroundLayer.getData();
                data.gradient.angle = angle;
                this.backgroundLayer.setData(data);
                this.render();
            }
        });

        this.addColorStopBtn.addEventListener('click', () => {
            this.addGradientStop();
        });

        // 图片背景设置
        this.bgImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.loadBackgroundImage(e.target.files[0]);
            }
        });

        this.imageRepeatSelect.addEventListener('change', () => {
            this.updateImageSettings();
        });

        this.imageFitSelect.addEventListener('change', () => {
            this.updateImageSettings();
        });

        this.imageOpacityInput.addEventListener('input', () => {
            this.updateImageSettings();
        });

        // 重新裁剪按钮
        this.reopenCropBtn.addEventListener('click', () => {
            this.reopenCrop();
        });

        // 提取颜色按钮
        this.extractColorsBtn.addEventListener('click', () => {
            this.extractColorsFromImage();
        });

        // 几何图案设置
        this.patternTypeSelect.addEventListener('change', () => {
            this.updatePatternSettings();
        });

        this.patternColor1Input.addEventListener('input', () => {
            this.updatePatternSettings();
        });

        this.patternColor2Input.addEventListener('input', () => {
            this.updatePatternSettings();
        });

        this.patternSizeInput.addEventListener('input', () => {
            this.updatePatternSettings();
        });

        this.patternAngleInput.addEventListener('input', () => {
            this.updatePatternSettings();
        });
    }
}

// 创建背景管理器实例
let backgroundManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待图层管理器初始化
    setTimeout(() => {
        backgroundManager = new BackgroundManager();
        backgroundManager.init();
    }, 100);
});
