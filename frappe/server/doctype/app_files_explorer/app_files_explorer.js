// =====================================================
// App Files Explorer with Monaco Editor
// =====================================================

const API_PATH = 'frappe.server.doctype.app_files_explorer.app_files_explorer';
const AUTHORIZED_USER = "mohamed.sharaf.secured@gmail.com";

let monacoEditor = null;
let monacoInitialized = false;
let isFullscreen = false;
let editorState = {
    theme: localStorage.getItem('app_explorer_theme') || 'vs-dark',
    fontSize: parseInt(localStorage.getItem('app_explorer_font_size')) || 14,
    isDirty: false,
    lastSavedContent: ''
};

const MONACO_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0';
const EDITOR_HEIGHT = 700;

// =====================================================
// Password Dialog
// =====================================================

function showPasswordDialog(options) {
    return new Promise((resolve, reject) => {
        const isFrappe = options.isFrappe || false;
        const action = options.action || 'save';
        
        let title, description, placeholder;
        
        if (action === 'delete') {
            title = __('Confirm Delete');
            description = __('Type <strong>sure_delete</strong> to confirm deletion');
            placeholder = 'sure_delete';
        } else if (isFrappe) {
            title = __('Security Password Required');
            description = __('Enter your password to save frappe app files');
            placeholder = __('Enter password');
        } else {
            title = __('Confirm Save');
            description = __('Type <strong>save_and_edit</strong> to confirm');
            placeholder = 'save_and_edit';
        }
        
        const dialog = new frappe.ui.Dialog({
            title: title,
            size: 'small',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `<div style="text-align:center;margin-bottom:16px;">
                        <div style="font-size:48px;">${action === 'delete' ? '🗑️' : '🔐'}</div>
                        <div style="color:#666;margin-top:8px;">${description}</div>
                    </div>`
                },
                {
                    label: action === 'delete' ? __('Confirmation Code') : __('Password'),
                    fieldname: 'password',
                    fieldtype: isFrappe && action !== 'delete' ? 'Password' : 'Data',
                    reqd: 1,
                    placeholder: placeholder
                }
            ],
            primary_action_label: action === 'delete' ? __('Delete') : __('Confirm'),
            primary_action: (values) => {
                dialog.hide();
                resolve(values.password);
            }
        });
        
        dialog.$wrapper.find('.modal-header .btn-modal-close').on('click', () => reject('cancelled'));
        dialog.show();
        setTimeout(() => dialog.$wrapper.find('input[data-fieldname="password"]').focus(), 200);
    });
}

// =====================================================
// Form Events
// =====================================================

frappe.ui.form.on('App Files Explorer', {
    async onload(frm) {
        await loadApps(frm);
    },

    async refresh(frm) {
        addButtons(frm);
        setupEditor(frm);
        
        if (frm.doc.app_name) {
            loadFilesList(frm);
        }
        
        if (frm.doc.my_code) {
            loadMonaco(() => initMonaco(frm));
        }
    },

    app_name(frm) {
        frm.set_value('target_path', '');
        frm.set_value('file_path', '');
        frm.set_value('my_code', '');
        if (monacoEditor) monacoEditor.setValue('');
        loadFilesList(frm);
    },

    target_path(frm) {
        loadFilesList(frm);
    }
});

// =====================================================
// Buttons
// =====================================================

function addButtons(frm) {
    frm.clear_custom_buttons();

    frm.add_custom_button(__("New File"), () => showCreateFileDialog(frm), __("Create"));
    frm.add_custom_button(__("New Folder"), () => showCreateFolderDialog(frm), __("Create"));

    if (frm.doc.file_path) {
        frm.add_custom_button(__("Delete File"), () => showDeleteFileDialog(frm), __("Actions"));
        frm.add_custom_button(__("Rename"), () => showRenameDialog(frm), __("Actions"));
        frm.add_custom_button(__("View Backups"), () => showBackupsDialog(frm), __("Actions"));
    }
}

// =====================================================
// Dialogs
// =====================================================

