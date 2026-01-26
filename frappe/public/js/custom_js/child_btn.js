frappe.boot.user.can_read.forEach(doctype => {
    frappe.ui.form.on(doctype, {
        onload(frm) {
            Object.keys(frm.fields_dict).forEach(fieldname => {
                const df = frm.fields_dict[fieldname].df;

                if (df.fieldtype === 'Table') {

                    const grid = frm.fields_dict[fieldname].grid;

                    grid.add_new_row = function () {

                        frappe.model.with_doctype(df.options, () => {
                            const child_meta = frappe.get_meta(df.options);

                            
                            const mandatory_fields = child_meta.fields
                                .filter(f => f.reqd && f.fieldname)
                                .map(f => ({
                                    fieldname: f.fieldname,
                                    fieldtype: f.fieldtype,
                                    label: f.label,
                                    reqd: 1,
                                    options: f.options || "",
                                    default: ""
                                }));

                            if (mandatory_fields.length === 0) {
                                frappe.model.add_child(frm.doc, df.options, fieldname);
                                frm.refresh_field(fieldname);
                                return;
                            }

                            let d = new frappe.ui.Dialog({
                                title: 'Add Row',
                                fields: mandatory_fields,
                                primary_action_label: 'Confirm',

                                primary_action(values) {
                                    let row = frappe.model.add_child(frm.doc, df.options, fieldname);

                                    Object.keys(values).forEach(k => {
                                        frappe.model.set_value(row.doctype, row.name, k, values[k]);
                                    });

                                    frm.refresh_field(fieldname);
                                    d.hide();
                                }
                            });

                            d.show();
                        });
                    };
                }
            });
        }
    });
});
