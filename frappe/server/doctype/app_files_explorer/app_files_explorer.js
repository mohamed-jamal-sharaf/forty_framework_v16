// =====================================================
// Enhanced App Files Explorer with Monaco Editor
// Complete Version with Password Protection
// =====================================================

// API Base Path
const API_PATH = 'frappe.server.doctype.app_files_explorer.app_files_explorer';

// =====================================================
// Global State
// =====================================================

let monacoEditor = null;
let monacoInitialized = false;
let isFullscreen = false;
let editorState = {
    theme: localStorage.getItem('app_explorer_theme') || 'vs-dark',
    fontSize: parseInt(localStorage.getItem('app_explorer_font_size')) || 14,
    isDirty: false,
    lastSavedContent: '',
    currentFile: null
};

// Monaco CDN Configuration
const MONACO_CDN = {
    BASE_URL: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0',
    VERSION: '0.44.0'
};

const EDITOR_CONFIG = {
    DEFAULT_HEIGHT: 700,
    MIN_FONT_SIZE: 10,
    MAX_FONT_SIZE: 24,
    DEFAULT_FONT_SIZE: 14,
    AUTOSAVE_DELAY: 5000
};

// Authorized user for frappe app access
const AUTHORIZED_USER = "mohamed.sharaf.secured@gmail.com";

// =====================================================
// Password Dialog Helper
// =====================================================

