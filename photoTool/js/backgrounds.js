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
        this.imageOpacityInput = document.getElementById('imageOpacity');
        this.imageOpacityValue = document.getElementById('imageOpacityValue');
        
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
                this.backgroundLayer.setData(data);
                
                // 重新渲染
                this.render();
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    // 更新图片设置
    updateImageSettings() {
        if (!this.backgroundLayer) return;
        
        const data = this.backgroundLayer.getData();
        
        // 更新图片设置
        data.imageRepeat = this.imageRepeatSelect.value;
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
        
        this.imageOpacityInput.addEventListener('input', () => {
            this.updateImageSettings();
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
