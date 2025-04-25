/**
 * export.js - 书签卡片编辑器的导出模块
 * 负责处理书签导出和设置保存/加载功能
 */

// 导出管理类
class ExportManager {
    constructor() {
        // 导出按钮
        this.exportBtn = document.getElementById('exportBtn');

        // 保存/加载设置按钮
        this.saveBtn = document.getElementById('saveBtn');
        this.loadBtn = document.getElementById('loadBtn');

        // 导出状态标志
        this.isExporting = false;

        // 绑定事件
        this.bindEvents();
    }

    // 导出书签
    exportBookmark() {
        console.log('ExportManager: 开始导出书签');

        if (canvasManager && !this.isExporting) {
            // 设置导出标志，防止重复导出
            this.isExporting = true;
            console.log('ExportManager: 设置导出标志，防止重复导出');

            // 禁用导出按钮
            if (this.exportBtn) {
                this.exportBtn.disabled = true;
                console.log('ExportManager: 禁用导出按钮');
            }

            try {
                // 执行导出
                console.log('ExportManager: 调用canvasManager.exportImage()');
                canvasManager.exportImage();
            } catch (error) {
                console.error('ExportManager: 导出失败:', error);
                alert('导出失败，请查看控制台获取详细信息');
            } finally {
                // 延迟重新启用导出功能
                setTimeout(() => {
                    this.isExporting = false;
                    if (this.exportBtn) {
                        this.exportBtn.disabled = false;
                    }
                    console.log('ExportManager: 导出完成，重新启用导出按钮');
                }, 1000);
            }
        } else {
            console.log('ExportManager: 导出被跳过，原因：',
                        !canvasManager ? 'canvasManager不存在' : '正在导出中');
        }
    }

    // 保存设置
    saveSettings() {
        if (!layerManager) return;

        // 获取所有图层数据
        const data = layerManager.getLayersData();

        // 转换为JSON字符串
        const json = JSON.stringify(data, (key, value) => {
            // 跳过图片对象
            if (key === 'image' && value instanceof HTMLImageElement) {
                return value.src;
            }
            return value;
        });

        // 保存到本地存储
        localStorage.setItem('bookmarkSettings', json);

        // 提示用户
        alert('设置已保存');
    }

    // 加载设置
    loadSettings() {
        if (!layerManager) return;

        // 从本地存储获取数据
        const json = localStorage.getItem('bookmarkSettings');

        if (!json) {
            alert('没有找到保存的设置');
            return;
        }

        try {
            // 解析JSON
            const data = JSON.parse(json);

            // 处理图片
            for (const id in data) {
                if (data[id].data.image && typeof data[id].data.image === 'string') {
                    const img = new Image();
                    img.src = data[id].data.image;
                    data[id].data.image = img;
                }
            }

            // 设置图层数据
            layerManager.setLayersData(data);

            // 更新UI
            if (backgroundManager) backgroundManager.updateUI();
            // 注意：文字和图标功能已移除
            // if (textManager) textManager.updateUI();
            // if (iconManager) iconManager.updateUI();

            // 重新渲染
            if (canvasManager) canvasManager.render();

            // 提示用户
            alert('设置已加载');
        } catch (error) {
            console.error('加载设置失败:', error);
            alert('加载设置失败');
        }
    }

    // 绑定事件
    bindEvents() {
        // 导出按钮
        this.exportBtn.addEventListener('click', () => {
            console.log('ExportManager: 导出按钮被点击');
            this.exportBookmark();
        });

        // 保存设置按钮
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // 加载设置按钮
        if (this.loadBtn) {
            this.loadBtn.addEventListener('click', () => {
                this.loadSettings();
            });
        }

        console.log('ExportManager: 事件绑定完成');
    }
}

// 创建导出管理器实例
let exportManager;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待其他管理器初始化
    setTimeout(() => {
        exportManager = new ExportManager();
    }, 200);
});
