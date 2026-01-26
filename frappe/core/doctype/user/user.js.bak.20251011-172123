frappe.ui.form.on("User", {
	setup: function (frm) {
		frm.set_query("default_workspace", () => {
			return {
				filters: {
					for_user: ["in", [null, frappe.session.user]],
					title: ["!=", "Welcome Workspace"],
				},
			};
		});
	},
	before_load: function (frm) {
		let update_tz_options = function () {
			frm.fields_dict.time_zone.set_data(frappe.all_timezones);
		};

		if (!frappe.all_timezones) {
			frappe.call({
				method: "frappe.core.doctype.user.user.get_timezones",
				callback: function (r) {
					frappe.all_timezones = r.message.timezones;
					update_tz_options();
				},
			});
		} else {
			update_tz_options();
		}
	},

	time_zone: function (frm) {
		if (frm.doc.time_zone && frm.doc.time_zone.startsWith("Etc")) {
			frm.set_df_property(
				"time_zone",
				"description",
				__("Note: Etc timezones have their signs reversed.")
			);
		}
	},

	role_profiles: function (frm) {
		if (frm.doc.role_profiles && frm.doc.role_profiles.length) {
			frm.roles_editor.disable = 1;
			frm.call("populate_role_profile_roles").then(() => {
				frm.roles_editor.show();
			});
		} else {
			frm.roles_editor.disable = 0;
			frm.roles_editor.show();
		}
	},

	module_profile: function (frm) {
		if (frm.doc.module_profile) {
			frappe.call({
				method: "frappe.core.doctype.user.user.get_module_profile",
				args: {
					module_profile: frm.doc.module_profile,
				},
				callback: function (data) {
					frm.set_value("block_modules", []);
					$.each(data.message || [], function (i, v) {
						let d = frm.add_child("block_modules");
						d.module = v.module;
					});
					frm.module_editor && frm.module_editor.show();
				},
			});
		}
	},

	onload: function (frm) {
		frm.can_edit_roles = has_access_to_edit_user();

		if (frm.is_new() && frm.roles_editor) {
			frm.roles_editor.reset();
		}

		if (
			frm.can_edit_roles &&
			!frm.is_new() &&
			["System User", "Website User"].includes(frm.doc.user_type)
		) {
			if (!frm.roles_editor) {
				const role_area = $('<div class="role-editor">').appendTo(
					frm.fields_dict.roles_html.wrapper
				);

				frm.roles_editor = new frappe.RoleEditor(
					role_area,
					frm,
					frm.doc.role_profiles && frm.doc.role_profiles.length ? 1 : 0
				);

				if (frm.doc.user_type == "System User") {
					var module_area = $("<div>").appendTo(frm.fields_dict.modules_html.wrapper);
					frm.module_editor = new frappe.ModuleEditor(frm, module_area);
				}
			} else {
				frm.roles_editor.show();
			}
		}
	},
	refresh: function (frm) {
		let doc = frm.doc;

		frappe.xcall("frappe.apps.get_apps").then((r) => {
			let apps = r?.map((r) => r.name) || [];
			frm.set_df_property("default_app", "options", [" ", ...apps]);
		});

		if (frm.is_new()) {
			frm.set_value("time_zone", frappe.sys_defaults.time_zone);
		}

		if (
			["System User", "Website User"].includes(frm.doc.user_type) &&
			!frm.is_new() &&
			!frm.roles_editor &&
			frm.can_edit_roles
		) {
			frm.reload_doc();
			return;
		}

		frm.toggle_display(["sb1", "sb3", "modules_access"], false);
		frm.trigger("setup_impersonation");

		if (!frm.is_new()) {
			if (has_access_to_edit_user()) {
				frm.add_custom_button(
					__("Set User Permissions"),
					function () {
						frappe.route_options = {
							user: doc.name,
						};
						frappe.set_route("List", "User Permission");
					},
					__("Permissions")
				);

				frm.add_custom_button(
					__("View Permitted Documents"),
					() =>
						frappe.set_route("query-report", "Permitted Documents For User", {
							user: frm.doc.name,
						}),
					__("Permissions")
				);

				frm.add_custom_button(
					__("View Doctype Permissions"),
					() =>
						frappe.set_route("query-report", "User Doctype Permissions", {
							user: frm.doc.name,
						}),
					__("Permissions")
				);

				frm.toggle_display(["sb1", "sb3", "modules_access"], true);
			}

			frm.add_custom_button(
				__("Reset Password"),
				function () {
					frappe.call({
						method: "frappe.core.doctype.user.user.reset_password",
						args: {
							user: frm.doc.name,
						},
					});
				},
				__("Password")
			);

			if (frappe.user.has_role("System Manager")) {
				frappe.db.get_single_value("LDAP Settings", "enabled").then((value) => {
					if (value === 1 && frm.doc.name != "Administrator") {
						frm.add_custom_button(
							__("Reset LDAP Password"),
							function () {
								const d = new frappe.ui.Dialog({
									title: __("Reset LDAP Password"),
									fields: [
										{
											label: __("New Password"),
											fieldtype: "Password",
											fieldname: "new_password",
											reqd: 1,
										},
										{
											label: __("Confirm New Password"),
											fieldtype: "Password",
											fieldname: "confirm_password",
											reqd: 1,
										},
										{
											label: __("Logout All Sessions"),
											fieldtype: "Check",
											fieldname: "logout_sessions",
										},
									],
									primary_action: (values) => {
										d.hide();
										if (values.new_password !== values.confirm_password) {
											frappe.throw(__("Passwords do not match!"));
										}
										frappe.call(
											"frappe.integrations.doctype.ldap_settings.ldap_settings.reset_password",
											{
												user: frm.doc.email,
												password: values.new_password,
												logout: values.logout_sessions,
											}
										);
									},
								});
								d.show();
							},
							__("Password")
						);
					}
				});
			}

			if (
				cint(frappe.boot.sysdefaults.enable_two_factor_auth) &&
				(frappe.session.user == doc.name || frappe.user.has_role("System Manager"))
			) {
				frm.add_custom_button(
					__("Reset OTP Secret"),
					function () {
						frappe.call({
							method: "frappe.twofactor.reset_otp_secret",
							args: {
								user: frm.doc.name,
							},
						});
					},
					__("Password")
				);
			}

			frm.trigger("enabled");

			if (frm.roles_editor && frm.can_edit_roles) {
				frm.roles_editor.disable =
					frm.doc.role_profiles && frm.doc.role_profiles.length ? 1 : 0;
				frm.roles_editor.show();
			}

			frm.module_editor && frm.module_editor.show();

			if (frappe.session.user == doc.name) {
				// update display settings
				if (doc.user_image) {
					frappe.boot.user_info[frappe.session.user].image = frappe.utils.get_file_link(
						doc.user_image
					);
				}
			}
		}
		if (frm.doc.user_emails && frappe.model.can_create("Email Account")) {
			var found = 0;
			for (var i = 0; i < frm.doc.user_emails.length; i++) {
				if (frm.doc.email == frm.doc.user_emails[i].email_id) {
					found = 1;
				}
			}
			if (!found) {
				frm.add_custom_button(__("Create User Email"), function () {
					if (!frm.doc.email) {
						frappe.msgprint(__("Email is mandatory to create User Email"));
						return;
					}
					frm.events.create_user_email(frm);
				});
			}
		}

		if (frappe.route_flags.unsaved === 1) {
			delete frappe.route_flags.unsaved;
			for (let i = 0; i < frm.doc.user_emails.length; i++) {
				frm.doc.user_emails[i].idx = frm.doc.user_emails[i].idx + 1;
			}
			frm.dirty();
		}
		frm.trigger("time_zone");
	},
	validate: function (frm) {
		if (frm.roles_editor) {
			frm.roles_editor.set_roles_in_table();
		}
	},
	enabled: function (frm) {
		var doc = frm.doc;
		if (!frm.is_new() && has_access_to_edit_user()) {
			frm.toggle_display(["sb1", "sb3", "modules_access"], doc.enabled);
			frm.set_df_property("enabled", "read_only", 0);
		}

		if (frm.doc.name !== "Administrator") {
			frm.toggle_enable("email", frm.is_new());
		}
	},
	create_user_email: function (frm) {
		frappe.call({
			method: "frappe.core.doctype.user.user.has_email_account",
			args: {
				email: frm.doc.email,
			},
			callback: function (r) {
				if (!Array.isArray(r.message) || !r.message.length) {
					frappe.route_options = {
						email_id: frm.doc.email,
						awaiting_password: 1,
						enable_incoming: 1,
					};
					frappe.model.with_doctype("Email Account", function (doc) {
						doc = frappe.model.get_new_doc("Email Account");
						frappe.route_flags.linked_user = frm.doc.name;
						frappe.route_flags.delete_user_from_locals = true;
						frappe.set_route("Form", "Email Account", doc.name);
					});
				} else {
					frappe.route_flags.create_user_account = frm.doc.name;
					frappe.set_route("Form", "Email Account", r.message[0]["name"]);
				}
			},
		});
	},
	generate_keys: function (frm) {
		frappe.call({
			method: "frappe.core.doctype.user.user.generate_keys",
			args: {
				user: frm.doc.name,
			},
			callback: function (r) {
				if (r.message) {
					show_api_key_dialog(r.message.api_key, r.message.api_secret);
					frm.reload_doc();
				}
			},
		});
	},
	after_save: function (frm) {
		/**
		 * Checks whether the effective value has changed.
		 *
		 * @param {Array.<string>} - Tuple with new override, previous override,
		 *   and optionally fallback.
		 * @returns {boolean} - Whether the resulting value has effectively changed
		 */
		const has_effectively_changed = ([new_override, prev_override, fallback = undefined]) => {
			const prev_effective = prev_override || fallback;
			const new_effective = new_override || fallback;
			return new_override !== undefined && prev_effective !== new_effective;
		};

		const doc = frm.doc;
		const boot = frappe.boot;
		const attr_tuples = [
			[doc.language, boot.user.language, boot.sysdefaults.language],
			[doc.time_zone, boot.time_zone.user, boot.time_zone.system],
			[doc.desk_theme, boot.user.desk_theme], // No system default.
		];

		if (doc.name === frappe.session.user && attr_tuples.some(has_effectively_changed)) {
			frappe.msgprint(__("Refreshing..."));
			window.location.reload();
		}
	},
	setup_impersonation: function (frm) {
		if (
			frappe.session.user === "Administrator" &&
			frm.doc.name != "Administrator" &&
			!frm.is_new()
		) {
			frm.add_custom_button(__("Impersonate"), () => {
				if (frm.doc.restrict_ip) {
					frappe.msgprint({
						message:
							"There's IP restriction for this user, you can not impersonate as this user.",
						title: "IP restriction is enabled",
					});
					return;
				}
				frappe.prompt(
					[
						{
							fieldname: "reason",
							fieldtype: "Small Text",
							label: "Reason for impersonating",
							description: __("Note: This will be shared with user."),
							reqd: 1,
						},
					],
					(values) => {
						frappe
							.xcall("frappe.core.doctype.user.user.impersonate", {
								user: frm.doc.name,
								reason: values.reason,
							})
							.then(() => window.location.reload());
					},
					__("Impersonate as {0}", [frm.doc.name]),
					__("Confirm")
				);
			});
		}
	},
});