function showPasswordDialog(options) {
    return new Promise((resolve, reject) => {
        const isFrappe = options.isFrappe || false;
        const action = options.action || 'save';
        
        let title, description, placeholder;
        
        if (action === 'delete') {
            title = __('Confirm Delete');
            description = __('Enter <strong>sure_delete</strong> to confirm deletion');
            placeholder = 'sure_delete';
        } else if (isFrappe) {
            title = __('Frappe App - Security Check');
            description = __('Enter your security password to save frappe app files');
            placeholder = __('Enter password');
        } else {
            title = __('Confirm Save');
            description = __('Enter <strong>save_and_edit</strong> to confirm save');
            placeholder = 'save_and_edit';
        }
        
        const dialog = new frappe.ui.Dialog({
            title: title,
            size: 'small',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 48px;">${action === 'delete' ? '🗑️' : '🔐'}</div>
                            <div style="color: #666; margin-top: 8px;">
                                ${description}
                            </div>
                        </div>
                    `
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
            },
            secondary_action_label: __('Cancel'),
            secondary_action: () => {
                dialog.hide();
                reject('cancelled');
            }
        });
        
        dialog.show();
        
        // Focus on password field
        setTimeout(() => {
            dialog.$wrapper.find('input[data-fieldname="password"]').focus();
        }, 300);
    });
}

// =====================================================
// Bench Operations Module
// =====================================================

const BenchOperations = {
    currentOperationId: null,
    progressInterval: null,
    progressDialog: null,

    addServerButtons(frm) {
        frm.add_custom_button(__("Restart"), () => {
            this.showRestartDialog();
        }, __("Server"));

        frm.add_custom_button(__("Restart (Sudo)"), () => {
            this.showSudoRestartDialog();
        }, __("Server"));

        frm.add_custom_button(__("Migrate"), () => {
            this.showMigrateDialog();
        }, __("Server"));

        frm.add_custom_button(__("Build"), () => {
            this.showBuildDialog();
        }, __("Server"));

        frm.add_custom_button(__("Clear Cache"), () => {
            this.runClearCache();
        }, __("Server"));

        frm.add_custom_button(__("Bench Info"), () => {
            this.showBenchInfo();
        }, __("Server"));
    },

    showRestartDialog() {
        frappe.confirm(
            `<div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${__('Restart Bench')}</div>
                <div style="color: #666; margin-bottom: 16px;">${__('This will restart the web server and workers.')}</div>
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px; color: #856404;">
                    ${__('The page may become temporarily unavailable.')}
                </div>
            </div>`,
            async () => {
                await this.executeRestart();
            },
            __('Cancel')
        );
    },

    showSudoRestartDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('Restart Bench with Sudo'),
            size: 'small',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 48px;">🔄</div>
                            <div style="color: #666; margin-top: 8px;">
                                ${__('Enter your system password for a full bench restart')}
                            </div>
                        </div>
                    `
                },
                {
                    label: __('Sudo Password'),
                    fieldname: 'sudo_password',
                    fieldtype: 'Password',
                    reqd: 1,
                    placeholder: __('Enter system password')
                }
            ],
            primary_action_label: __('Restart Now'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeRestartWithSudo(values.sudo_password);
            }
        });
        dialog.show();
    },

    showMigrateDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('Run Bench Migrate'),
            size: 'small',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 48px;">🗃</div>
                            <div style="color: #666; margin-top: 8px;">
                                ${__('This will run database migrations and sync schema changes.')}
                            </div>
                        </div>
                    `
                },
                {
                    label: __('Sudo Password'),
                    fieldname: 'sudo_password',
                    fieldtype: 'Password',
                    reqd: 1,
                    placeholder: __('Enter sudo password for frappe user')
                }
            ],
            primary_action_label: __('Start Migration'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeMigrate(values.sudo_password);
            }
        });
        dialog.show();
    },

    showBuildDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('Build Assets'),
            size: 'small',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 48px;">🔨</div>
                            <div style="color: #666; margin-top: 8px;">
                                ${__('Compile and bundle JavaScript and CSS assets.')}
                            </div>
                        </div>
                    `
                },
                {
                    label: __('Specific App (Optional)'),
                    fieldname: 'app',
                    fieldtype: 'Data',
                    placeholder: __('Leave empty to build all apps')
                },
                {
                    label: __('Sudo Password (Optional)'),
                    fieldname: 'sudo_password',
                    fieldtype: 'Password',
                    placeholder: __('Leave empty if not required')
                }
            ],
            primary_action_label: __('Start Build'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeBuild(values.sudo_password, values.app);
            }
        });
        dialog.show();
    },

    async executeRestart() {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.restart_bench',
                freeze: true,
                freeze_message: __('Initiating restart...')
            });

            if (res.message && res.message.operation_id) {
                this.showProgressDialog('restart', res.message.operation_id);
            } else {
                frappe.show_alert({
                    message: res.message || __('Restart initiated'),
                    indicator: 'green'
                }, 5);

                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to restart: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    },

    async executeRestartWithSudo(sudo_password) {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.restart_bench_with_sudo',
                args: { sudo_password },
                freeze: true,
                freeze_message: __('Initiating sudo restart...')
            });

            if (res.message && res.message.operation_id) {
                this.showProgressDialog('restart', res.message.operation_id, true);
            }
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to restart: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    },

    async executeMigrate(sudo_password) {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.run_migrate',
                args: { sudo_password: sudo_password || null },
                freeze: true,
                freeze_message: __('Initiating migration...')
            });

            if (res.message && res.message.operation_id) {
                this.showProgressDialog('migrate', res.message.operation_id);
            }
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to start migration: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    },

    async executeBuild(sudo_password, app) {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.run_build',
                args: {
                    sudo_password: sudo_password || null,
                    app: app || null
                },
                freeze: true,
                freeze_message: __('Initiating build...')
            });

            if (res.message && res.message.operation_id) {
                this.showProgressDialog('build', res.message.operation_id);
            }
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to start build: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    },

    async runClearCache() {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.run_clear_cache',
                freeze: true,
                freeze_message: __('Clearing cache...')
            });

            frappe.show_alert({
                message: res.message?.message || __('Cache cleared!'),
                indicator: 'green'
            }, 3);
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to clear cache: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    },

    showProgressDialog(operation, operationId, autoRefreshOnComplete = false) {
        const self = this;
        self.currentOperationId = operationId;

        const operationTitles = {
            'restart': __('Restarting Bench'),
            'migrate': __('Running Migration'),
            'build': __('Building Assets'),
            'clear_cache': __('Clearing Cache')
        };

        self.progressDialog = new frappe.ui.Dialog({
            title: operationTitles[operation] || __('Operation in Progress'),
            size: 'large',
            static: true,
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'progress_content',
                    options: self.getProgressHTML(0, __('Starting...'))
                }
            ],
            primary_action_label: __('Please wait...'),
            primary_action: () => {
                self.stopProgressPolling();
                self.progressDialog.hide();
                if (autoRefreshOnComplete) {
                    window.location.reload();
                }
            }
        });

        self.progressDialog.$wrapper.find('.btn-primary').prop('disabled', true);
        self.progressDialog.show();
        self.startProgressPolling(operationId, autoRefreshOnComplete);
    },

    getProgressHTML(progress, message, logs = []) {
        const logsHTML = logs.map(log => `
            <div style="padding: 4px 8px; border-bottom: 1px solid #333; font-size: 12px;">
                <span style="color: #888; margin-right: 8px;">${log.time ? log.time.split(' ')[1] : ''}</span>
                <span>${log.message}</span>
            </div>
        `).join('');

        return `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 100%; background: #e9ecef; border-radius: 10px; height: 24px; overflow: hidden; margin-bottom: 16px;">
                    <div class="progress-bar-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; transition: width 0.3s ease;">
                        ${progress}%
                    </div>
                </div>
                <div class="progress-message" style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    ${message}
                </div>
                <div style="background: #1e1e1e; border-radius: 8px; max-height: 200px; overflow-y: auto; text-align: left; color: #d4d4d4;" class="progress-logs">
                    ${logsHTML || '<div style="padding: 16px; color: #666; text-align: center;">Waiting for output...</div>'}
                </div>
            </div>
        `;
    },

    startProgressPolling(operationId, autoRefreshOnComplete) {
        const self = this;

        self.progressInterval = setInterval(async () => {
            try {
                const res = await frappe.call({
                    method: 'frappe.api.restart_api.get_operation_progress',
                    args: { operation_id: operationId }
                });

                const data = res.message;

                if (data && data.status !== 'not_found') {
                    self.updateProgressDialog(data);

                    if (data.status === 'completed' || data.status === 'error') {
                        self.stopProgressPolling();

                        if (self.progressDialog && self.progressDialog.$wrapper) {
                            self.progressDialog.$wrapper.find('.btn-primary').prop('disabled', false).text(__('Close'));
                        }

                        if (data.status === 'completed' && autoRefreshOnComplete) {
                            setTimeout(() => {
                                if (self.progressDialog) {
                                    self.progressDialog.hide();
                                }
                                window.location.reload();
                            }, 2000);
                        }
                    }
                }
            } catch (error) {
                console.error('Progress polling error:', error);
            }
        }, 1000);
    },

    stopProgressPolling() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    },

    updateProgressDialog(data) {
        const self = this;
        if (!self.progressDialog || !self.progressDialog.fields_dict.progress_content) return;

        const wrapper = self.progressDialog.fields_dict.progress_content.$wrapper;
        wrapper.find('.progress-bar-fill').css('width', data.progress + '%').text(data.progress + '%');
        wrapper.find('.progress-message').text(data.message);

        if (data.status === 'error') {
            wrapper.find('.progress-bar-fill').css('background', 'linear-gradient(90deg, #f44336, #e91e63)');
        }

        if (data.logs && data.logs.length > 0) {
            const logsHTML = data.logs.map(log => `
                <div style="padding: 4px 8px; border-bottom: 1px solid #333; font-size: 12px;">
                    <span style="color: #888; margin-right: 8px;">${log.time ? log.time.split(' ')[1] : ''}</span>
                    <span>${self.escapeHtml(log.message)}</span>
                </div>
            `).join('');

            const logsContainer = wrapper.find('.progress-logs');
            logsContainer.html(logsHTML);
            logsContainer.scrollTop(logsContainer[0].scrollHeight);
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    async showBenchInfo() {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.get_bench_info',
                freeze: true,
                freeze_message: __('Loading bench info...')
            });

            const info = res.message;

            const dialog = new frappe.ui.Dialog({
                title: __('Bench Information'),
                size: 'large',
                fields: [
                    {
                        fieldtype: 'HTML',
                        options: `
                            <div style="padding: 16px;">
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${__('Bench Path')}</div>
                                        <div style="font-weight: 600; word-break: break-all;">${info.bench_path}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${__('Site')}</div>
                                        <div style="font-weight: 600;">${info.site}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${__('Python Version')}</div>
                                        <div style="font-weight: 600;">${info.python_version}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${__('Frappe Version')}</div>
                                        <div style="font-weight: 600;">${info.frappe_version}</div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <div style="font-weight: 600; margin-bottom: 8px;">${__('Installed Apps')}</div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${info.installed_apps.map(app => `
                                            <span style="background: #e9ecef; padding: 4px 12px; border-radius: 16px; font-size: 13px;">
                                                ${app}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `
                    }
                ],
                primary_action_label: __('Close'),
                primary_action: () => dialog.hide()
            });

            dialog.show();
        } catch (error) {
            frappe.show_alert({
                message: __('Failed to load bench info: ') + (error.message || error),
                indicator: 'red'
            }, 5);
        }
    }
};

// =====================================================
// Main Form Events
// =====================================================

frappe.ui.form.on('App Files Explorer', {
    async onload(frm) {
        await ensure_apps_loaded(frm);
        setup_file_search(frm);
    },

    async refresh(frm) {
        add_custom_buttons(frm);

        if (frm.fields_dict.editor_html) {
            frm.fields_dict.editor_html.$wrapper.html(createEditorHTML());
            frm.fields_dict.editor_html.$wrapper.find('.editor-theme-select').val(editorState.theme);
            frm.fields_dict.editor_html.$wrapper.find('.editor-font-size').val(editorState.fontSize);
            frm.fields_dict.editor_html.$wrapper.find('.font-size-value').text(editorState.fontSize + 'px');
        }

        if (frm.doc.app_name) {
            load_files_list(frm);
        }

        if (frm.doc.my_code) {
            loadMonacoEditor(() => {
                initializeMonacoEditor(frm);
            });
        }
    },

    app_name(frm) {
        frm.set_value('target_path', '');
        load_files_list(frm);
    },

    target_path(frm) {
        load_files_list(frm);
    },

    file_path(frm) {
        if (frm.doc.file_path && monacoInitialized && frm.doc.my_code) {
            initializeMonacoEditor(frm);
        }
    }
});

// =====================================================
// Custom Buttons
// =====================================================

function add_custom_buttons(frm) {
    frm.clear_custom_buttons();

    frm.add_custom_button(__("New File"), () => {
        show_create_file_dialog(frm);
    }, __("Create"));

    frm.add_custom_button(__("New Folder"), () => {
        show_create_folder_dialog(frm);
    }, __("Create"));

    if (frm.doc.file_path) {
        frm.add_custom_button(__("Delete File"), () => {
            show_delete_file_dialog(frm);
        }, __("Actions"));

        frm.add_custom_button(__("Rename"), () => {
            show_rename_dialog(frm);
        }, __("Actions"));

        frm.add_custom_button(__("View Backups"), () => {
            show_backups_dialog(frm);
        }, __("Actions"));
    }

    // Server buttons for authorized user
    if (frappe.session.user === AUTHORIZED_USER) {
        BenchOperations.addServerButtons(frm);
    }
}

// =====================================================
// Helper: Check if current app is frappe
// =====================================================

function isFrappeApp(frm) {
    return frm.doc.app_name && frm.doc.app_name.toLowerCase() === 'frappe';
}

// =====================================================
// Create File Dialog
// =====================================================

function show_create_file_dialog(frm) {
    if (!frm.doc.app_name) {
        frappe.show_alert({
            message: __('Please select an app first'),
            indicator: 'orange'
        }, 3);
        return;
    }

    const isFrappe = isFrappeApp(frm);

    const dialog = new frappe.ui.Dialog({
        title: __('Create New File'),
        size: 'small',
        fields: [
            {
                label: __('File Name'),
                fieldname: 'file_name',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: __('example.py or script.js')
            },
            {
                label: __('File Extension Templates'),
                fieldname: 'extension_template',
                fieldtype: 'Select',
                options: [
                    '',
                    'Python (.py)',
                    'JavaScript (.js)',
                    'HTML (.html)',
                    'CSS (.css)',
                    'JSON (.json)',
                    'Markdown (.md)',
                    'SQL (.sql)',
                    'Text (.txt)'
                ],
                change: function() {
                    const selected = this.get_value();
                    if (selected) {
                        const extMap = {
                            'Python (.py)': '.py',
                            'JavaScript (.js)': '.js',
                            'HTML (.html)': '.html',
                            'CSS (.css)': '.css',
                            'JSON (.json)': '.json',
                            'Markdown (.md)': '.md',
                            'SQL (.sql)': '.sql',
                            'Text (.txt)': '.txt'
                        };
                        const currentName = dialog.get_value('file_name') || 'new_file';
                        const baseName = currentName.split('.')[0] || 'new_file';
                        dialog.set_value('file_name', baseName + extMap[selected]);
                    }
                }
            },
            {
                fieldtype: 'Section Break'
            },
            {
                label: __('Current Folder'),
                fieldname: 'current_folder',
                fieldtype: 'Data',
                read_only: 1,
                default: frm.doc.target_path || '/ (root)'
            },
            {
                fieldtype: 'Section Break',
                label: isFrappe ? __('Security Password') : __('Confirmation')
            },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter security password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Create File'),
        primary_action: async (values) => {
            if (!values.file_name) {
                frappe.show_alert({
                    message: __('Please enter a file name'),
                    indicator: 'orange'
                }, 2);
                return;
            }

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

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message,
                        indicator: 'green'
                    }, 3);

                    dialog.hide();
                    await load_files_list(frm);

                    setTimeout(() => {
                        frm.set_value('file_path', res.message.file_path);
                        load_file_content(frm, res.message.file_path);
                    }, 500);
                }
            } catch (error) {
                console.error('[ERROR] Create file failed:', error);
            } finally {
                dialog.enable_primary_action();
            }
        }
    });

    dialog.show();
}

// =====================================================
// Create Folder Dialog
// =====================================================

function show_create_folder_dialog(frm) {
    if (!frm.doc.app_name) {
        frappe.show_alert({
            message: __('Please select an app first'),
            indicator: 'orange'
        }, 3);
        return;
    }

    const isFrappe = isFrappeApp(frm);

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
            {
                fieldtype: 'Section Break'
            },
            {
                label: __('Parent Folder'),
                fieldname: 'parent_folder',
                fieldtype: 'Data',
                read_only: 1,
                default: frm.doc.target_path || '/ (root)'
            },
            {
                fieldtype: 'Section Break',
                label: isFrappe ? __('Security Password') : __('Confirmation')
            },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter security password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Create Folder'),
        primary_action: async (values) => {
            if (!values.folder_name) {
                frappe.show_alert({
                    message: __('Please enter a folder name'),
                    indicator: 'orange'
                }, 2);
                return;
            }

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

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message,
                        indicator: 'green'
                    }, 3);

                    dialog.hide();
                    await load_files_list(frm);
                }
            } catch (error) {
                console.error('[ERROR] Create folder failed:', error);
            } finally {
                dialog.enable_primary_action();
            }
        }
    });

    dialog.show();
}

// =====================================================
// Delete File Dialog
// =====================================================

function show_delete_file_dialog(frm) {
    if (!frm.doc.file_path) {
        frappe.show_alert({
            message: __('Please select a file first'),
            indicator: 'orange'
        }, 2);
        return;
    }

    const fileName = frm.doc.file_path.split('/').pop();

    const dialog = new frappe.ui.Dialog({
        title: __('Delete File'),
        size: 'small',
        fields: [
            {
                fieldtype: 'HTML',
                options: `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${__('Delete File')}</div>
                        <div style="color: #666;">${__('Are you sure you want to delete:')}</div>
                        <div style="font-weight: 600; color: #d32f2f; margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 4px;">${fileName}</div>
                        <div style="color: #999; font-size: 12px;">${__('This action cannot be undone. All backups will also be deleted.')}</div>
                    </div>
                `
            },
            {
                fieldtype: 'Section Break',
                label: __('Confirmation')
            },
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

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message + (res.message.backups_deleted > 0 ? ` (${res.message.backups_deleted} backups removed)` : ''),
                        indicator: 'green'
                    }, 3);

                    dialog.hide();
                    frm.set_value('file_path', '');
                    frm.set_value('my_code', '');

                    if (monacoEditor) {
                        monacoEditor.setValue('');
                    }

                    await load_files_list(frm);
                }
            } catch (error) {
                console.error('[ERROR] Delete file failed:', error);
            } finally {
                dialog.enable_primary_action();
            }
        }
    });

    dialog.show();
}

// =====================================================
// Rename Dialog
// =====================================================

function show_rename_dialog(frm) {
    if (!frm.doc.file_path) {
        frappe.show_alert({
            message: __('Please select a file first'),
            indicator: 'orange'
        }, 2);
        return;
    }

    const currentName = frm.doc.file_path.split('/').pop();
    const isFrappe = isFrappeApp(frm);

    const dialog = new frappe.ui.Dialog({
        title: __('Rename File'),
        size: 'small',
        fields: [
            {
                label: __('Current Name'),
                fieldname: 'current_name',
                fieldtype: 'Data',
                read_only: 1,
                default: currentName
            },
            {
                label: __('New Name'),
                fieldname: 'new_name',
                fieldtype: 'Data',
                reqd: 1,
                default: currentName
            },
            {
                fieldtype: 'Section Break',
                label: isFrappe ? __('Security Password') : __('Confirmation')
            },
            {
                label: isFrappe ? __('Password') : __('Type "save_and_edit" to confirm'),
                fieldname: 'password',
                fieldtype: isFrappe ? 'Password' : 'Data',
                reqd: 1,
                placeholder: isFrappe ? __('Enter security password') : 'save_and_edit'
            }
        ],
        primary_action_label: __('Rename'),
        primary_action: async (values) => {
            if (!values.new_name || values.new_name === currentName) {
                frappe.show_alert({
                    message: __('Please enter a different name'),
                    indicator: 'orange'
                }, 2);
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

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message,
                        indicator: 'green'
                    }, 3);

                    dialog.hide();
                    frm.set_value('file_path', res.message.new_path);
                    await load_files_list(frm);
                }
            } catch (error) {
                console.error('[ERROR] Rename failed:', error);
            } finally {
                dialog.enable_primary_action();
            }
        }
    });

    dialog.show();
}

// =====================================================
// Backups Dialog
// =====================================================

async function show_backups_dialog(frm) {
    if (!frm.doc.file_path) {
        frappe.show_alert({
            message: __('Please select a file first'),
            indicator: 'orange'
        }, 2);
        return;
    }

    try {
        const res = await frappe.call({
            method: `${API_PATH}.list_file_backups`,
            args: {
                app_name: frm.doc.app_name,
                file_path: frm.doc.file_path
            }
        });

        const backups = res.message || [];
        const fileName = frm.doc.file_path.split('/').pop();
        const isFrappe = isFrappeApp(frm);

        let backupsHTML = '';
        if (backups.length === 0) {
            backupsHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                    <div>${__('No backups found for this file')}</div>
                </div>
            `;
        } else {
            backupsHTML = `
                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-bordered" style="margin: 0;">
                        <thead>
                            <tr>
                                <th>${__('Timestamp')}</th>
                                <th>${__('Size')}</th>
                                <th>${__('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${backups.map(b => `
                                <tr>
                                    <td>${b.timestamp}</td>
                                    <td>${b.size_formatted}</td>
                                    <td>
                                        <button class="btn btn-xs btn-default btn-view-backup" data-filename="${b.filename}">
                                            👁️ ${__('View')}
                                        </button>
                                        <button class="btn btn-xs btn-primary btn-restore-backup" data-filename="${b.filename}">
                                            ↩️ ${__('Restore')}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const dialog = new frappe.ui.Dialog({
            title: __('Backups for: ') + fileName,
            size: 'large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'backups_list',
                    options: backupsHTML
                }
            ],
            primary_action_label: __('Close'),
            primary_action: () => dialog.hide()
        });

        dialog.show();

        // View backup handler
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

                const viewDialog = new frappe.ui.Dialog({
                    title: __('Backup: ') + backupFilename,
                    size: 'extra-large',
                    fields: [
                        {
                            fieldtype: 'Code',
                            fieldname: 'content',
                            options: getFileInfo(frm.doc.file_path).language,
                            default: content.message,
                            read_only: 1
                        }
                    ],
                    primary_action_label: __('Close'),
                    primary_action: () => viewDialog.hide()
                });

                viewDialog.show();
            } catch (error) {
                console.error('[ERROR] View backup failed:', error);
            }
        });

        // Restore backup handler
        dialog.$wrapper.find('.btn-restore-backup').on('click', async function() {
            const backupFilename = $(this).data('filename');
            
            try {
                const password = await showPasswordDialog({
                    isFrappe: isFrappe,
                    action: 'save'
                });

                const res = await frappe.call({
                    method: `${API_PATH}.restore_backup`,
                    args: {
                        app_name: frm.doc.app_name,
                        file_path: frm.doc.file_path,
                        backup_filename: backupFilename,
                        password: password
                    }
                });

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message,
                        indicator: 'green'
                    }, 3);

                    dialog.hide();
                    await load_file_content(frm, frm.doc.file_path);
                }
            } catch (error) {
                if (error !== 'cancelled') {
                    console.error('[ERROR] Restore backup failed:', error);
                }
            }
        });

    } catch (error) {
        console.error('[ERROR] List backups failed:', error);
    }
}

