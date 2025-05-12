// Copyright (c) 2025, Bhargav N and contributors
// For license information, please see license.txt

frappe.ui.form.on("Material Out", {
    refresh: function(frm) {
        frm.add_custom_button(__("Production Work Order"),()=>{
            if(frm.doc.vdr) {
                //frm.clear_table('component_table');
                //frappe.msgprint("Vendor Selected");  

                // MultiSelectDialog for individual child selection
                new frappe.ui.form.MultiSelectDialog({
                    doctype: "Production Work Order",
                    target: this.cur_frm,
                    setters: {
                        comp_code: null,
                        pos:null,
                        pwo_date: null,
                        // osd: {
                        //     opt_name: null,
                        // },
                    },
                    add_filters_group: 1,
                    date_field: "pwo_date",
                    allow_child_item_selection: 1,
                    child_fieldname: "osd", // child table fieldname, whose records will be shown & can be filtered
                    child_columns: ["opt_id","opt_name", "p_qty","moved_to_vendor", "o_comp_qty"], // child item columns to be displayed
                    get_query() {
                        return {
                            filters: { 
                                docstatus: ["=", 1],
                                //["PWO Process Table","p_qty",">", 0],
                                pwo_status:["=","Open"]
                            }                       
                        }
                    },
                    action(selections, args) {
                        //console.log(selections);
                        //console.log(args.filtered_children); // list of selected item names
                        selections.forEach(function(pwo_id){
                            if(pwo_id){
                                frappe.call({
                                    method: 'frappe.client.get',
                                    args: {
                                        doctype: "Production Work Order",
                                        filters: {
                                            name: pwo_id
                                        }
                                    },
                                    callback: function(r) {
                                        if (r.message) {                                                                         
                                            r.message.osd.forEach(function(osds) {
                                                var pwo_opt = args.filtered_children;
                                                if(pwo_opt.length){
                                                    // frappe.msgprint("Item selected")
                                                    pwo_opt.forEach(function(pwo_opts){
                                                        if(pwo_opts == osds.name) {
                                                            frappe.msgprint("Selected Components & Operations are loaded",osds.name)
                                                            insert_items(frm, pwo_id, osds, r);                                                        
                                                        }                                                            
                                                    })
                                                } else{
                                                    frappe.msgprint("All operations loaded")
                                                    insert_items(frm, pwo_id, osds, r);
                                                }
                                                
                                            });
                                            frm.refresh_field('component_table');
                                        }
                                    }
                                });                            
                            }
                        })
                        cur_dialog.hide();
                    }
                });
            } else{
                frappe.throw("Please select the Vendor");
            }
        }, __("Get Item with operation from"));
    
    }
});

function insert_items(frm, pwo_id, osds, r) {
    var child = frm.add_child('component_table');
    //console.log(pwo_id.comp_code);
    child.comp_code = r.message.comp_code;
    child.component_name = r.message.comp_name;
    child.batch = pwo_id;
    child.qty = osds.p_qty;
    child.for_process = osds.opt_id;
}

frappe.ui.form.on("Material Out", { 
    before_cancel: function(frm) {
        return frm.call({
           doc: frm.doc,
           method: "delete_ssl_entry",
           freeze: true,
           callback: (response) => {
               console.log(response.message);
               console.log("delete_ssl_entry");
           },
       });
    },

    
    onload: function(frm) {
        frm.set_query('opt_stat', 'component_table', function() {
            return {
                'filters': [
                    ['Operation Status', 'operation_status', 'in', 'Vendor, Rework'],
                    ],
            };
        });

        frm.set_query('for_process', 'component_table', function(doc, cdt, cdn) {
            let d = locals[cdt][cdn];
            return {
                'filters': [
                    ['Process Operation','comp_code', 'in', d.comp_code],
                ],
            };
        });

        frm.set_query('batch', 'component_table', function(doc, cdt, cdn) {
            let d = locals[cdt][cdn];
            return {
                'filters': [
                    ['Production Work Order','comp_code', 'in', d.comp_code],
                ],
            };
        });

    },   
});

// frappe.ui.form.on("Material Out", { 
//     onload: function(frm) {
//         console.log("ingnoring");
//         frm.ignore_doctype_on_cancel_all=["Production Work Order", "Material Out"];
//     }
// });