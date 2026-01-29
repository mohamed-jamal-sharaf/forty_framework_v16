// =====================================================
// Enhanced App Files Explorer with Monaco Editor
// Complete Version with Bench Operations
// =====================================================

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
    AUTOSAVE_DELAY: 2000
};

// =====================================================
// Bench Operations Module
// =====================================================

const BenchOperations = {
    currentOperationId: null,
    progressInterval: null,
    progressDialog: null,

    // Add Server Operation Buttons
    addServerButtons(frm) {
        // 🔄 Restart Bench (Simple)
        frm.add_custom_button(__("🔄 Restart"), () => {
            this.showRestartDialog();
        }, __("Server"));

        // 🔄 Restart with Sudo
        frm.add_custom_button(__("🔄 Restart (Sudo)"), () => {
            this.showSudoRestartDialog();
        }, __("Server"));

        // 🗃 Migrate
        frm.add_custom_button(__("🗃 Migrate"), () => {
            this.showMigrateDialog();
        }, __("Server"));

        // 🔨 Build Assets
        frm.add_custom_button(__("🔨 Build"), () => {
            this.showBuildDialog();
        }, __("Server"));

        // 🧹 Clear Cache
        frm.add_custom_button(__("🧹 Clear Cache"), () => {
            this.runClearCache();
        }, __("Server"));

        // ℹ️ Bench Info
        frm.add_custom_button(__("ℹ️ Bench Info"), () => {
            this.showBenchInfo();
        }, __("Server"));
    },

    // Simple Restart Dialog
    showRestartDialog() {
        frappe.confirm(
            `<div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${__('Restart Bench')}</div>
                <div style="color: #666; margin-bottom: 16px;">${__('This will restart the web server and workers.')}</div>
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px; color: #856404;">
                    ⚠️ ${__('The page may become temporarily unavailable.')}
                </div>
            </div>`,
            async () => {
                await this.executeRestart();
            },
            __('Cancel')
        );
    },

    // Sudo Restart Dialog (with password)
    showSudoRestartDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('🔄 Restart Bench with Sudo'),
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
                },
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="background: #fff3cd; padding: 12px; border-radius: 8px; color: #856404; margin-top: 16px; font-size: 12px;">
                            ⚠️ <strong>${__('Warning:')}</strong> ${__('This will fully restart all bench processes. The site may be unavailable for a few seconds.')}
                        </div>
                    `
                }
            ],
            primary_action_label: __('🔄 Restart Now'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeRestartWithSudo(values.sudo_password);
            }
        });
        dialog.show();
    },

    // Migrate Dialog
    showMigrateDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('🗃 Run Bench Migrate'),
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
                    placeholder: __('Enter sudo password for frappe user'),
                    description: __('Required to run bench migrate as frappe user')
                },
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="background: #fff3cd; padding: 12px; border-radius: 8px; color: #856404; margin-top: 16px; font-size: 12px;">
                            ⚠️ <strong>${__('Note:')}</strong> ${__('Migration may take several minutes. Do not close this dialog.')}
                        </div>
                    `
                }
            ],
            primary_action_label: __('🗃 Start Migration'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeMigrate(values.sudo_password);
            }
        });
        dialog.show();
    },

    // Build Dialog
    showBuildDialog() {
        const dialog = new frappe.ui.Dialog({
            title: __('🔨 Build Assets'),
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
            primary_action_label: __('🔨 Start Build'),
            primary_action: async (values) => {
                dialog.hide();
                await this.executeBuild(values.sudo_password, values.app);
            }
        });
        dialog.show();
    },

    // Execute Operations
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

    // Progress Dialog
    showProgressDialog(operation, operationId, autoRefreshOnComplete = false) {
        const self = this;
        self.currentOperationId = operationId;

        const operationTitles = {
            'restart': __('🔄 Restarting Bench'),
            'migrate': __('🗃 Running Migration'),
            'build': __('🔨 Building Assets'),
            'clear_cache': __('🧹 Clearing Cache')
        };

        const operationIcons = {
            'restart': '🔄',
            'migrate': '🗃',
            'build': '🔨',
            'clear_cache': '🧹'
        };

        self.progressDialog = new frappe.ui.Dialog({
            title: operationTitles[operation] || __('Operation in Progress'),
            size: 'large',
            static: true,
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'progress_content',
                    options: self.getProgressHTML(operationIcons[operation] || '⚙️', 0, __('Starting...'))
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

        // Disable close button initially
        self.progressDialog.$wrapper.find('.btn-primary').prop('disabled', true);
        self.progressDialog.show();

        // Start polling for progress
        self.startProgressPolling(operationId, autoRefreshOnComplete);
    },

    getProgressHTML(icon, progress, message, logs = []) {
        const logsHTML = logs.map(log => `
            <div style="padding: 4px 8px; border-bottom: 1px solid #333; font-size: 12px;">
                <span style="color: #888; margin-right: 8px;">${log.time ? log.time.split(' ')[1] : ''}</span>
                <span>${log.message}</span>
            </div>
        `).join('');

        return `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;" class="progress-icon">
                    ${icon}
                </div>

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

            <style>
                .progress-icon {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .progress-logs::-webkit-scrollbar {
                    width: 8px;
                }
                .progress-logs::-webkit-scrollbar-track {
                    background: #2d2d2d;
                }
                .progress-logs::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 4px;
                }
            </style>
        `;
    },

    startProgressPolling(operationId, autoRefreshOnComplete) {
        const self = this;

        console.log('[BenchOps] Starting progress polling for:', operationId);

        self.progressInterval = setInterval(async () => {
            try {
                console.log('[BenchOps] Polling progress...');
                const res = await frappe.call({
                    method: 'frappe.api.restart_api.get_operation_progress',
                    args: { operation_id: operationId }
                });

                console.log('[BenchOps] Progress response:', res.message);
                const data = res.message;

                if (data && data.status !== 'not_found') {
                    self.updateProgressDialog(data);

                    if (data.status === 'completed' || data.status === 'error') {
                        self.stopProgressPolling();

                        // Enable close button
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

        // Update progress bar
        wrapper.find('.progress-bar-fill').css('width', data.progress + '%').text(data.progress + '%');

        // Update message
        wrapper.find('.progress-message').text(data.message);

        // Update icon based on status
        let icon = '⚙️';
        if (data.status === 'completed') {
            icon = '✅';
            wrapper.find('.progress-icon').css('animation', 'none');
        } else if (data.status === 'error') {
            icon = '❌';
            wrapper.find('.progress-icon').css('animation', 'none');
            wrapper.find('.progress-bar-fill').css('background', 'linear-gradient(90deg, #f44336, #e91e63)');
        }
        wrapper.find('.progress-icon').text(icon);

        // Update logs
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

    // Bench Info Dialog
    async showBenchInfo() {
        try {
            const res = await frappe.call({
                method: 'frappe.api.restart_api.get_bench_info',
                freeze: true,
                freeze_message: __('Loading bench info...')
            });

            const info = res.message;

            const dialog = new frappe.ui.Dialog({
                title: __('ℹ️ Bench Information'),
                size: 'large',
                fields: [
                    {
                        fieldtype: 'HTML',
                        options: `
                            <div style="padding: 16px;">
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">📁 ${__('Bench Path')}</div>
                                        <div style="font-weight: 600; word-break: break-all;">${info.bench_path}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">🌐 ${__('Site')}</div>
                                        <div style="font-weight: 600;">${info.site}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">🐍 ${__('Python Version')}</div>
                                        <div style="font-weight: 600;">${info.python_version}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">🔧 ${__('Frappe Version')}</div>
                                        <div style="font-weight: 600;">${info.frappe_version}</div>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                                    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">${info.supervisor_running ? '✅' : '❌'}</div>
                                        <div style="font-weight: 600;">Supervisor</div>
                                        <div style="font-size: 12px; color: #666;">${info.supervisor_running ? __('Running') : __('Not Running')}</div>
                                    </div>
                                    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">${info.systemd_setup ? '✅' : '❌'}</div>
                                        <div style="font-weight: 600;">Systemd</div>
                                        <div style="font-size: 12px; color: #666;">${info.systemd_setup ? __('Configured') : __('Not Configured')}</div>
                                    </div>
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <div style="font-weight: 600; margin-bottom: 8px;">📦 ${__('Installed Apps')}</div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${info.installed_apps.map(app => `
                                            <span style="background: #e9ecef; padding: 4px 12px; border-radius: 16px; font-size: 13px;">
                                                ${app}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>

                                ${info.supervisor_status ? `
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 8px;">📊 ${__('Supervisor Status')}</div>
                                        <pre style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; max-height: 200px;">${info.supervisor_status}</pre>
                                    </div>
                                ` : ''}
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
        // Add custom buttons
        add_custom_buttons(frm);

        // Initialize editor HTML
        if (frm.fields_dict.editor_html) {
            frm.fields_dict.editor_html.$wrapper.html(createEditorHTML());

            // Restore preferences
            frm.fields_dict.editor_html.$wrapper.find('.editor-theme-select').val(editorState.theme);
            frm.fields_dict.editor_html.$wrapper.find('.editor-font-size').val(editorState.fontSize);
            frm.fields_dict.editor_html.$wrapper.find('.font-size-value').text(editorState.fontSize + 'px');
        }

        if (frm.doc.app_name) {
            load_files_list(frm);
        }

        // Load Monaco and initialize editor if we have code
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

    // ➕ Create New File Button
    frm.add_custom_button(__("📄 New File"), () => {
        show_create_file_dialog(frm);
    }, __("Create"));

    // 📁 Create New Folder Button
    frm.add_custom_button(__("📁 New Folder"), () => {
        show_create_folder_dialog(frm);
    }, __("Create"));

    // 🗑️ Delete File Button (Administrator only)
    if (frappe.session.user === "Administrator" && frm.doc.file_path) {
        frm.add_custom_button(__("🗑️ Delete File"), () => {
            show_delete_file_dialog(frm);
        }, __("Actions"));
    }

    // ✏️ Rename Button
    if (frm.doc.file_path) {
        frm.add_custom_button(__("✏️ Rename"), () => {
            show_rename_dialog(frm);
        }, __("Actions"));
    }

    // Add Server buttons (Administrator only)
    if (frappe.session.user === "Administrator") {
        BenchOperations.addServerButtons(frm);
    }
}

// =====================================================
// Create File Dialog
// =====================================================

function show_create_file_dialog(frm) {
    if (!frm.doc.app_name) {
        frappe.show_alert({
            message: __('⚠️ Please select an app first'),
            indicator: 'orange'
        }, 3);
        return;
    }

    const dialog = new frappe.ui.Dialog({
        title: __('📄 Create New File'),
        size: 'small',
        fields: [
            {
                label: __('File Name'),
                fieldname: 'file_name',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: __('example.py or script.js'),
                description: __('Enter file name with extension (e.g., my_script.py, style.css)')
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
            }
        ],
        primary_action_label: __('Create File'),
        primary_action: async (values) => {
            if (!values.file_name) {
                frappe.show_alert({
                    message: __('⚠️ Please enter a file name'),
                    indicator: 'orange'
                }, 2);
                return;
            }

            dialog.disable_primary_action();

            try {
                const res = await frappe.call({
                    method: 'frappe.api.app_file_access.create_new_file',
                    args: {
                        app_name: frm.doc.app_name,
                        folder_path: frm.doc.target_path || '',
                        file_name: values.file_name
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
            message: __('⚠️ Please select an app first'),
            indicator: 'orange'
        }, 3);
        return;
    }

    const dialog = new frappe.ui.Dialog({
        title: __('📁 Create New Folder'),
        size: 'small',
        fields: [
            {
                label: __('Folder Name'),
                fieldname: 'folder_name',
                fieldtype: 'Data',
                reqd: 1,
                placeholder: __('my_folder'),
                description: __('Enter folder name (no special characters)')
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
            }
        ],
        primary_action_label: __('Create Folder'),
        primary_action: async (values) => {
            if (!values.folder_name) {
                frappe.show_alert({
                    message: __('⚠️ Please enter a folder name'),
                    indicator: 'orange'
                }, 2);
                return;
            }

            dialog.disable_primary_action();

            try {
                const res = await frappe.call({
                    method: 'frappe.api.app_file_access.create_new_folder',
                    args: {
                        app_name: frm.doc.app_name,
                        parent_path: frm.doc.target_path || '',
                        folder_name: values.folder_name
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
// Delete File Dialog (Administrator Only)
// =====================================================

function show_delete_file_dialog(frm) {
    if (frappe.session.user !== "Administrator") {
        frappe.show_alert({
            message: __('🚫 Access Denied: Only Administrator can delete files'),
            indicator: 'red'
        }, 3);
        return;
    }

    if (!frm.doc.file_path) {
        frappe.show_alert({
            message: __('⚠️ Please select a file first'),
            indicator: 'orange'
        }, 2);
        return;
    }

    const fileName = frm.doc.file_path.split('/').pop();

    frappe.confirm(
        `<div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${__('Delete File')}</div>
            <div style="color: #666;">${__('Are you sure you want to delete:')}</div>
            <div style="font-weight: 600; color: #d32f2f; margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 4px;">${fileName}</div>
            <div style="color: #999; font-size: 12px;">⚠️ ${__('This action cannot be undone. All backups will also be deleted.')}</div>
        </div>`,
        async () => {
            try {
                const res = await frappe.call({
                    method: 'frappe.api.app_file_access.delete_file',
                    args: {
                        app_name: frm.doc.app_name,
                        file_path: frm.doc.file_path
                    }
                });

                if (res.message && res.message.success) {
                    frappe.show_alert({
                        message: res.message.message + (res.message.backups_deleted > 0 ? ` (${res.message.backups_deleted} backups removed)` : ''),
                        indicator: 'green'
                    }, 3);

                    frm.set_value('file_path', '');
                    frm.set_value('my_code', '');

                    if (monacoEditor) {
                        monacoEditor.setValue('');
                    }

                    await load_files_list(frm);
                }
            } catch (error) {
                console.error('[ERROR] Delete file failed:', error);
            }
        },
        __('Cancel')
    );
}

// =====================================================
// Rename Dialog
// =====================================================

function show_rename_dialog(frm) {
    if (!frm.doc.file_path) {
        frappe.show_alert({
            message: __('⚠️ Please select a file first'),
            indicator: 'orange'
        }, 2);
        return;
    }

    const currentName = frm.doc.file_path.split('/').pop();

    const dialog = new frappe.ui.Dialog({
        title: __('✏️ Rename File'),
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
                default: currentName,
                placeholder: __('Enter new name')
            }
        ],
        primary_action_label: __('Rename'),
        primary_action: async (values) => {
            if (!values.new_name || values.new_name === currentName) {
                frappe.show_alert({
                    message: __('⚠️ Please enter a different name'),
                    indicator: 'orange'
                }, 2);
                return;
            }

            dialog.disable_primary_action();

            try {
                const res = await frappe.call({
                    method: 'frappe.api.app_file_access.rename_item',
                    args: {
                        app_name: frm.doc.app_name,
                        old_path: frm.doc.file_path,
                        new_name: values.new_name
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
// App Loading Functions
// =====================================================

async function ensure_apps_loaded(frm) {
    try {
        const res = await frappe.call({
            method: 'frappe.api.app_file_access.get_installed_apps'
        });

        const apps = res.message || [];
        console.log("[DEBUG] Apps loaded:", apps);

        if (apps && apps.length > 0) {
            frm.set_df_property('app_name', 'options', apps.join('\n'));
            frm.refresh_field('app_name');
            console.log("[SUCCESS] Apps loaded:", apps);
        }
    } catch (error) {
        console.error("[ERROR] Failed to load apps:", error);
        frappe.show_alert({
            message: __('❌ Failed to load apps list'),
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
        message: __('📂 Loading files...'),
        indicator: 'blue'
    }, 1);

    const res = await frappe.call({
        method: "frappe.api.app_file_access.list_app_folder_files",
        args: { app_name: app, path },
    });

    const files = res.message || [];
    const breadcrumbs = build_breadcrumbs(path);

    const getFileIcon = (fileName, isDir) => {
        if (isDir) return '📁';

        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'py': '🐍', 'js': '📜', 'json': '📋', 'html': '🌐',
            'css': '🎨', 'scss': '🎨', 'md': '📝', 'txt': '📄',
            'sql': '🗃️', 'xml': '📰', 'yml': '⚙️', 'yaml': '⚙️',
            'sh': '⚡', 'png': '🖼️', 'jpg': '🖼️', 'svg': '🎯',
            'pdf': '📕', 'zip': '📦'
        };

        return iconMap[ext] || '📄';
    };

    files.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });

    const isAdmin = frappe.session.user === "Administrator";

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
                            const icon = getFileIcon(f.name, f.is_dir);
                            const sizeText = f.size ? formatFileSize(f.size) : '';

                            return `
                                <li class="file-item ${f.is_dir ? 'is-directory' : 'is-file'}" data-path="${f.path}" data-is-file="${f.is_file}" data-is-dir="${f.is_dir}" data-name="${f.name.toLowerCase()}">
                                    <span class="file-icon">${icon}</span>
                                    <span class="file-name">${f.name}</span>
                                    ${!f.is_dir ? `<span class="file-size">${sizeText}</span>` : ''}
                                    <div class="file-actions">
                                        ${isAdmin ? `
                                            <button class="file-action-btn delete-btn" data-path="${f.path}" data-is-dir="${f.is_dir}" title="${__('Delete')}">🗑️</button>
                                        ` : ''}
                                    </div>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📂</div>
                        <div>${__('No files found in this directory')}</div>
                        <div style="margin-top: 16px;">
                            <button class="btn btn-create-file" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">📄 ${__('Create First File')}</button>
                        </div>
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

        // File item click handler
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

        // Breadcrumb click handler
        wrapper.find(".breadcrumb-item").on("click", function () {
            const targetPath = $(this).data("path");
            frm.set_value("target_path", targetPath);
        });

        // Search input handler
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

        // Create file button handler
        wrapper.find(".btn-create-file").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            show_create_file_dialog(frm);
        });

        // Create folder button handler
        wrapper.find(".btn-create-folder").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            show_create_folder_dialog(frm);
        });

        // Delete button handler (Administrator only)
        wrapper.find(".delete-btn").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();

            const itemPath = $(this).data("path");
            const isDir = $(this).data("is-dir");
            const itemName = itemPath.split('/').pop();

            if (isDir) {
                frappe.confirm(
                    `<div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${__('Delete Folder')}</div>
                        <div style="color: #666;">${__('Are you sure you want to delete:')}</div>
                        <div style="font-weight: 600; color: #d32f2f; margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 4px;">${itemName}</div>
                        <div style="color: #999; font-size: 12px;">⚠️ ${__('Folder must be empty to delete.')}</div>
                    </div>`,
                    async () => {
                        try {
                            const res = await frappe.call({
                                method: 'frappe.api.app_file_access.delete_folder',
                                args: {
                                    app_name: frm.doc.app_name,
                                    folder_path: itemPath
                                }
                            });

                            if (res.message && res.message.success) {
                                frappe.show_alert({
                                    message: res.message.message,
                                    indicator: 'green'
                                }, 3);
                                await load_files_list(frm);
                            }
                        } catch (error) {
                            console.error('[ERROR] Delete folder failed:', error);
                        }
                    },
                    __('Cancel')
                );
            } else {
                frappe.confirm(
                    `<div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${__('Delete File')}</div>
                        <div style="color: #666;">${__('Are you sure you want to delete:')}</div>
                        <div style="font-weight: 600; color: #d32f2f; margin: 12px 0; padding: 8px; background: #ffebee; border-radius: 4px;">${itemName}</div>
                        <div style="color: #999; font-size: 12px;">⚠️ ${__('This action cannot be undone. All backups will also be deleted.')}</div>
                    </div>`,
                    async () => {
                        try {
                            const res = await frappe.call({
                                method: 'frappe.api.app_file_access.delete_file',
                                args: {
                                    app_name: frm.doc.app_name,
                                    file_path: itemPath
                                }
                            });

                            if (res.message && res.message.success) {
                                frappe.show_alert({
                                    message: res.message.message + (res.message.backups_deleted > 0 ? ` (${res.message.backups_deleted} backups removed)` : ''),
                                    indicator: 'green'
                                }, 3);

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
                            console.error('[ERROR] Delete file failed:', error);
                        }
                    },
                    __('Cancel')
                );
            }
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
        message: __(`📂 Loading ${file_path.split('/').pop()}...`),
        indicator: 'blue'
    }, 1);

    try {
        const res = await frappe.call({
            method: "frappe.api.app_file_access.read_file_content",
            args: { app_name: app, file_path },
            async: true
        });

        const content = res.message;
        frm.set_value("my_code", content || "");

        frappe.show_alert({
            message: __('✅ File loaded successfully!'),
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
            message: __('❌ Error loading file'),
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
            message: __('❌ Failed to load Monaco Editor'),
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
    setupAutoSave(frm);

    monacoEditor.onDidChangeModelContent(() => {
        const content = monacoEditor.getValue();
        frm.doc.my_code = content;
        frm.dirty();
    });

    setupKeyboardShortcuts(frm);

    console.log("[MONACO] Editor initialized successfully");
}

function setupEditorEventHandlers(frm) {
    const wrapper = frm.fields_dict.editor_html.$wrapper;

    wrapper.find('.editor-theme-select').off('change').on('change', function () {
        const theme = $(this).val();
        editorState.theme = theme;
        localStorage.setItem('app_explorer_theme', theme);
        if (monacoEditor) {
            monacoEditor.updateOptions({ theme: theme });
        }
    });

    wrapper.find('.editor-font-size').off('input').on('input', function () {
        const size = parseInt($(this).val());
        editorState.fontSize = size;
        localStorage.setItem('app_explorer_font_size', size);
        if (monacoEditor) {
            monacoEditor.updateOptions({ fontSize: size });
        }
        wrapper.find('.font-size-value').text(size + 'px');
    });

    wrapper.find('.editor-format').off('click').on('click', () => {
        if (monacoEditor) {
            monacoEditor.getAction('editor.action.formatDocument').run();
            frappe.show_alert({ message: __('✨ Document formatted'), indicator: 'green' }, 1);
        }
    });

    wrapper.find('.editor-find').off('click').on('click', () => {
        if (monacoEditor) {
            monacoEditor.getAction('actions.find').run();
        }
    });

    wrapper.find('.editor-command-palette').off('click').on('click', () => {
        if (monacoEditor) {
            monacoEditor.getAction('editor.action.quickCommand').run();
        }
    });

    wrapper.find('.editor-minimap-toggle').off('click').on('click', function () {
        if (monacoEditor) {
            const minimapConfig = monacoEditor.getOptions().get(monaco.editor.EditorOption.minimap);
            const enabled = minimapConfig.enabled !== false;
            monacoEditor.updateOptions({
                minimap: { enabled: !enabled }
            });
            $(this).text(!enabled ? '🗺 Hide Minimap' : '🗺 Show Minimap');
        }
    });

    wrapper.find('.editor-wrap-toggle').off('click').on('click', function () {
        if (monacoEditor) {
            const currentWrap = monacoEditor.getOptions().get(monaco.editor.EditorOption.wordWrap);
            const newWrap = currentWrap === 'on' ? 'off' : 'on';
            monacoEditor.updateOptions({ wordWrap: newWrap });
            $(this).text(newWrap === 'on' ? '↩️ Unwrap' : '↩️ Wrap');
        }
    });

    wrapper.find('.editor-fullscreen-toggle').off('click').on('click', () => {
        toggleFullscreen(frm);
    });
}

function setupKeyboardShortcuts(frm) {
    if (!monacoEditor) return;

    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveFile(frm);
    });

    monacoEditor.addCommand(
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        () => {
            monacoEditor.getAction('editor.action.formatDocument').run();
        }
    );

    monacoEditor.addCommand(monaco.KeyCode.F11, () => {
        toggleFullscreen(frm);
    });
}

function toggleFullscreen(frm) {
    const container = frm.fields_dict.editor_html.$wrapper.find('.monaco-editor-container');
    const fullscreenBtn = container.find('.editor-fullscreen-toggle');

    if (!isFullscreen) {
        container.css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            borderRadius: 0
        });

        fullscreenBtn.html('<i class="fa fa-compress"></i> Exit Fullscreen');
        isFullscreen = true;

        $(document).on('keydown.fullscreen', function (e) {
            if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen(frm);
            }
        });

    } else {
        container.css({
            position: 'relative',
            top: 'auto',
            left: 'auto',
            width: '100%',
            height: EDITOR_CONFIG.DEFAULT_HEIGHT + 'px',
            zIndex: 'auto',
            borderRadius: '4px'
        });

        fullscreenBtn.html('<i class="fa fa-expand"></i> Fullscreen');
        isFullscreen = false;

        $(document).off('keydown.fullscreen');
    }

    if (monacoEditor) {
        setTimeout(() => {
            monacoEditor.layout();
        }, 300);
    }
}

function setupAutoSave(frm) {
    let autoSaveTimeout;

    const autoSave = () => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            if (editorState.isDirty) {
                saveFile(frm, true);
            }
        }, EDITOR_CONFIG.AUTOSAVE_DELAY);
    };

    monacoEditor.onDidChangeModelContent(() => {
        const currentContent = monacoEditor.getValue();
        if (currentContent !== editorState.lastSavedContent) {
            editorState.isDirty = true;
            updateSaveIndicator(frm, true);
            autoSave();
        }
    });
}

function updateEditorStatus(frm) {
    if (!monacoEditor) return;

    const wrapper = frm.fields_dict.editor_html.$wrapper;
    const statusElement = wrapper.find('.editor-status');

    monacoEditor.onDidChangeCursorPosition((e) => {
        const position = e.position;
        const selection = monacoEditor.getSelection();
        const selectedText = monacoEditor.getModel().getValueInRange(selection);

        let statusText = `Ln ${position.lineNumber}, Col ${position.column}`;
        if (selectedText.length > 0) {
            statusText += ` | Sel: ${selectedText.length}`;
        }

        statusElement.text(statusText);
    });
}

function updateSaveIndicator(frm, isDirty) {
    const wrapper = frm.fields_dict.editor_html.$wrapper;
    const indicator = wrapper.find('.save-indicator');

    if (isDirty) {
        indicator.html('● <span style="color: #f0ad4e;">Unsaved</span>');
    } else {
        indicator.html('● <span style="color: #5cb85c;">Saved</span>');
    }
}

async function saveFile(frm, isAutoSave = false) {
    if (!monacoEditor || !frm.doc.app_name || !frm.doc.file_path) {
        frappe.show_alert({
            message: __('⚠️ Missing app name or file path'),
            indicator: 'orange'
        }, 2);
        return;
    }

    const content = monacoEditor.getValue();

    try {
        const response = await frappe.call({
            method: 'frappe.api.app_file_access.write_file_content_with_backup',
            args: {
                app_name: frm.doc.app_name,
                file_path: frm.doc.file_path,
                content: content
            }
        });

        if (response.message) {
            editorState.lastSavedContent = content;
            editorState.isDirty = false;
            updateSaveIndicator(frm, false);

            if (!isAutoSave) {
                frappe.show_alert({
                    message: __('✅ File saved successfully!'),
                    indicator: 'green'
                }, 2);
            }
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        console.error("[ERROR] Save failed:", error);
        frappe.show_alert({
            message: __('❌ Failed to save file'),
            indicator: 'red'
        }, 3);
    }
}

function getFileInfo(filePath) {
    if (!filePath) {
        return { language: 'javascript', icon: '📄' };
    }

    const ext = filePath.split('.').pop().toLowerCase();

    const languageMap = {
        'py': 'python',
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'md': 'markdown',
        'sql': 'sql',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sh': 'shell'
    };

    return {
        language: languageMap[ext] || 'plaintext',
        icon: '📄'
    };
}

function createEditorHTML() {
    return `
    <div class="monaco-editor-container" style="position: relative; width: 100%; height: ${EDITOR_CONFIG.DEFAULT_HEIGHT}px; border: 1px solid #d1d8dd; border-radius: 4px; overflow: hidden; transition: all 0.3s ease;">
        <div class="editor-toolbar" style="background: #f5f7fa; border-bottom: 1px solid #d1d8dd; padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                    <button class="btn btn-xs btn-default editor-format" title="Format Document (Shift+Alt+F)">
                        <i class="fa fa-indent"></i> Format
                    </button>
                    <button class="btn btn-xs btn-default editor-find" title="Find (Ctrl+F)">
                        <i class="fa fa-search"></i> Find
                    </button>
                    <button class="btn btn-xs btn-default editor-command-palette" title="Command Palette (F1)">
                        <i class="fa fa-terminal"></i> Commands
                    </button>
                    <button class="btn btn-xs btn-primary editor-fullscreen-toggle" title="Toggle Fullscreen (F11)">
                        <i class="fa fa-expand"></i> Fullscreen
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-xs btn-default editor-minimap-toggle">🗺 Hide Minimap</button>
                        <button class="btn btn-xs btn-default editor-wrap-toggle">↩️ Unwrap</button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label style="margin: 0; font-size: 11px; color: #666;">Theme:</label>
                        <select class="editor-theme-select" style="height: 24px; font-size: 11px; padding: 2px 6px;">
                            <option value="vs">Light</option>
                            <option value="vs-dark">Dark</option>
                            <option value="hc-black">High Contrast</option>
                        </select>
                    </div>

                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label style="margin: 0; font-size: 11px; color: #666;">Font:</label>
                        <input type="range" class="editor-font-size" min="${EDITOR_CONFIG.MIN_FONT_SIZE}" max="${EDITOR_CONFIG.MAX_FONT_SIZE}" value="${EDITOR_CONFIG.DEFAULT_FONT_SIZE}" style="width: 80px;">
                        <span class="font-size-value" style="font-size: 11px; color: #666; min-width: 35px;">${EDITOR_CONFIG.DEFAULT_FONT_SIZE}px</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="save-indicator" style="font-size: 11px; font-weight: 600;">● Saved</span>
                        <span class="editor-status" style="font-size: 11px; color: #666;">Ln 1, Col 1</span>
                    </div>
                </div>
            </div>
        </div>
        <div id="monaco-editor-instance" style="width: 100%; height: calc(100% - 45px);"></div>
    </div>

    <style>
        .monaco-editor-container {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .monaco-editor-container:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .editor-toolbar button {
            transition: all 0.2s ease;
        }
        .editor-toolbar button:hover {
            transform: translateY(-1px);
        }
        .editor-toolbar .save-indicator {
            transition: color 0.3s ease;
        }
    </style>
    `;
}

function setupFrappeCompletions() {
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions = [
                {
                    label: 'frappe.call',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: `frappe.call({
    method: '\${1:method_path}',
    args: {
        \${2:arg}: \${3:value}
    },
    callback: function(r) {
        if (r.exc) {
            frappe.msgprint(__('Error: {0}', [r.exc]));
            return;
        }
        \${4:// handle response}
    }
});`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Make a server call with error handling',
                    range: range
                },
                {
                    label: 'frappe.msgprint',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'frappe.msgprint(__(\'${1:message}\'));',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Show a message to the user',
                    range: range
                },
                {
                    label: 'frappe.show_alert',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'frappe.show_alert({message: __(\'${1:message}\'), indicator: \'${2:green}\'});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Show an alert notification',
                    range: range
                },
                {
                    label: 'frm.set_value',
                    kind: monaco.languages.CompletionItemKind.Method,
                    insertText: 'frm.set_value(\'${1:fieldname}\', \'${2:value}\');',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Set field value in form',
                    range: range
                },
                {
                    label: 'frappe.ui.form.on',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `frappe.ui.form.on('\${1:DocType}', {
    refresh(frm) {
        \${2:// code here}
    }
});`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Form event handler',
                    range: range
                }
            ];

            return { suggestions: suggestions };
        }
    });

    monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions = [
                {
                    label: '@frappe.whitelist()',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `@frappe.whitelist()
def \${1:function_name}(\${2:args}):
    \${3:pass}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Whitelist a function for API access',
                    range: range
                },
                {
                    label: 'frappe.get_doc',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'frappe.get_doc("${1:doctype}", "${2:name}")',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Get a document from the database',
                    range: range
                },
                {
                    label: 'frappe.throw',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'frappe.throw(_("${1:Error message}"))',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Throw an error',
                    range: range
                }
            ];

            return { suggestions: suggestions };
        }
    });
}