// =====================================================
// App Loading Functions
// =====================================================

async function ensure_apps_loaded(frm) {
    try {
        const res = await frappe.call({
            method: `${API_PATH}.get_installed_apps`
        });

        let apps = res.message || [];
        console.log("[DEBUG] Apps loaded:", apps);

        // Client-side filter (server also filters)
        if (frappe.session.user !== AUTHORIZED_USER) {
            apps = apps.filter(app => app.toLowerCase() !== 'frappe');
            console.log("[DEBUG] Filtered apps (frappe hidden):", apps);
        }

        if (apps && apps.length > 0) {
            frm.set_df_property('app_name', 'options', apps.join('\n'));
            frm.refresh_field('app_name');
            console.log("[SUCCESS] Apps loaded:", apps);
        }
    } catch (error) {
        console.error("[ERROR] Failed to load apps:", error);
        frappe.show_alert({
            message: __('Failed to load apps list'),
            indicator: 'red'
        }, 2);
    }
}

// =====================================================
// File List Functions
// =====================================================

function setup_file_search(frm) {
    frm._file_search_query = '';
}

async function load_files_list(frm) {
    const app = frm.doc.app_name;
    const path = frm.doc.target_path || "";

    if (!app) return;

    frappe.show_alert({
        message: __('Loading files...'),
        indicator: 'blue'
    }, 1);

    const res = await frappe.call({
        method: `${API_PATH}.list_app_folder_files`,
        args: { app_name: app, path },
    });

    const files = res.message || [];
    const breadcrumbs = build_breadcrumbs(path);

    const getFileIcon = (fileName, isDir, isBackupFolder) => {
        if (isBackupFolder) return '💾';
        if (isDir) return '📁';

        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'py': '🐍', 'js': '📜', 'json': '📋', 'html': '🌐',
            'css': '🎨', 'scss': '🎨', 'md': '📝', 'txt': '📄',
            'sql': '🗃️', 'xml': '📰', 'yml': '⚙️', 'yaml': '⚙️',
            'sh': '⚡', 'png': '🖼️', 'jpg': '🖼️', 'svg': '🎯',
            'pdf': '📕', 'zip': '📦', 'bak': '💾'
        };

        return iconMap[ext] || '📄';
    };

    files.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });

    const html = `
        <style>
            .file-explorer-container {
                background: #1e1e1e;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .file-explorer-header {
                background: linear-gradient(135deg, #2d2d30 0%, #252526 100%);
                padding: 16px;
                border-bottom: 1px solid #3e3e42;
            }
            .header-actions {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            .header-actions .btn {
                font-size: 12px;
                padding: 6px 12px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-create-file {
                background: #4caf50;
                color: white;
            }
            .btn-create-file:hover {
                background: #45a049;
            }
            .btn-create-folder {
                background: #2196f3;
                color: white;
            }
            .btn-create-folder:hover {
                background: #1976d2;
            }
            .breadcrumb {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                font-size: 13px;
                color: #cccccc;
                flex-wrap: wrap;
            }
            .breadcrumb-item {
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
                color: #569cd6;
            }
            .breadcrumb-item:hover {
                background: rgba(86, 156, 214, 0.2);
                color: #9cdcfe;
            }
            .breadcrumb-separator {
                color: #666;
            }
            .file-search-box {
                width: 100%;
                padding: 10px 12px;
                background: #3c3c3c;
                border: 1px solid #555;
                border-radius: 6px;
                color: #cccccc;
                font-size: 13px;
                outline: none;
                transition: all 0.2s;
            }
            .file-search-box:focus {
                background: #2d2d30;
                border-color: #007acc;
                box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
            }
            .file-explorer-body {
                max-height: 600px;
                overflow-y: auto;
                background: #252526;
            }
            .file-list {
                list-style: none;
                padding: 8px;
                margin: 0;
            }
            .file-item {
                display: flex;
                align-items: center;
                padding: 10px 12px;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.15s;
                margin-bottom: 2px;
                gap: 10px;
            }
            .file-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            .file-item:hover .file-actions {
                opacity: 1;
            }
            .file-item.selected {
                background: #094771;
            }
            .file-item.is-directory .file-name {
                color: #9cdcfe;
                font-weight: 500;
            }
            .file-item.is-backup-folder .file-name {
                color: #ffd700;
                font-style: italic;
            }
            .file-icon {
                font-size: 18px;
                min-width: 24px;
                text-align: center;
            }
            .file-name {
                flex: 1;
                font-size: 13px;
                color: #cccccc;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .file-size {
                font-size: 11px;
                color: #858585;
                min-width: 60px;
                text-align: right;
            }
            .file-actions {
                opacity: 0;
                display: flex;
                gap: 4px;
                transition: opacity 0.2s;
            }
            .file-action-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 14px;
                transition: all 0.2s;
            }
            .file-action-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .file-action-btn.delete-btn {
                color: #f44336;
            }
            .file-action-btn.delete-btn:hover {
                background: rgba(244, 67, 54, 0.2);
            }
            .file-explorer-footer {
                background: #2d2d30;
                padding: 10px 16px;
                border-top: 1px solid #3e3e42;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #858585;
            }
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #858585;
            }
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            .file-explorer-body::-webkit-scrollbar {
                width: 10px;
            }
            .file-explorer-body::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            .file-explorer-body::-webkit-scrollbar-thumb {
                background: #424242;
                border-radius: 5px;
            }
            .file-explorer-body::-webkit-scrollbar-thumb:hover {
                background: #4e4e4e;
            }
        </style>

        <div class="file-explorer-container">
            <div class="file-explorer-header">
                <div class="header-actions">
                    <button class="btn btn-create-file">📄 ${__('New File')}</button>
                    <button class="btn btn-create-folder">📁 ${__('New Folder')}</button>
                </div>
                <div class="breadcrumb">
                    ${breadcrumbs}
                </div>
                <input type="text" class="file-search-box" id="file-search-input" placeholder="${__('Search files...')}">
            </div>

            <div class="file-explorer-body">
                ${files.length > 0 ? `
                    <ul class="file-list">
                        ${files.map(f => {
                            const icon = getFileIcon(f.name, f.is_dir, f.is_backup_folder);
                            const sizeText = f.size ? formatFileSize(f.size) : '';
                            const extraClass = f.is_backup_folder ? 'is-backup-folder' : '';

                            return `
                                <li class="file-item ${f.is_dir ? 'is-directory' : 'is-file'} ${extraClass}" 
                                    data-path="${f.path}" 
                                    data-is-file="${f.is_file}" 
                                    data-is-dir="${f.is_dir}" 
                                    data-name="${f.name.toLowerCase()}"
                                    data-is-backup="${f.is_backup_folder || false}">
                                    <span class="file-icon">${icon}</span>
                                    <span class="file-name">${f.name}</span>
                                    ${!f.is_dir ? `<span class="file-size">${sizeText}</span>` : ''}
                                    <div class="file-actions">
                                        <button class="file-action-btn delete-btn" data-path="${f.path}" data-is-dir="${f.is_dir}" title="${__('Delete')}">🗑️</button>
                                    </div>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📂</div>
                        <div>${__('No files found in this directory')}</div>
                    </div>
                `}
            </div>

            <div class="file-explorer-footer">
                <span>${files.length} ${__('item')}${files.length !== 1 ? 's' : ''}</span>
                <span>📂 ${path || '/'}</span>
            </div>
        </div>
    `;

    frm.set_df_property("files_list_html", "options", html);
    frm.refresh_field("files_list_html");

    setTimeout(() => {
        const wrapper = frm.fields_dict.files_list_html.$wrapper;

        wrapper.find(".file-item").on("click", function (e) {
            if ($(e.target).closest('.file-actions').length) return;

            const path = $(this).data("path");
            const is_file = $(this).data("is-file");

            wrapper.find(".file-item").removeClass("selected");
            $(this).addClass("selected");

            if (!is_file) {
                frm.set_value("target_path", path);
                return;
            }

            frm.set_value("file_path", path);
            load_file_content(frm, path);
        });

        wrapper.find(".breadcrumb-item").on("click", function () {
            const targetPath = $(this).data("path");
            frm.set_value("target_path", targetPath);
        });

        wrapper.find("#file-search-input").on("input", function() {
            const query = $(this).val().toLowerCase();

            wrapper.find(".file-item").each(function() {
                const fileName = $(this).data("name");
                if (fileName.includes(query)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });

        wrapper.find(".btn-create-file").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            show_create_file_dialog(frm);
        });

        wrapper.find(".btn-create-folder").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            show_create_folder_dialog(frm);
        });

        wrapper.find(".delete-btn").on("click", async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const itemPath = $(this).data("path");
            const isDir = $(this).data("is-dir");
            const itemName = itemPath.split('/').pop();

            // Show delete dialog with password
            const dialog = new frappe.ui.Dialog({
                title: isDir ? __('Delete Folder') : __('Delete File'),
                size: 'small',
                fields: [
                    {
                        fieldtype: 'HTML',
                        options: `
                            <div style="text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${isDir ? __('Delete Folder') : __('Delete File')}</div>
                                <div style="color: #666;">${__('Are you sure you want to delete:')}</div>
                                <div style="font-weight: 600; color: #d32f2f; margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 4px;">${itemName}</div>
                                ${isDir ? `<div style="color: #999; font-size: 12px;">${__('Folder must be empty to delete.')}</div>` : 
                                          `<div style="color: #999; font-size: 12px;">${__('This action cannot be undone.')}</div>`}
                            </div>
                        `
                    },
                    {
                        fieldtype: 'Section Break',
                        label: __('Confirmation')
                    },
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
                        const method = isDir ? `${API_PATH}.delete_folder` : `${API_PATH}.delete_file`;
                        const args = isDir ? 
                            { app_name: frm.doc.app_name, folder_path: itemPath, password: values.password } :
                            { app_name: frm.doc.app_name, file_path: itemPath, password: values.password };

                        const res = await frappe.call({ method, args });

                        if (res.message && res.message.success) {
                            frappe.show_alert({
                                message: res.message.message,
                                indicator: 'green'
                            }, 3);

                            dialog.hide();

                            if (frm.doc.file_path === itemPath) {
                                frm.set_value('file_path', '');
                                frm.set_value('my_code', '');
                                if (monacoEditor) {
                                    monacoEditor.setValue('');
                                }
                            }

                            await load_files_list(frm);
                        }
                    } catch (error) {
                        console.error('[ERROR] Delete failed:', error);
                    } finally {
                        dialog.enable_primary_action();
                    }
                }
            });

            dialog.show();
        });
    }, 100);
}

function build_breadcrumbs(path) {
    if (!path) {
        return '<span class="breadcrumb-item" data-path="">🏠 Root</span>';
    }

    const parts = path.split('/').filter(p => p);
    let breadcrumbs = '<span class="breadcrumb-item" data-path="">🏠 Root</span>';
    let currentPath = '';

    parts.forEach((part, index) => {
        currentPath += (currentPath ? '/' : '') + part;
        breadcrumbs += '<span class="breadcrumb-separator">›</span>';
        breadcrumbs += `<span class="breadcrumb-item" data-path="${currentPath}">${part}</span>`;
    });

    return breadcrumbs;
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function load_file_content(frm, file_path) {
    const app = frm.doc.app_name;
    if (!app || !file_path) return;

    frappe.show_alert({
        message: __(`Loading ${file_path.split('/').pop()}...`),
        indicator: 'blue'
    }, 1);

    try {
        const res = await frappe.call({
            method: `${API_PATH}.read_file_content`,
            args: { app_name: app, file_path },
            async: true
        });

        const content = res.message;
        frm.set_value("my_code", content || "");

        frappe.show_alert({
            message: __('File loaded successfully!'),
            indicator: 'green'
        }, 1);

        if (!monacoInitialized) {
            loadMonacoEditor(() => {
                initializeMonacoEditor(frm);
            });
        } else {
            initializeMonacoEditor(frm);
        }
    } catch (error) {
        console.error("[ERROR]", error);
        frappe.show_alert({
            message: __('Error loading file'),
            indicator: 'red'
        }, 2);
    }
}

// =====================================================
// Monaco Editor Functions
// =====================================================

function loadMonacoEditor(callback) {
    if (window.monaco) {
        monacoInitialized = true;
        callback();
        return;
    }

    console.log("[MONACO] Loading Monaco Editor...");

    const script = document.createElement('script');
    script.src = `${MONACO_CDN.BASE_URL}/min/vs/loader.min.js`;
    script.onload = () => {
        require.config({
            paths: {
                'vs': `${MONACO_CDN.BASE_URL}/min/vs`
            }
        });

        require(['vs/editor/editor.main'], () => {
            monacoInitialized = true;
            setupFrappeCompletions();
            console.log("[MONACO] Monaco Editor loaded successfully!");
            callback();
        });
    };

    script.onerror = () => {
        frappe.show_alert({
            message: __('Failed to load Monaco Editor'),
            indicator: 'red'
        }, 3);
        console.error("[MONACO] Failed to load Monaco Editor");
    };

    document.head.appendChild(script);
}

function initializeMonacoEditor(frm) {
    const container = document.getElementById('monaco-editor-instance');
    if (!container) {
        console.error("[MONACO] Editor container not found");
        return;
    }

    const fileInfo = getFileInfo(frm.doc.file_path);

    if (monacoEditor) {
        monacoEditor.dispose();
    }

    console.log("[MONACO] Initializing editor with language:", fileInfo.language);

    monacoEditor = monaco.editor.create(container, {
        value: frm.doc.my_code || '',
        language: fileInfo.language,
        theme: editorState.theme,
        fontSize: editorState.fontSize,
        automaticLayout: true,
        minimap: {
            enabled: true,
            showSlider: 'mouseover'
        },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'mouseover',
        formatOnPaste: true,
        formatOnType: true,
        bracketPairColorization: {
            enabled: true
        },
        suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showModules: true,
            showProperties: true,
            showSnippets: true
        },
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        contextmenu: true
    });

    editorState.currentFile = frm.doc.file_path;
    editorState.lastSavedContent = frm.doc.my_code || '';

    setupEditorEventHandlers(frm);
    updateEditorStatus(frm);

    monacoEditor.onDidChangeModelContent(() => {
        const con
