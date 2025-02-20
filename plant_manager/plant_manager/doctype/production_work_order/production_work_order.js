// Copyright (c) 2024, Bhargav N and contributors
// For license information, please see license.txt

frappe.ui.form.on("Production Work Order", {
 	pos: function(frm) {
		return frm.call({
			doc: frm.doc,
			method: "load_operation",
			freeze: true,
			callback: (response) => {
                console.log(response.message);
			},
		});

 	},
     pwo_qty: function (frm) {
		frm.trigger("pos");
	},
 });
