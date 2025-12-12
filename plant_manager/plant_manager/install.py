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

    # Process Operation Types
    create_default_process_operation_type("Stage Inspection")
    create_default_process_operation_type("Final Inspection")
    create_default_process_operation_type("FG")
    create_default_process_operation_type("Reject")
    create_default_process_operation_type("Rework")
    create_default_process_operation_type("Manual Operation")
    create_default_process_operation_type("Machine Operation")


# Operation Status for Material In, Material Out & In-House Production
def create_default_operation_status(doc_name):
    if  not frappe.db.exists("Operation Status", "doc_name"):   
        frappe.get_doc({
            "doctype": "Operation Status",
            "operation_status": doc_name,
            "title": doc_name
        }).insert(ignore_permissions=True)
        
# Process Operation Types
def create_default_process_operation_type(doc_name):
    if  not frappe.db.exists("Process Operation Type", "doc_name"):   
        frappe.get_doc({
            "doctype": "Process Operation Type",
            "operation_type": doc_name,
            "title": doc_name
        }).insert(ignore_permissions=True)

    