// File Manager - Clean Version
// No server actions (restart, migrate, etc.)

frappe.provide("frappe.file_manager");

frappe.file_manager = {
    current_path: null,
    current_file: null,
    editor: null,

    // ==================== Initialize ====================
    
    init: function() {
        this.render_ui();
        this.load_files_list();
        this.bind_events();
    },

    // ==================== UI Rendering ====================
    
    render_ui: function() {
        const html = `
            <div class="file-manager-container">
                <div class="fm-sidebar">
                    <div class="fm-header">
                        <h4>📁 List Of Files</h4>
                    </div>
                    <div class="fm-files-list"></div>
                </div>
                
                <div class="fm-main">
                    <div class="fm-toolbar">
                        <span class="fm-current-path"></span>
                        <div class="fm-actions">
                            <button class="btn btn-sm btn-primary fm-save-btn" style="display:none;">
                                💾 Save
                            </button>
                            <button class="btn btn-sm btn-secondary fm-backup-btn" style="display:none;">
                                📋 Backups
                            </button>
                        </div>
                    </div>
                    
                    <div class="fm-editor-container">
                        <textarea class="fm-editor" style="display:none;"></textarea>
                        <div class="fm-folder-view" style="display:none;"></div>
                        <div class="fm-welcome">
                            <h3>👋 Welcome</h3>
                            <p>Select a file or folder from the list</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $(this.wrapper).html(html);
        this.add_styles();
    },

    add_styles: function() {
        const styles = `
            <style>
                .file-manager-container {
                    display: flex;
                    height: calc(100vh - 120px);
                    border: 1px solid #d1d8dd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .fm-sidebar {
                    width: 280px;
                    border-right: 1px solid #d1d8dd;
                    background: #f7f7f7;
                    overflow-y: auto;
                }
                .fm-header {
                    padding: 15px;
                    border-bottom: 1px solid #d1d8dd;
                    background: #fff;
                }
                .fm-header h4 {
                    margin: 0;
                    font-size: 14px;
                }
                .fm-files-list {
                    padding: 10px;
                }
                .fm-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 5px;
                    background: #fff;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .fm-item:hover {
                    background: #e8f4ff;
                }
                .fm-item.active {
                    background: #d4edff;
                    border-left: 3px solid #2490ef;
                }
                .fm-item-icon {
                    font-size: 18px;
                    margin-right: 10px;
                }
                .fm-item-name {
                    flex: 1;
                    font-size: 13px;
                }
                .fm-item-size {
                    font-size: 11px;
                    color: #8d99a6;
                }
                .fm-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                }
                .fm-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    border-bottom: 1px solid #d1d8dd;
                    background: #fafbfc;
                }
                .fm-current-path {
                    font-size: 12px;
                    color: #6c7680;
                    font-family: monospace;
                }
                .fm-editor-container {
                    flex: 1;
                    overflow: hidden;
                }
                .fm-editor {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: 15px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                }
                .fm-folder-view {
                    padding: 20px;
                    overflow-y: auto;
                    height: 100%;
                }
                .fm-welcome {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #8d99a6;
                }
                .fm-folder-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    margin-bottom: 8px;
                    background: #f7f7f7;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .fm-folder-item:hover {
                    background: #e8f4ff;
                }
                .fm-back-btn {
                    background: #fff3cd;
                    margin-bottom: 15px;
                }
                .fm-backup-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    margin-bottom: 8px;
                    background: #f0f4f8;
                    border-radius: 6px;
                }
                .fm-backup-item button {
                    margin-left: 10px;
                }
            </style>
        `;
        $('head').append(styles);
    },

    // ==================== Data Loading ====================
    
    load_files_list: function() {
        frappe.call({
            method: "frappe.api.file_manager.get_files_list",
            callback: (r) => {
                if (r.message) {
                    this.render_files_list(r.message);
                }
            }
        });
    },

    render_files_list: function(files) {
        const $list = $(this.wrapper).find('.fm-files-list');
        $list.empty();
        
        files.forEach(file => {
            const icon = file.is_folder ? '📁' : '📄';
            const $item = $(`
                <div class="fm-item" data-path="${file.path}" data-is-folder="${file.is_folder}">
                    <span class="fm-item-icon">${icon}</span>
                    <span class="fm-item-name">${file.name}</span>
                    <span class="fm-item-size">${file.size}</span>
                </div>
            `);
            $list.append($item);
        });
    },

    load_folder: function(folder_path) {
        frappe.call({
            method: "frappe.api.file_manager.get_folder_contents",
            args: { folder_path: folder_path },
            callback: (r) => {
                if (r.message) {
                    this.render_folder_view(r.message, folder_path);
                }
            }
        });
    },

    render_folder_view: function(contents, folder_path) {
        const $view = $(this.wrapper).find('.fm-folder-view');
        $view.empty();
        
        // زر الرجوع
        const parent_path = folder_path.substring(0, folder_path.lastIndexOf('/'));
        if (parent_path.includes('/frappe/')) {
            $view.append(`
                <div class="fm-folder-item fm-back-btn" data-path="${parent_path}" data-is-folder="true">
                    <span class="fm-item-icon">⬅️</span>
                    <span class="fm-item-name">.. Back</span>
                </div>
            `);
        }
        
        contents.forEach(item => {
            const icon = item.is_folder ? '📁' : '📄';
            $view.append(`
                <div class="fm-folder-item" data-path="${item.path}" data-is-folder="${item.is_folder}">
                    <span class="fm-item-icon">${icon}</span>
                    <span class="fm-item-name">${item.name}</span>
                    <span class="fm-item-size" style="margin-left:auto;">${item.size}</span>
                </div>
            `);
        });
        
        $(this.wrapper).find('.fm-editor, .fm-welcome').hide();
        $view.show();
        $(this.wrapper).find('.fm-save-btn').hide();
        $(this.wrapper).find('.fm-backup-btn').hide();
    },

    load_file: function(file_path) {
        frappe.call({
            method: "frappe.api.file_manager.get_file_content",
            args: { file_path: file_path },
            callback: (r) => {
                if (r.message !== undefined) {
                    this.current_file = file_path;
                    $(this.wrapper).find('.fm-editor').val(r.message).show();
                    $(this.wrapper).find('.fm-folder-view, .fm-welcome').hide();
                    $(this.wrapper).find('.fm-save-btn, .fm-backup-btn').show();
                }
            }
        });
    },

    // ==================== File Operations ====================
    
    save_file: function() {
        if (!this.current_file) return;
        
        const content = $(this.wrapper).find('.fm-editor').val();
        
        frappe.call({
            method: "frappe.api.file_manager.save_file",
            args: {
                file_path: this.current_file,
                content: content
            },
            callback: (r) => {
                if (r.message && r.message.success) {
                    frappe.show_alert({
                        message: '✅ Saved + Backup created',
                        indicator: 'green'
                    });
                }
            }
        });
    },

    show_backups: function() {
        if (!this.current_file) return;
        
        frappe.call({
            method: "frappe.api.file_manager.get_backups",
            args: { file_path: this.current_file },
            callback: (r) => {
                if (r.message) {
                    this.render_backups_dialog(r.message);
                }
            }
        });
    },

    render_backups_dialog: function(backups) {
        let html = '';
        
        if (backups.length === 0) {
            html = '<p>No backups found</p>';
        } else {
            backups.forEach(backup => {
                html += `
                    <div class="fm-backup-item">
                        <div>
                            <strong>${backup.name}</strong><br>
                            <small>${backup.modified} | ${backup.size}</small>
                        </div>
                        <button class="btn btn-xs btn-primary" 
                                onclick="frappe.file_manager.restore_backup('${backup.path}')">
                            Restore
                        </button>
                    </div>
                `;
            });
        }
        
        const dialog = new frappe.ui.Dialog({
            title: '📋 Backups',
            size: 'large'
        });
        
        dialog.$body.html(`<div style="padding:15px;">${html}</div>`);
        dialog.show();
        
        this.backup_dialog = dialog;
    },

    restore_backup: function(backup_path) {
        frappe.confirm(
            'Are you sure you want to restore this backup?',
            () => {
                frappe.call({
                    method: "frappe.api.file_manager.restore_backup",
                    args: {
                        backup_path: backup_path,
                        original_path: this.current_file
                    },
                    callback: (r) => {
                        if (r.message && r.message.success) {
                            frappe.show_alert({
                                message: '✅ Restored successfully',
                                indicator: 'green'
                            });
                            this.load_file(this.current_file);
                            if (this.backup_dialog) {
                                this.backup_dialog.hide();
                            }
                        }
                    }
                });
            }
        );
    },

    // ==================== Event Binding ====================
    
    bind_events: function() {
        const $wrapper = $(this.wrapper);
        
        // كليك على عنصر في القائمة الجانبية
        $wrapper.on('click', '.fm-item', (e) => {
            const $item = $(e.currentTarget);
            const path = $item.data('path');
            const is_folder = $item.data('is-folder');
            
            $wrapper.find('.fm-item').removeClass('active');
            $item.addClass('active');
            
            $wrapper.find('.fm-current-path').text(path);
            
            if (is_folder) {
                this.load_folder(path);
            } else {
                this.load_file(path);
            }
        });
        
        // كليك على عنصر داخل مجلد
        $wrapper.on('click', '.fm-folder-item', (e) => {
            const $item = $(e.currentTarget);
            const path = $item.data('path');
            const is_folder = $item.data('is-folder');
            
            $wrapper.find('.fm-current-path').text(path);
            
            if (is_folder) {
                this.load_folder(path);
            } else {
                this.load_file(path);
            }
        });
        
        // زر الحفظ
        $wrapper.on('click', '.fm-save-btn', () => {
            this.save_file();
        });
        
        // زر الـ Backups
        $wrapper.on('click', '.fm-backup-btn', () => {
            this.show_backups();
        });
        
        // Ctrl+S للحفظ
        $wrapper.on('keydown', '.fm-editor', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.save_file();
            }
        });
    }
};

// ==================== Page Setup ====================

frappe.pages['file-manager'] = {
    onload: function(wrapper) {
        frappe.file_manager.wrapper = wrapper;
        frappe.file_manager.init();
    }
};