frappe.ui.form.on("User Email", {
	email_account(frm, cdt, cdn) {
		let child_row = locals[cdt][cdn];
		frappe.model.get_value(
			"Email Account",
			child_row.email_account,
			"auth_method",
			(value) => {
				child_row.used_oauth = value.auth_method === "OAuth";
				frm.refresh_field("user_emails", cdn, "used_oauth");
			}
		);
	},
});

function has_access_to_edit_user() {
	return has_common(frappe.user_roles, get_roles_for_editing_user());
}

function get_roles_for_editing_user() {
	return (
		frappe
			.get_meta("User")
			.permissions.filter((perm) => perm.permlevel >= 1 && perm.write)
			.map((perm) => perm.role) || ["System Manager"]
	);
}

function show_api_key_dialog(api_key, api_secret) {
	const dialog = new frappe.ui.Dialog({
		title: __("API Keys"),
		fields: [
			{
				label: __("API Key"),
				fieldname: "api_key",
				fieldtype: "Code",
				read_only: 1,
				default: api_key,
			},
			{
				label: __("API Secret"),
				fieldname: "api_secret",
				fieldtype: "Code",
				read_only: 1,
				default: api_secret,
			},
		],
		size: "small",
		primary_action_label: __("Download"),
		primary_action: () => {
			frappe.tools.downloadify(
				[
					["api_key", "api_secret"],
					[api_key, api_secret],
				],
				"System Manager",
				"frappe_api_keys"
			);

			dialog.hide();
		},
		secondary_action_label: __("Copy token to clipboard"),
		secondary_action: () => {
			const token = `${api_key}:${api_secret}`;
			frappe.utils.copy_to_clipboard(token);
			dialog.hide();
		},
	});

	dialog.show();
	dialog.show_message(
		__("Store the API secret securely. It won't be displayed again."),
		"yellow",
		1
	);
}






















