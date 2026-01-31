frappe.pages['file-manager'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'File Manager',
		single_column: true
	});
}