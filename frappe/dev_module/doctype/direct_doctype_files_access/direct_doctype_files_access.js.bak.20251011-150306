// DocType: Direct Doctype Files Access
// Purpose: Filter target_doctype by chosen module_name and exclude specific doctypes

frappe.ui.form.on('Direct Doctype Files Access', {
  onload(frm) {
    apply_target_doctype_filter(frm);
  },

  refresh(frm) {
    apply_target_doctype_filter(frm);
  },

  // When Module changes → clear target_doctype and re-apply filter
  module_name(frm) {
    frm.set_value('target_doctype', '');
    apply_target_doctype_filter(frm);
  },

  // Extra safety: block saving if excluded name is somehow set
  validate(frm) {
    const excluded = ['Direct Doctype Files Access', 'CODE EDITOR Pro'];
    if (excluded.includes(frm.doc.target_doctype)) {
      frappe.throw(__('This DocType is not allowed to be selected.'));
    }
  }
});

function apply_target_doctype_filter(frm) {
  const excluded = ['Direct Doctype Files Access', 'CODE EDITOR Pro'];

  frm.set_query('target_doctype', () => {
    const filters = {
      name: ['not in', excluded]
    };

    // Filter by Module Def only if provided
    if (frm.doc.module_name) {
      filters.module = frm.doc.module_name;
    }

    // Return filters for the Link search
    // (Frappe will use frappe.desk.search.search_link with these filters)
    return {
      filters: filters
      // You can optionally add: query: 'frappe.desk.search.search_link'
      // but it's the default for Link fields.
    };
  });
}