// User Form - Child Table: App List Table
// Populates "app_name" from Module Def and filters "module" by selected app
// Complete client-side solution

frappe.ui.form.on("User", {
	onload_post_render(frm) {
		init_app_list_feature(frm);
	},
	refresh(frm) {
		init_app_list_feature(frm);
	},
	app_list_table_add(frm, cdt, cdn) {
		init_app_list_feature(frm);
		setTimeout(() => {
			update_row_app_field(frm, cdn);
			update_module_filter_for_row(frm, cdn);
		}, 100);
	}
});

// Handle app_name changes in child table
frappe.ui.form.on("App List Table", {
	app_name(frm, cdt, cdn) {
		const row = locals[cdt][cdn];

		console.log("[AppList] App changed to:", row.app_name);

		// Clear module when app changes
		if (row.module) {
			frappe.model.set_value(cdt, cdn, "module", "");
		}

		// Update module filter for this row
		update_module_filter_for_row(frm, cdn);
	}
});

async function init_app_list_feature(frm) {
	console.log("[AppList] Initializing...");

	await frappe.after_ajax();
	await frappe.model.with_doctype("App List Table");
	await frappe.model.with_doctype("Module Def");

	const grid = get_app_list_grid(frm);
	if (!grid) {
		console.warn('[AppList] Child grid "App List Table" not found.');
		return;
	}

	// Validate app_name field exists and is Select
	const app_field_df = frappe.meta.get_docfield("App List Table", "app_name");
	if (!app_field_df) {
		frappe.msgprint(__('Child DocType "App List Table" is missing field "app_name".'));
		return;
	}
	if (app_field_df.fieldtype !== "Select") {
		frappe.msgprint(__('Field "app_name" must be Select type, currently: {0}', [app_field_df.fieldtype]));
		return;
	}

	// Validate module field exists and is Link
	const module_field_df = frappe.meta.get_docfield("App List Table", "module");
	if (!module_field_df) {
		frappe.msgprint(__('Child DocType "App List Table" is missing field "module".'));
		return;
	}
	if (module_field_df.fieldtype !== "Link") {
		frappe.msgprint(__('Field "module" must be Link type, currently: {0}', [module_field_df.fieldtype]));
		return;
	}

	// 1) Fetch all apps from Module Def
	const apps = await get_apps_from_module_def();
	if (!apps.length) {
		console.warn("[AppList] No apps found in Module Def");
		frappe.msgprint(__("No apps found in Module Def. Please check your data."));
		return;
	}

	console.log("[AppList] Found apps from Module Def:", apps);
	const options_str = apps.join("\n");

	// 2) Update app_name field options in all places
	// Update meta
	const meta_df = frappe.meta.get_docfield("App List Table", "app_name");
	if (meta_df) {
		meta_df.options = options_str;
	}

	// Update grid field
	const grid_field = grid.fields_dict?.app_name;
	if (grid_field) {
		grid_field.df.options = options_str;
	}

	// Update via grid method
	grid.update_docfield_property("app_name", "options", options_str);

	// 3) Update all existing rows
	if (frm.doc.app_list_table && frm.doc.app_list_table.length) {
		frm.doc.app_list_table.forEach(row => {
			update_row_app_field(frm, row.name);
		});
	}

	// Update rendered grid rows
	if (grid.grid_rows) {
		grid.grid_rows.forEach(grid_row => {
			const ctrl = grid_row.grid_form?.fields_dict?.app_name;
			if (ctrl) {
				ctrl.df.options = options_str;
				ctrl.refresh();
			}
		});
	}

	// 4) Hook into future row renders
	if (!grid.__app_list_hooked) {
		grid.__app_list_hooked = true;

		grid.on("grid-row-render", (grid_row) => {
			const app_ctrl = grid_row?.grid_form?.fields_dict?.app_name;
			if (app_ctrl) {
				app_ctrl.df.options = options_str;
				app_ctrl.refresh();
			}

			// Setup module filter for newly rendered row
			if (grid_row.doc) {
				update_module_filter_for_row(frm, grid_row.doc.name);
			}
		});
	}

	// 5) Setup module filtering at grid level
	const module_field = grid.get_field("module");
	if (module_field) {
		module_field.get_query = function (doc, cdt, cdn) {
			const row = locals[cdt][cdn];
			console.log("[AppList] Module get_query (grid level), app:", row?.app_name);

			if (row && row.app_name) {
				return {
					filters: {
						app_name: row.app_name
					}
				};
			}
			return {};
		};
		console.log("[AppList] Module filtering setup at grid level");
	}

	// 6) Setup module filter for all existing rows
	if (grid.grid_rows) {
		grid.grid_rows.forEach(grid_row => {
			if (grid_row.doc) {
				update_module_filter_for_row(frm, grid_row.doc.name);
			}
		});
	}

	// 7) Force grid refresh
	frm.refresh_field("app_list_table");

	// Final update after render
	setTimeout(() => {
		if (grid.grid_rows) {
			grid.grid_rows.forEach(grid_row => {
				// Update app options
				const app_ctrl = grid_row.grid_form?.fields_dict?.app_name;
				if (app_ctrl) {
					app_ctrl.df.options = options_str;
					app_ctrl.refresh();
				}

				// Update module filter
				if (grid_row.doc) {
					update_module_filter_for_row(frm, grid_row.doc.name);
				}
			});
		}
	}, 300);

	console.log("[AppList] Initialization complete. Apps loaded:", apps.length);
}

