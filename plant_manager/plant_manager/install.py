import frappe

def after_install():
    
    # Operation Status for Material In, Material Out & In-House Production
    create_default_operation_status("Pending")
    create_default_operation_status("Vendor")
    create_default_operation_status("Rework")
    create_default_operation_status("Rejected")
    create_default_operation_status("Converted")
    create_default_operation_status("Returned Without Operation")
    create_default_operation_status("Completed")


# Operation Status for Material In, Material Out & In-House Production
def create_default_operation_status(doc_name):
    if  not frappe.db.exists("Operation Status", "doc_name"):   
        frappe.get_doc({
            "doctype": "Operation Status",
            "operation_status": doc_name,
            "title": doc_name
        }).insert(ignore_permissions=True)

    