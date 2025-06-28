// Copyright (c) 2025, Bhargav N and contributors
// For license information, please see license.txt

frappe.ui.form.on("Material In", {
	refresh: function(frm) {
        frm.add_custom_button(__("Material Out - Process"),()=>{
            if(frm.doc.vdr) {  

                // MultiSelectDialog for individual child selection
                new frappe.ui.form.MultiSelectDialog({
                    doctype: "Material Out",
                    target: this.cur_frm,
                    setters: {
                        vdr: null,
                    
                    },
                    add_filters_group: 0,
                    date_field: "p_date",
                    allow_child_item_selection: 1,
                    child_fieldname: "component_table", // child table fieldname, whose records will be shown & can be filtered
                    child_columns: ["t_wh","comp_code","batch", "qty","pending_qty"], // child item columns to be displayed
                    get_query() {
                        return {
                            filters: { 
                                docstatus: ["=", 1],
                                vdr: ["=", frm.doc.vdr],
                                pending_qty:[">", 0],
                                t_wh: frm.doc.d_from_warehouse
                            }                       
                        };
                    },
                    action(selections, args) {
                        //console.log(selections);
                        //console.log(args.filtered_children); // list of selected item names
                        selections.forEach(function(mo_id){
                            if(mo_id){
                                frappe.call({
                                    method: 'frappe.client.get',
                                    args: {
                                        doctype: "Material Out",
                                        filters: {
                                            name: mo_id
                                        }
                                    },
                                    callback: function(r) {
                                        if (r.message) {                                                                         
                                            r.message.component_table.forEach(function(component_tables) {
                                                var mo_comp = args.filtered_children;
                                                if(mo_comp.length){
                                                    // frappe.msgprint("Item selected")
                                                    mo_comp.forEach(function(mo_comps){
                                                        if(mo_comps == component_tables.name) {
                                                            frappe.msgprint("Selected Components are loaded", component_tables.name)
                                                            insert_mi_table(frm, mo_id, component_tables, r);                                                        
                                                        }                                                            
                                                    })
                                                } else{
                                                    frappe.msgprint("All Components in Materal out are loaded")
                                                    insert_mi_table(frm, mo_id, component_tables, r);
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

        // Material IN from RM

        frm.add_custom_button(__("Material Out - RM"),()=>{
            if(frm.doc.vdr) {
                //frm.clear_table('component_table');
                //frappe.msgprint("Vendor Selected");  
                
                // MultiSelectDialog for individual child selection
                new frappe.ui.form.MultiSelectDialog({
                    doctype: "Material Out",
                    target: this.cur_frm,
                    setters: {
                        vdr: null,
                    
                    },
                    add_filters_group: 0,
                    date_field: "p_date",
                    allow_child_item_selection: 1,
                    child_fieldname: "rm_table", // child table fieldname, whose records will be shown & can be filtered
                    child_columns: ["to_warehouse","component_code","rm_batch", "qty","pending_qty"], // child item columns to be displayed
                    get_query() {
                        return {
                            filters: { 
                                docstatus: ["=", 1],
                                vdr: ["=", frm.doc.vdr],
                                pending_qty:[">", 0],
                                to_warehouse: frm.doc.d_from_warehouse
                            }                       
                        };
                    },
                    action(selections, args) {
                        //console.log(selections);
                        //console.log(args.filtered_children); // list of selected item names
                        selections.forEach(function(mo_id){
                            if(mo_id){
                                frappe.call({
                                    method: 'frappe.client.get',
                                    args: {
                                        doctype: "Material Out",
                                        filters: {
                                            name: mo_id
                                        }
                                    },
                                    callback: function(r) {
                                        if (r.message) {                                                                         
                                            r.message.rm_table.forEach(function(rm_tables) {
                                                var mo_comp = args.filtered_children;
                                                if(mo_comp.length){
                                                    // frappe.msgprint("Item selected")
                                                    mo_comp.forEach(function(mo_comps){
                                                        if(mo_comps == rm_tables.name) {
                                                            frappe.msgprint("Selected Components are loaded", rm_tables.name)
                                                            insert_rm_table(frm, mo_id, rm_tables, r);                                                        
                                                        }                                                            
                                                    })
                                                } else{
                                                    frappe.msgprint("All Components in Materal out are loaded")
                                                    insert_rm_table(frm, mo_id, rm_tables, r);
                                                }
                                                
                                            });
                                            frm.refresh_field('rm_table');
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

        // Material IN from Asset
    
    }
});

function insert_mi_table(frm, mo_id, component_tables, r) {
    var child = frm.add_child('component_table');
    //console.log(pwo_id.comp_code);
    child.comp_code = component_tables.comp_code;
    //child.component_name = r.message.comp_name;
    child.batch = component_tables.batch;
    child.material_out = mo_id;
    child.qty = component_tables.pending_qty;
    child.completed_process = component_tables.for_process;
    child.mo_date = r.message.p_date;
    var dt = moment(frm.doc.p_date).diff(r.message.p_date,'minutes', true);
    child.dur_min = dt;

    // Convert minutes to total seconds
    let total_seconds = Math.floor(dt * 60);
    frappe.model.set_value(child.doctype, child.name, 'duration', total_seconds);
    frm.refresh_field('component_table');
}

function insert_rm_table(frm, mo_id, rm_tables, r) {
    var child = frm.add_child('rm_table');
    //console.log(pwo_id.comp_code);
    child.rm_component = rm_tables.component_code;
    //child.component_name = r.message.comp_name;
    child.rm_batch = rm_tables.rm_batch;
    child.material_out = mo_id;
    child.qty = rm_tables.pending_qty;
    child.from_warehouse = rm_tables.to_warehouse;
    //child.completed_process = rm_tables.for_process;
    child.mo_date = r.message.p_date;
    var dt = moment(frm.doc.p_date).diff(r.message.p_date,'minutes', true);
    child.dur_min = dt;

    // Convert minutes to total seconds
    let total_seconds = Math.floor(dt * 60);
    frappe.model.set_value(child.doctype, child.name, 'duration', total_seconds);
    frm.refresh_field('rm_table');
}

frappe.ui.form.on("Material In", { 
    before_cancel: function(frm) {
        return frm.call({
           doc: frm.doc,
           method: "delete_ssl_mrn_entry",
           freeze: true,
           callback: (response) => {
               console.log(response.message);
               console.log("delete_ssl_entry");
           },
       });
    },
})