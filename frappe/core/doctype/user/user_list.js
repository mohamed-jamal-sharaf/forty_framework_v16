// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM USER LIST PROTECTION - Capital Project
// ══════════════════════════════════════════════════════════════════════════════
// Rules:
// 1. Administrator: Can see all users
// 2. Mohamed Sharaf (mohamed.sharaf.secured@gmail.com): Can see all users
// 3. Developers (DevRole): Cannot see Administrator, Guest, or Mohamed Sharaf
// ══════════════════════════════════════════════════════════════════════════════

// Protected users that developers cannot see
const PROTECTED_USERS = ["Administrator", "Guest", "mohamed.sharaf.secured@gmail.com"];

// Admin users who can see everything
const ADMIN_USERS = ["Administrator", "mohamed.sharaf.secured@gmail.com"];

frappe.listview_settings["User"] = {
	add_fields: ["enabled", "user_type", "user_image"],
	filters: [["enabled", "=", 1]],

	prepare_data: function (data) {
		data["user_for_avatar"] = data["name"];
	},

	get_indicator: function (doc) {
		if (doc.enabled) {
			return [__("Active"), "green", "enabled,=,1"];
		} else {
			return [__("Disabled"), "grey", "enabled,=,0"];
		}
	},

	// ══════════════════════════════════════════════════════════════════════════
	// CUSTOM PROTECTION - Capital Project
	// ══════════════════════════════════════════════════════════════════════════
	onload: function (listview) {
		// Check if current user is NOT an admin
		if (!ADMIN_USERS.includes(frappe.session.user)) {
			// Add filter to hide protected users
			listview.filter_area.add([
				["User", "name", "not in", PROTECTED_USERS]
			]);
		}
	},

	before_render: function () {
		// Additional protection: Remove protected users from the data
		if (!ADMIN_USERS.includes(frappe.session.user)) {
			if (this.data && this.data.length) {
				this.data = this.data.filter(function (row) {
					return !PROTECTED_USERS.includes(row.name);
				});
			}
		}
	},

	refresh: function (listview) {
		// Re-apply filter on refresh if not admin
		if (!ADMIN_USERS.includes(frappe.session.user)) {
			// Check if filter already exists
			let has_filter = false;
			if (listview.filter_area && listview.filter_area.filters) {
				listview.filter_area.filters.forEach(function (filter) {
					if (filter[1] === "name" && filter[2] === "not in") {
						has_filter = true;
					}
				});
			}

			// Add filter if not exists
			if (!has_filter) {
				listview.filter_area.add([
					["User", "name", "not in", PROTECTED_USERS]
				]);
			}
		}
	},
	// ══════════════════════════════════════════════════════════════════════════
	// END CUSTOM PROTECTION
	// ══════════════════════════════════════════════════════════════════════════
};

frappe.help.youtube_id["User"] = "8Slw1hsTmUI";