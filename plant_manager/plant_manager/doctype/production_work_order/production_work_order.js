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

 frappe.ui.form.on('PWO SSL', {
	qty: function(frm) {
		console.log("calculation triggered");
        return frm.call({
			doc: frm.doc,
            method: "load_calculations",
            freeze: true,
            callback:  (r) => {
                console.log(r.message);
            },
        });
    },
	process_id: function (frm) {
		console.log("calculation triggered");
        return frm.call({
			doc: frm.doc,
            method: "load_calculations",
            freeze: true,
            callback:  (r) => {
                console.log(r.message);
            },
        });
	},
 }
);

// frappe.ui.form.on("Production Work Order", { 
//     onload: function(frm) {
//         console.log("ingnoring");
//         frm.ignore_doctype_on_cancel_all=["Production Work Order", "Material Out"];
//     }
// });