async function get_apps_from_module_def() {
	try {
		console.log("[AppList] Fetching apps from Module Def...");

		// Get all Module Def records
		const response = await frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Module Def',
				fields: ['app_name'],
				filters: {
					app_name: ['!=', '']  // Exclude empty app_name
				},
				limit_page_length: 0  // Get all records
			}
		});

		if (!response.message || !Array.isArray(response.message)) {
			console.error("[AppList] Invalid response from Module Def query");
			return [];
		}

		// Extract unique app names
		const apps = [...new Set(
			response.message
				.map(m => m.app_name)
				.filter(app => app)  // Remove null/undefined
		)].sort((a, b) => a.localeCompare(b));

		console.log("[AppList] Unique apps extracted:", apps);
		return apps;

	} catch (e) {
		console.error("[AppList] Error fetching apps from Module Def:", e);
		frappe.msgprint(__("Error loading apps from Module Def. Check console for details."));
		return [];
	}
}

function update_row_app_field(frm, cdn) {
	const grid = get_app_list_grid(frm);
	if (!grid) return;

	const grid_row = grid.grid_rows_by_docname?.[cdn];
	if (!grid_row || !grid_row.grid_form) return;

	const app_ctrl = grid_row.grid_form.fields_dict?.app_name;
	if (!app_ctrl) return;

	// Get options from meta
	const meta_df = frappe.meta.get_docfield("App List Table", "app_name");
	if (meta_df && meta_df.options) {
		app_ctrl.df.options = meta_df.options;
		app_ctrl.refresh();
		console.log("[AppList] Updated app options for row:", cdn);
	}
}

