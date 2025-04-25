/**
 * main.js - 书签卡片编辑器的主模块
 * 负责初始化应用和处理全局UI交互
 * 简化版本 - 仅保留背景功能
 */

// 主应用类
class BookmarkEditor {
    constructor() {
        // 标签页
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');

        // 导出按钮
        this.exportBtn = document.getElementById('exportBtn');

        // 绑定事件
        this.bindEvents();
    }

    // 切换标签页
    switchTab(tabId) {
        // 更新标签按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // 更新标签内容
        this.tabPanes.forEach(pane => {
            const isActive = pane.id === `${tabId}-tab`;
            pane.style.display = isActive ? 'block' : 'none';
        });
    }

    // 绑定事件
    bindEvents() {
        // 标签页切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // 导出按钮事件
        if (this.exportBtn) {
            // 使用一个标志来防止多次点击导致多次导出
            let isExporting = false;

            this.exportBtn.addEventListener('click', () => {
                console.log('导出书签');
                if (canvasManager && !isExporting) {
                    isExporting = true;

                    // 禁用按钮，防止重复点击
                    this.exportBtn.disabled = true;

                    // 执行导出
                    canvasManager.exportImage();

                    // 延迟重新启用按钮
                    setTimeout(() => {
                        isExporting = false;
                        this.exportBtn.disabled = false;
                    }, 1000); // 1秒后重新启用
                }
            });
        }
    }
}

// 创建主应用实例
let bookmarkEditor;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主应用
    bookmarkEditor = new BookmarkEditor();
});
