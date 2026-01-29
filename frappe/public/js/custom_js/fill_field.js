// Copyright (c) 2115, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt


frappe.boot.user.can_read.forEach(element => {
    frappe.ui.form.on(element, {
        onload(frm) {
            if (frm.fields_dict.created_by && !frm.doc.created_by) {
                frm.set_value("created_by", frappe.session.user);
                frm.set_df_property("created_by", "read_only", 1)
                frm.refresh_field('created_by');
            }

            if (frm.fields_dict.created_by && !frm.doc.created_datetime) {
                frm.set_value('created_datetime', frappe.datetime.now_datetime());
                frm.refresh_field('created_datetime');
            }

            if (frm.fields_dict.last_modified_by) {
                frm.set_value('last_modified_by', frappe.session.user);
                frm.refresh_field('last_modified_by');
            }

            if (frm.fields_dict.modified_datetime) {
                frm.set_value('modified_datetime', frappe.datetime.now_datetime());
                frm.refresh_field('modified_datetime');
            }
        },

    });
});