function update_module_filter_for_row(frm, cdn) {
	const grid = get_app_list_grid(frm);
	if (!grid) return;

	const grid_row = grid.grid_rows_by_docname?.[cdn];
	if (!grid_row || !grid_row.grid_form) return;

	const module_ctrl = grid_row.grid_form.fields_dict?.module;
	if (!module_ctrl) return;

	const row = grid_row.doc;
	const app_name = row?.app_name;

	console.log("[AppList] Setting module filter for row:", cdn, "app:", app_name);

	// Set get_query to filter modules by app_name
	module_ctrl.get_query = function () {
		console.log("[AppList] Module query executed, filtering by app:", app_name);

		if (app_name) {
			return {
				filters: {
					app_name: app_name
				}
			};
		}
		return {};
	};

	// Refresh the field to apply changes
	module_ctrl.refresh();
}

function get_app_list_grid(frm) {
	// Try direct field name
	if (frm.fields_dict?.app_list_table?.grid) {
		return frm.fields_dict.app_list_table.grid;
	}

	// Fallback: search by child doctype
	const table_fields = (frm.fields || []).filter(f =>
		f.df && f.df.fieldtype === "Table"
	);

	for (const f of table_fields) {
		if (f.df.options === "App List Table" && f.grid) {
			return f.grid;
		}
	}

	return null;
}

// Optional: Debug helper - run in console to verify Module Def data
function debug_module_def_data() {
	frappe.call({
		method: 'frappe.client.get_list',
		args: {
			doctype: 'Module Def',
			fields: ['name', 'module_name', 'app_name'],
			limit_page_length: 0
		},
		callback: (r) => {
			console.log('=== MODULE DEF DATA ===');
			console.log('Total modules:', r.message.length);

			// Group by app
			const by_app = {};
			r.message.forEach(m => {
				const app = m.app_name || '(no app)';
				if (!by_app[app]) by_app[app] = [];
				by_app[app].push(m.name);
			});

			console.log('Modules grouped by app:');
			Object.keys(by_app).sort().forEach(app => {
				console.log(`  ${app}: ${by_app[app].length} modules`, by_app[app]);
			});
		}
	});
}
