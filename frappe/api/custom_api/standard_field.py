from frappe.utils import now_datetime
import frappe

@frappe.whitelist()
def auto_generate_fields(doctype,docname):
    doc = frappe.get_doc(doctype, docname)
    fields = [
        {"fieldname": "section_break_2", "fieldtype": "Section Break"},
        {"fieldname": "created_by", "fieldtype": "Data", "label": "Created By"},
        {
            "fieldname": "created_datetime",
            "fieldtype": "Datetime",
            "label": "Created DateTime",
        },
        {"fieldname": "column_break_ovuq", "fieldtype": "Column Break"},
        {
            "fieldname": "last_modified_by",
            "fieldtype": "Data",
            "label": "Last Modified By",
        },
        {
            "fieldname": "modified_datetime",
            "fieldtype": "Datetime",
            "label": "Modified DateTime",
        },

        {"fieldname": "section_break_3", "fieldtype": "Section Break"},
        {"fieldname": "grand_total", "fieldtype": "Float", "label": "Grand Total"},
        {"fieldname": "column_break_meac", "fieldtype": "Column Break"},
        {
            "fieldname": "doctype_currency",
            "fieldtype": "Data",
            "label": "Doctype Currency",
        },
        {"fieldname": "column_break_4", "fieldtype": "Column Break"},
        {
            "fieldname": "total_paid_amount",
            "fieldtype": "Float",
            "label": "Total Paid Amount",
        },
        {"fieldname": "column_break_tznp", "fieldtype": "Column Break"},
        {
            "fieldname": "total_outstanding",
            "fieldtype": "Float",
            "label": "Total Outstanding ",
        },
        {"fieldname": "section_break_5", "fieldtype": "Section Break"},
        {"fieldname": "footer", "fieldtype": "HTML", "label": "Footer"},
        {
            "default": "0",
            "fieldname": "finance_doctype",
            "fieldtype": "Check",
            "label": "Finance Doctype",
        },
    ]

    existing_fieldnames = [f.fieldname for f in doc.fields]
    added = False
    for f in fields:
        if f["fieldname"] not in existing_fieldnames:
          doc.append("fields", f)
          added = True
       
       
    if added :
      doc.save()
      return {"status": "added"}
    else:
      return {"status": "exists"}



@frappe.whitelist()
def fill_fields(doctype,docname):
    doc = frappe.get_doc(doctype, docname)
    if not doc.get("created_by"):
        doc.created_by = frappe.session.user

    if not doc.get("created_datetime"):
        doc.created_datetime = now_datetime()

    doc.last_modified_by = frappe.session.user
    doc.modified_datetime = now_datetime()
    doc.save()
    return {"message": "Fields filled successfully"}


