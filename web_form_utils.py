import frappe
from frappe.doctype.web_form.web_form import _is_active_now  # reuse helper

def update_webform_publish():
    webforms = frappe.get_all(
        "Web Form",
        fields=["name", "start_date", "end_date", "start_time", "end_time", "published"]
    )

    for wf in webforms:
        should_publish = 1 if _is_active_now(
            start_date=wf.start_date,
            end_date=wf.end_date,
            start_time=(wf.start_time or "00:00:00"),
            end_time=(wf.end_time or "23:59:59"),
        ) else 0

        if wf.published != should_publish:
            frappe.db.set_value("Web Form", wf.name, "published", should_publish, update_modified=False)
