// Copyright (c) 2025, Bhargav N and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Vendor", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Vendor", {
    onload: function (frm) {
      frm.set_query("operation_code", "vendor_process_details", function (doc, cdt, cdn) {
        let row = locals[cdt][cdn];
        return {
          "filters": {
            "comp_code": row.component_code
          },
        };
      });
    },
  });
 