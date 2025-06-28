// Copyright (c) 2025, Bhargav N and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Purchase Invoice", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Purchase Invoice", { 
    before_cancel: function(frm) {
        return frm.call({
           doc: frm.doc,
           method: "delete_rm_batch_pwo",
           freeze: true,
           callback: (response) => {
               console.log(response.message);
               console.log("delete_rm_batch_pwo");
           },
       });
    },
})