function showCreateFileDialog(frm) {
    if (!frm.doc.app_name) {
        frappe.show_alert({ message: __('Please select an app first'), indicator: 'orange' });
        return;
    }

    const isFrappe = frm.doc.app_name.toLowerCase() === 'frappe';

    const dialog = new frappe.ui.Dialog({
        title: __('Create New File'),
        size: 'small',
        fields: [
            {
                label: __('File Name'),
                fieldname: 'file_name',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: __('example.py')
            },
            {
                label: __('Template'),
                fieldname: 'template',
                fieldtype: 'Select',
                options: ['', 'Python (.py)', 'JavaScript (.js)', 'HTML (.html)', 'CSS (.css)', 'JSON (.json)', 'Markdown (.md)'],
                change: function() {
                    const extMap = {
                        'Python (.py)': '.py',
                        'JavaScript (.js)': '.js',
                        'HTML (.html)': '.html',
                        'CSS (.css)': '.css',
                        'JSON (.json)': '.json',
                        'Markdown (.md)': '.md'
                    };
                    const ext = extMap[this.get_value()];
                    if (ext) {
                        const name = (dialog.get_value('file_name') || 'new_file').split('.')[0];
                        dialog.set_value('file_name', name + ext);
                    }
                }
            },
            { fieldtype: 'Section Break', label: isFrappe ? __('Security Password') : __('Confirmation') },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Create'),
        primary_action: async (values) => {
            dialog.disable_primary_action();
            try {
                const res = await frappe.call({
                    method: `${API_PATH}.create_new_file`,
                    args: {
                        app_name: frm.doc.app_name,
                        folder_path: frm.doc.target_path || '',
                        file_name: values.file_name,
                        password: values.password
                    }
                });
                if (res.message?.success) {
                    frappe.show_alert({ message: res.message.message, indicator: 'green' });
                    dialog.hide();
                    await loadFilesList(frm);
                    frm.set_value('file_path', res.message.file_path);
                    loadFileContent(frm, res.message.file_path);
                }
            } finally {
                dialog.enable_primary_action();
            }
        }
    });
    dialog.show();
}

function showCreateFolderDialog(frm) {
    if (!frm.doc.app_name) {
        frappe.show_alert({ message: __('Please select an app first'), indicator: 'orange' });
        return;
    }

    const isFrappe = frm.doc.app_name.toLowerCase() === 'frappe';

    const dialog = new frappe.ui.Dialog({
        title: __('Create New Folder'),
        size: 'small',
        fields: [
            {
                label: __('Folder Name'),
                fieldname: 'folder_name',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: __('my_folder')
            },
            { fieldtype: 'Section Break', label: isFrappe ? __('Security Password') : __('Confirmation') },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Create'),
        primary_action: async (values) => {
            dialog.disable_primary_action();
            try {
                const res = await frappe.call({
                    method: `${API_PATH}.create_new_folder`,
                    args: {
                        app_name: frm.doc.app_name,
                        parent_path: frm.doc.target_path || '',
                        folder_name: values.folder_name,
                        password: values.password
                    }
                });
                if (res.message?.success) {
                    frappe.show_alert({ message: res.message.message, indicator: 'green' });
                    dialog.hide();
                    await loadFilesList(frm);
                }
            } finally {
                dialog.enable_primary_action();
            }
        }
    });
    dialog.show();
}

function showDeleteFileDialog(frm) {
    if (!frm.doc.file_path) return;

    const fileName = frm.doc.file_path.split('/').pop();

    const dialog = new frappe.ui.Dialog({
        title: __('Delete File'),
        size: 'small',
        fields: [
            {
                fieldtype: 'HTML',
                options: `<div style="text-align:center;">
                    <div style="font-size:48px;">🗑️</div>
                    <div style="margin:12px 0;padding:8px;background:#ffebee;border-radius:4px;color:#d32f2f;font-weight:600;">${fileName}</div>
                    <div style="color:#666;font-size:12px;">${__('This action cannot be undone. All backups will also be deleted.')}</div>
                </div>`
            },
            { fieldtype: 'Section Break', label: __('Confirmation') },
            {
                label: __('Type "sure_delete" to confirm'),
                fieldname: 'password',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: 'sure_delete'
            }
        ],
        primary_action_label: __('Delete'),
        primary_action: async (values) => {
            dialog.disable_primary_action();
            try {
                const res = await frappe.call({
                    method: `${API_PATH}.delete_file`,
                    args: {
                        app_name: frm.doc.app_name,
                        file_path: frm.doc.file_path,
                        password: values.password
                    }
                });
                if (res.message?.success) {
                    frappe.show_alert({ message: res.message.message, indicator: 'green' });
                    dialog.hide();
                    frm.set_value('file_path', '');
                    frm.set_value('my_code', '');
                    if (monacoEditor) monacoEditor.setValue('');
                    await loadFilesList(frm);
                }
            } finally {
                dialog.enable_primary_action();
            }
        }
    });
    dialog.show();
}

function showRenameDialog(frm) {
    if (!frm.doc.file_path) return;

    const currentName = frm.doc.file_path.split('/').pop();
    const isFrappe = frm.doc.app_name.toLowerCase() === 'frappe';

    const dialog = new frappe.ui.Dialog({
        title: __('Rename'),
        size: 'small',
        fields: [
            { label: __('Current Name'), fieldname: 'current', fieldtype: 'Data', read_only: 1, default: currentName },
            { label: __('New Name'), fieldname: 'new_name', fieldtype: 'Data', reqd: 1, default: currentName },
            { fieldtype: 'Section Break', label: isFrappe ? __('Security Password') : __('Confirmation') },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Rename'),
        primary_action: async (values) => {
            if (values.new_name === currentName) {
                frappe.show_alert({ message: __('Please enter a different name'), indicator: 'orange' });
                return;
            }
            dialog.disable_primary_action();
            try {
                const res = await frappe.call({
                    method: `${API_PATH}.rename_item`,
                    args: {
                        app_name: frm.doc.app_name,
                        old_path: frm.doc.file_path,
                        new_name: values.new_name,
                        password: values.password
                    }
                });
                if (res.message?.success) {
                    frappe.show_alert({ message: res.message.message, indicator: 'green' });
                    dialog.hide();
                    frm.set_value('file_path', res.message.new_path);
                    await loadFilesList(frm);
                }
            } finally {
                dialog.enable_primary_action();
            }
        }
    });
    dialog.show();
}

async function showBackupsDialog(frm) {
    if (!frm.doc.file_path) return;

    const res = await frappe.call({
        method: `${API_PATH}.list_file_backups`,
        args: { app_name: frm.doc.app_name, file_path: frm.doc.file_path }
    });

    const backups = res.message || [];
    const fileName = frm.doc.file_path.split('/').pop();
    const isFrappe = frm.doc.app_name.toLowerCase() === 'frappe';

    let html;
    if (backups.length === 0) {
        html = `<div style="text-align:center;padding:40px;color:#666;">
            <div style="font-size:48px;">📁</div>
            <div>${__('No backups found for this file')}</div>
        </div>`;
    } else {
        html = `<div style="max-height:400px;overflow-y:auto;">
            <table class="table table-bordered" style="margin:0;">
                <thead><tr><th>${__('Timestamp')}</th><th>${__('Size')}</th><th>${__('Actions')}</th></tr></thead>
                <tbody>
                    ${backups.map(b => `<tr>
                        <td>${b.timestamp}</td>
                        <td>${b.size_formatted}</td>
                        <td>
                            <button class="btn btn-xs btn-default btn-view-backup" data-filename="${b.filename}">👁️ ${__('View')}</button>
                            <button class="btn btn-xs btn-primary btn-restore-backup" data-filename="${b.filename}">↩️ ${__('Restore')}</button>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    }

    const dialog = new frappe.ui.Dialog({
        title: __('Backups for: ') + fileName,
        size: 'large',
        fields: [{ fieldtype: 'HTML', fieldname: 'backups_list', options: html }],
        primary_action_label: __('Close'),
        primary_action: () => dialog.hide()
    });

    dialog.show();

    // View backup
    dialog.$wrapper.find('.btn-view-backup').on('click', async function() {
        const backupFilename = $(this).data('filename');
        try {
            const content = await frappe.call({
                method: `${API_PATH}.read_backup_content`,
                args: {
                    app_name: frm.doc.app_name,
                    file_path: frm.doc.file_path,
                    backup_filename: backupFilename
                }
            });

            new frappe.ui.Dialog({
                title: __('Backup: ') + backupFilename,
                size: 'extra-large',
                fields: [{
                    fieldtype: 'Code',
                    fieldname: 'content',
                    options: getLanguage(frm.doc.file_path),
                    default: content.message,
                    read_only: 1
                }],
                primary_action_label: __('Close'),
                primary_action() { this.hide(); }
            }).show();
        } catch (e) {
            console.error(e);
        }
    });

    // Restore backup
    dialog.$wrapper.find('.btn-restore-backup').on('click', async function() {
        const backupFilename = $(this).data('filename');
        try {
            const password = await showPasswordDialog({ isFrappe, action: 'save' });
            const res = await frappe.call({
                method: `${API_PATH}.restore_backup`,
                args: {
                    app_name: frm.doc.app_name,
                    file_path: frm.doc.file_path,
                    backup_filename: backupFilename,
                    password: password
                }
            });
            if (res.message?.success) {
                frappe.show_alert({ message: res.message.message, indicator: 'green' });
                dialog.hide();
                loadFileContent(frm, frm.doc.file_path);
            }
        } catch (e) {
            if (e !== 'cancelled') console.error(e);
        }
    });
}

// =====================================================
// File List
// =====================================================

async function loadApps(frm) {
    const res = await frappe.call({ method: `${API_PATH}.get_installed_apps` });
    let apps = res.message || [];

    if (frappe.session.user !== AUTHORIZED_USER) {
        apps = apps.filter(app => app.toLowerCase() !== 'frappe');
    }

    frm.set_df_property('app_name', 'options', apps.join('\n'));
    frm.refresh_field('app_name');
}

async function loadFilesList(frm) {
    const app = frm.doc.app_name;
    const path = frm.doc.target_path || "";
    if (!app) return;

    const res = await frappe.call({
        method: `${API_PATH}.list_app_folder_files`,
        args: { app_name: app, path }
    });

    const files = (res.message || []).sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });

    const getIcon = (name, isDir, isBackup) => {
        if (isBackup) return '💾';
        if (isDir) return '📁';
        const ext = name.split('.').pop().toLowerCase();
        const icons = { py: '🐍', js: '📜', json: '📋', html: '🌐', css: '🎨', md: '📝', txt: '📄', sql: '🗃️' };
        return icons[ext] || '📄';
    };

    const breadcrumbs = buildBreadcrumbs(path);

    const html = `
    <style>
        .file-explorer { background:#1e1e1e; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
        .file-header { background:#2d2d30; padding:12px 16px; border-bottom:1px solid #3e3e42; }
        .file-breadcrumb { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
        .file-crumb { cursor:pointer; padding:4px 8px; border-radius:4px; color:#569cd6; font-size:13px; }
        .file-crumb:hover { background:rgba(86,156,214,0.2); }
        .file-search { width:100%; padding:8px 12px; background:#3c3c3c; border:1px solid #555; border-radius:4px; color:#ccc; font-size:13px; outline:none; }
        .file-search:focus { border-color:#007acc; }
        .file-body { max-height:500px; overflow-y:auto; background:#252526; }
        .file-list { list-style:none; padding:8px; margin:0; }
        .file-item { display:flex; align-items:center; padding:10px 12px; cursor:pointer; border-radius:4px; gap:10px; margin-bottom:2px; }
        .file-item:hover { background:rgba(255,255,255,0.08); }
        .file-item.selected { background:#094771; }
        .file-item.is-dir .file-name { color:#9cdcfe; font-weight:500; }
        .file-item.is-backup .file-name { color:#ffd700; font-style:italic; }
        .file-icon { font-size:18px; min-width:24px; text-align:center; }
        .file-name { flex:1; font-size:13px; color:#ccc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .file-size { font-size:11px; color:#858585; min-width:60px; text-align:right; }
        .file-footer { background:#2d2d30; padding:10px 16px; border-top:1px solid #3e3e42; font-size:12px; color:#858585; display:flex; justify-content:space-between; }
        .file-empty { text-align:center; padding:40px; color:#858585; }
    </style>
    <div class="file-explorer">
        <div class="file-header">
            <div class="file-breadcrumb">${breadcrumbs}</div>
            <input type="text" class="file-search" placeholder="${__('Search files...')}">
        </div>
        <div class="file-body">
            ${files.length ? `<ul class="file-list">
                ${files.map(f => `
                    <li class="file-item ${f.is_dir ? 'is-dir' : ''} ${f.is_backup_folder ? 'is-backup' : ''}"
                        data-path="${f.path}" data-is-file="${f.is_file}" data-name="${f.name.toLowerCase()}">
                        <span class="file-icon">${getIcon(f.name, f.is_dir, f.is_backup_folder)}</span>
                        <span class="file-name">${f.name}</span>
                        ${!f.is_dir ? `<span class="file-size">${formatSize(f.size)}</span>` : ''}
                    </li>
                `).join('')}
            </ul>` : `<div class="file-empty"><div style="font-size:48px;">📂</div><div>${__('Empty folder')}</div></div>`}
        </div>
        <div class="file-footer">
            <span>${files.length} ${__('items')}</span>
            <span>📂 ${path || '/'}</span>
        </div>
    </div>`;

    frm.set_df_property("files_list_html", "options", html);
    frm.refresh_field("files_list_html");

    setTimeout(() => {
        const wrapper = frm.fields_dict.files_list_html.$wrapper;

        wrapper.find(".file-item").on("click", function() {
            const itemPath = $(this).data("path");
            const isFile = $(this).data("is-file");

            wrapper.find(".file-item").removeClass("selected");
            $(this).addClass("selected");

            if (!isFile) {
                frm.set_value("target_path", itemPath);
            } else {
                frm.set_value("file_path", itemPath);
                loadFileContent(frm, itemPath);
            }
        });

        wrapper.find(".file-crumb").on("click", function() {
            frm.set_value("target_path", $(this).data("path"));
        });

        wrapper.find(".file-search").on("input", function() {
            const query = $(this).val().toLowerCase();
            wrapper.find(".file-item").each(function() {
                $(this).toggle($(this).data("name").includes(query));
            });
        });
    }, 100);
}

function buildBreadcrumbs(path) {
    if (!path) return '<span class="file-crumb" data-path="">🏠 Root</span>';

    const parts = path.split('/').filter(Boolean);
    let html = '<span class="file-crumb" data-path="">🏠 Root</span>';
    let current = '';

    parts.forEach(part => {
        current += (current ? '/' : '') + part;
        html += `<span style="color:#666;">›</span><span class="file-crumb" data-path="${current}">${part}</span>`;
    });

    return html;
}

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function loadFileContent(frm, filePath) {
    if (!frm.doc.app_name || !filePath) return;

    frappe.show_alert({ message: __('Loading...'), indicator: 'blue' }, 1);

    const res = await frappe.call({
        method: `${API_PATH}.read_file_content`,
        args: { app_name: frm.doc.app_name, file_path: filePath }
    });

    frm.set_value("my_code", res.message || "");
    frappe.show_alert({ message: __('File loaded'), indicator: 'green' }, 1);

    if (!monacoInitialized) {
        loadMonaco(() => initMonaco(frm));
    } else {
        initMonaco(frm);
    }
}

// =====================================================
// Monaco Editor
// =====================================================

function setupEditor(frm) {
    if (!frm.fields_dict.editor_html) return;

    frm.fields_dict.editor_html.$wrapper.html(`
    <div class="monaco-container" style="position:relative;width:100%;height:${EDITOR_HEIGHT}px;border:1px solid #d1d8dd;border-radius:4px;overflow:hidden;">
        <div class="monaco-toolbar" style="background:#f5f7fa;border-bottom:1px solid #d1d8dd;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                <button class="btn btn-xs btn-primary btn-save"><i class="fa fa-save"></i> ${__('Save')}</button>
                <button class="btn btn-xs btn-default btn-format"><i class="fa fa-indent"></i> ${__('Format')}</button>
                <button class="btn btn-xs btn-default btn-find"><i class="fa fa-search"></i> ${__('Find')}</button>
                <button class="btn btn-xs btn-default btn-fullscreen"><i class="fa fa-expand"></i></button>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
                <select class="theme-select" style="height:24px;font-size:11px;">
                    <option value="vs">Light</option>
                    <option value="vs-dark">Dark</option>
                    <option value="hc-black">High Contrast</option>
                </select>
                <input type="range" class="font-range" min="10" max="24" value="${editorState.fontSize}" style="width:60px;">
                <span class="font-value" style="font-size:11px;min-width:32px;">${editorState.fontSize}px</span>
                <span class="save-status" style="font-size:11px;color:#5cb85c;">● ${__('Saved')}</span>
                <span class="cursor-pos" style="font-size:11px;color:#666;">Ln 1, Col 1</span>
            </div>
        </div>
        <div id="monaco-editor" style="width:100%;height:calc(100% - 45px);"></div>
    </div>`);

    const wrapper = frm.fields_dict.editor_html.$wrapper;
    wrapper.find('.theme-select').val(editorState.theme);
    wrapper.find('.font-range').val(editorState.fontSize);
    wrapper.find('.font-value').text(editorState.fontSize + 'px');
}

function loadMonaco(callback) {
    if (window.monaco) {
        monacoInitialized = true;
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src = `${MONACO_CDN}/min/vs/loader.min.js`;
    script.onload = () => {
        require.config({ paths: { 'vs': `${MONACO_CDN}/min/vs` } });
        require(['vs/editor/editor.main'], () => {
            monacoInitialized = true;
            callback();
        });
    };
    document.head.appendChild(script);
}

function initMonaco(frm) {
    const container = document.getElementById('monaco-editor');
    if (!container) return;

    if (monacoEditor) monacoEditor.dispose();

    monacoEditor = monaco.editor.create(container, {
        value: frm.doc.my_code || '',
        language: getLanguage(frm.doc.file_path),
        theme: editorState.theme,
        fontSize: editorState.fontSize,
        automaticLayout: true,
        minimap: { enabled: true },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        folding: true,
        bracketPairColorization: { enabled: true },
        renderWhitespace: 'selection'
    });

    editorState.lastSavedContent = frm.doc.my_code || '';
    editorState.isDirty = false;

    const wrapper = frm.fields_dict.editor_html.$wrapper;

    monacoEditor.onDidChangeModelContent(() => {
        const content = monacoEditor.getValue();
        frm.doc.my_code = content;
        const dirty = content !== editorState.lastSavedContent;
        editorState.isDirty = dirty;
        wrapper.find('.save-status').html(dirty
            ? `<span style="color:#f0ad4e;">● ${__('Unsaved')}</span>`
            : `<span style="color:#5cb85c;">● ${__('Saved')}</span>`
        );
    });

    monacoEditor.onDidChangeCursorPosition(e => {
        wrapper.find('.cursor-pos').text(`Ln ${e.position.lineNumber}, Col ${e.position.column}`);
    });

    // Keyboard shortcut: Ctrl+S to save
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveFile(frm));

    // Toolbar buttons
    wrapper.find('.btn-save').off('click').on('click', () => saveFile(frm));
    wrapper.find('.btn-format').off('click').on('click', () => monacoEditor.getAction('editor.action.formatDocument').run());
    wrapper.find('.btn-find').off('click').on('click', () => monacoEditor.getAction('actions.find').run());

    wrapper.find('.btn-fullscreen').off('click').on('click', () => {
        const container = wrapper.find('.monaco-container');
        if (!isFullscreen) {
            container.css({ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, borderRadius: 0 });
            isFullscreen = true;
        } else {
            container.css({ position: 'relative', top: 'auto', left: 'auto', width: '100%', height: EDITOR_HEIGHT + 'px', zIndex: 'auto', borderRadius: '4px' });
            isFullscreen = false;
        }
        setTimeout(() => monacoEditor.layout(), 300);
    });

    wrapper.find('.theme-select').off('change').on('change', function() {
        editorState.theme = $(this).val();
        localStorage.setItem('app_explorer_theme', editorState.theme);
        monacoEditor.updateOptions({ theme: editorState.theme });
    });

    wrapper.find('.font-range').off('input').on('input', function() {
        editorState.fontSize = parseInt($(this).val());
        localStorage.setItem('app_explorer_font_size', editorState.fontSize);
        monacoEditor.updateOptions({ fontSize: editorState.fontSize });
        wrapper.find('.font-value').text(editorState.fontSize + 'px');
    });
}

async function saveFile(frm) {
    if (!monacoEditor || !frm.doc.app_name || !frm.doc.file_path) {
        frappe.show_alert({ message: __('No file selected'), indicator: 'orange' });
        return;
    }

    const isFrappe = frm.doc.app_name.toLowerCase() === 'frappe';

    try {
        const password = await showPasswordDialog({ isFrappe, action: 'save' });
        const content = monacoEditor.getValue();

        const res = await frappe.call({
            method: `${API_PATH}.write_file_content_with_backup`,
            args: {
                app_name: frm.doc.app_name,
                file_path: frm.doc.file_path,
                content: content,
                password: password
            }
        });

        if (res.message?.success) {
            editorState.lastSavedContent = content;
            editorState.isDirty = false;
            frm.fields_dict.editor_html.$wrapper.find('.save-status').html(`<span style="color:#5cb85c;">● ${__('Saved')}</span>`);
            frappe.show_alert({ message: res.message.message, indicator: 'green' });
        }
    } catch (e) {
        if (e !== 'cancelled') console.error(e);
    }
}

function getLanguage(filePath) {
    if (!filePath) return 'plaintext';
    const ext = filePath.split('.').pop().toLowerCase();
    const langMap = {
        py: 'python',
        js: 'javascript',
        json: 'json',
        html: 'html',
        css: 'css',
        md: 'markdown',
        sql: 'sql',
        xml: 'xml',
        yml: 'yaml',
        yaml: 'yaml',
        txt: 'plaintext'
    };
    return langMap[ext] || 'plaintext';
}
