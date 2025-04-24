/**
 * icons.js - 书签卡片编辑器的图标处理模块
 * 负责处理图标相关的UI交互和图标渲染
 */

// 图标管理类
class IconManager {
    constructor() {
        // 获取图标图层
        this.iconLayer = null;
        
        // 图标设置控件
        this.iconFileInput = document.getElementById('iconFile');
        this.iconItems = document.querySelectorAll('.icon-item');
        this.iconSizeInput = document.getElementById('iconSize');
        this.iconSizeValue = document.getElementById('iconSizeValue');
        this.iconXInput = document.getElementById('iconX');
        this.iconXValue = document.getElementById('iconXValue');
        this.iconYInput = document.getElementById('iconY');
        this.iconYValue = document.getElementById('iconYValue');
        this.iconRotationInput = document.getElementById('iconRotation');
        this.iconRotationValue = document.getElementById('iconRotationValue');
        this.iconOpacityInput = document.getElementById('iconOpacity');
        this.iconOpacityValue = document.getElementById('iconOpacityValue');
        
        // 预设图标
        this.presetIcons = {
            icon1: 'assets/icons/icon1.svg',
            icon2: 'assets/icons/icon2.svg',
            icon3: 'assets/icons/icon3.svg',
            icon4: 'assets/icons/icon4.svg'
        };
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 初始化
    init() {
        // 获取图标图层
        if (layerManager) {
            this.iconLayer = layerManager.getLayer('icon');
            
            // 更新UI
            this.updateUI();
            
            // 创建默认图标
            this.createDefaultIcons();
        }
    }
    
    // 创建默认图标
    createDefaultIcons() {
        // 创建简单的SVG图标
        const createSVG = (id, content) => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
            svg.innerHTML = content;
            
            // 创建Blob
            const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            // 保存到预设图标
            this.presetIcons[id] = url;
            
            // 更新图标项
            const iconItem = document.querySelector(`[data-icon="${id}"]`);
            if (iconItem) {
                const img = iconItem.querySelector('img');
                if (img) {
                    img.src = url;
                }
            }
        };
        
        // 创建图标1 - 星形
        createSVG('icon1', '<path fill="#FFD700" d="M12,1L9,9H1l6.5,5.5L5,22l7-4.5L19,22l-2.5-7.5L23,9h-8L12,1z"/>');
        
        // 创建图标2 - 书本
        createSVG('icon2', '<path fill="#4A90E2" d="M21,4H3C2.4,4,2,4.4,2,5v14c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V5C22,4.4,21.6,4,21,4z M11,16H4v-2h7V16z M11,12H4v-2h7V12z M20,16h-7v-2h7V16z M20,12h-7v-2h7V12z"/>');
        
        // 创建图标3 - 音符
        createSVG('icon3', '<path fill="#E91E63" d="M12,3v10.6c-0.6-0.3-1.3-0.6-2-0.6c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4V7h4V3H12z"/>');
        
        // 创建图标4 - 相机
        createSVG('icon4', '<path fill="#673AB7" d="M20,5h-3.2L15,3H9L7.2,5H4C2.9,5,2,5.9,2,7v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V7C22,5.9,21.1,5,20,5z M12,18c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S14.8,18,12,18z M12,10c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3S13.7,10,12,10z"/>');
    }
    
    // 更新UI
    updateUI() {
        if (!this.iconLayer) return;
        
        const data = this.iconLayer.getData();
        
        // 更新图标大小
        this.iconSizeInput.value = data.size;
        this.iconSizeValue.textContent = `${data.size}px`;
        
        // 更新位置
        this.iconXInput.value = data.x;
        this.iconXValue.textContent = `${data.x}px`;
        this.iconYInput.value = data.y;
        this.iconYValue.textContent = `${data.y}px`;
        
        // 更新旋转
        this.iconRotationInput.value = data.rotation;
        this.iconRotationValue.textContent = `${data.rotation}°`;
        
        // 更新不透明度
        this.iconOpacityInput.value = data.opacity;
        this.iconOpacityValue.textContent = `${data.opacity}%`;
    }
    
    // 加载图标
    loadIcon(file) {
        if (!file || !this.iconLayer) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // 更新图标图层数据
                const data = this.iconLayer.getData();
                data.image = img;
                this.iconLayer.setData(data);
                
                // 重新渲染
                this.render();
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    // 加载预设图标
    loadPresetIcon(iconId) {
        if (!this.presetIcons[iconId] || !this.iconLayer) return;
        
        const img = new Image();
        
        img.onload = () => {
            // 更新图标图层数据
            const data = this.iconLayer.getData();
            data.image = img;
            this.iconLayer.setData(data);
            
            // 重新渲染
            this.render();
        };
        
        img.src = this.presetIcons[iconId];
    }
    
    // 更新图标设置
    updateIconSettings() {
        if (!this.iconLayer) return;
        
        const data = this.iconLayer.getData();
        
        // 更新图标大小
        data.size = parseInt(this.iconSizeInput.value);
        this.iconSizeValue.textContent = `${data.size}px`;
        
        // 更新位置
        data.x = parseInt(this.iconXInput.value);
        this.iconXValue.textContent = `${data.x}px`;
        data.y = parseInt(this.iconYInput.value);
        this.iconYValue.textContent = `${data.y}px`;
        
        // 更新旋转
        data.rotation = parseInt(this.iconRotationInput.value);
        this.iconRotationValue.textContent = `${data.rotation}°`;
        
        // 更新不透明度
        data.opacity = parseInt(this.iconOpacityInput.value);
        this.iconOpacityValue.textContent = `${data.opacity}%`;
        
        // 更新图标图层数据
        this.iconLayer.setData(data);
        
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
        // 上传图标
        this.iconFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.loadIcon(e.target.files[0]);
            }
        });
        
        // 预设图标
        this.iconItems.forEach(item => {
            item.addEventListener('click', () => {
                const iconId = item.getAttribute('data-icon');
                this.loadPresetIcon(iconId);
                
                // 添加选中样式
                this.iconItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // 图标大小
        this.iconSizeInput.addEventListener('input', () => {
            this.updateIconSettings();
        });
        
        // 位置
        this.iconXInput.addEventListener('input', () => {
            this.updateIconSettings();
        });
        
        this.iconYInput.addEventListener('input', () => {
            this.updateIconSettings();
        });
        
        // 旋转
        this.iconRotationInput.addEventListener('input', () => {
            this.updateIconSettings();
        });
        
        // 不透明度
        this.iconOpacityInput.addEventListener('input', () => {
            this.updateIconSettings();
        });
    }
}

// 创建图标管理器实例
let iconManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待图层管理器初始化
    setTimeout(() => {
        iconManager = new IconManager();
        iconManager.init();
    }, 100);
});
