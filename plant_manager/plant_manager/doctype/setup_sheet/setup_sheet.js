// Copyright (c) 2026, Bhargav N and contributors
// For license information, please see license.txt

frappe.ui.form.on("Setup Sheet", {
	refresh: function(frm) {
        frm.set_query('operation', function() {
            return {
                filters: [
                    ['Process Operation','comp_code' ,'=', frm.doc.component]
                ]
            };
        });
    }
});

