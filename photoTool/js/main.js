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

        // 注意：导出按钮事件已移至export.js中处理
    }
}

// 创建主应用实例
let bookmarkEditor;

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主应用
    bookmarkEditor = new BookmarkEditor();

    // 添加9:16比例按钮事件
    const apply916RatioBtn = document.getElementById('apply916Ratio');
    if (apply916RatioBtn) {
        apply916RatioBtn.addEventListener('click', () => {
            console.log('点击应用9:16比例按钮');
            if (canvasManager) {
                canvasManager.apply916Ratio();
            }
        });
    }

    // 添加布局类型切换事件
    const layoutTypeSelect = document.getElementById('layoutType');
    if (layoutTypeSelect && bookmarkManager) {
        layoutTypeSelect.addEventListener('change', (e) => {
            bookmarkManager.layoutType = e.target.value;
            bookmarkManager.updateLayout();
        });
    }
});
