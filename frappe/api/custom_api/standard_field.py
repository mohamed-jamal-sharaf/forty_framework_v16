from frappe.utils import now_datetime
import frappe

@frappe.whitelist()
def auto_generate_fields(doctype,docname):
    doc = frappe.get_doc(doctype, docname)
    fields = [
    {
        "fieldname": "section_break_2",
        "fieldtype": "Section Break",
        "label": "Metadata"
    },
    {
        "fieldname": "created_by",
        "fieldtype": "Data",
        "label": "Created By",
        "read_only": 1
    },
    {
        "fieldname": "created_datetime",
        "fieldtype": "Datetime",
        "label": "Created DateTime",
        "read_only": 1
    },
    {
        "fieldname": "column_break_ovuq",
        "fieldtype": "Column Break"
    },
    {
        "fieldname": "last_modified_by",
        "fieldtype": "Data",
        "label": "Last Modified By",
        "read_only": 1
    },
    {
        "fieldname": "modified_datetime",
        "fieldtype": "Datetime",
        "label": "Modified DateTime",
        "read_only": 1
    },
    {
        "fieldname": "hide_banner",
        "fieldtype": "Check",
        "label": "Hide Banner",
    }
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


