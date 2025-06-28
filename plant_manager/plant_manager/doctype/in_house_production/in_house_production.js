// Copyright (c) 2025, Bhargav N and contributors
// For license information, please see license.txt

frappe.ui.form.on("In-House Production", {
    onload: function(frm) {
        frm.set_query('operation_id', 'production_log', function(doc,cdt, cdn) {
            let d = locals[cdt][cdn];
            return {
                'filters': [
                    ['Process Operation','comp_code', 'in', d.item_code],
                ],
            };
        });

        frm.set_query('batch_number', 'production_log', function(doc,cdt, cdn) {
            let d = locals[cdt][cdn];
            if(d.is_rework_operation == 0){
                return {                
                    'filters': [
                        ['Production Work Order','comp_code', 'in', d.item_code],
                        ['PWO Process Table','opt_id', 'in', d.operation_id],                    
                        ['PWO Process Table','p_qty', '>', 0],
                        
                    ],
                }
            }
            else if (d.is_rework_operation == 1){
                return{
                    'filters': [
                            ['Production Work Order','comp_code', 'in', d.item_code],
                            ['PWO Process Table','opt_id', 'in', d.operation_id], 
                            ['PWO Process Table','o_rwk_qty', '>', 0],
                            
                        ],
                }
            }
        })
    },
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
    }
});

frappe.ui.form.on('Production Log Table',{
    s_endtime:function (frm, cdt, cdn) {
        time_calculation(frm, cdt, cdn);
    },
    s_starttime:function (frm, cdt, cdn) {
        time_calculation(frm, cdt, cdn);
	},
    p_starttime:function (frm, cdt, cdn) {
        time_calculation(frm, cdt, cdn);
    },
    p_endtime: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    no_setting: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    f_qty: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    t_qty: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    rew_qty: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    acc_qty: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    is_rework_operation: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
    c_time: function (frm, cdt, cdn) {
		time_calculation(frm, cdt, cdn);
	},
});

function time_calculation(frm, cdt, cdn){
    var row = locals[cdt][cdn];
        if(row.no_setting==1){
            frappe.model.set_value(cdt, cdn, 's_starttime', row.p_starttime);
            frappe.model.set_value(cdt, cdn, 's_endtime', row.p_starttime);
        }
        if(row.no_setting==0){
            frappe.model.set_value(cdt, cdn, 's_time', moment(row.s_endtime).diff(row.s_starttime,'minutes', true));
        }
        cur_frm.refresh_fields('s_time');
        // calculating duration
        frappe.model.set_value(cdt, cdn, 'dur_min',moment(row.s_endtime).diff(row.s_starttime,'minutes', true)+ moment(row.p_endtime).diff(row.p_starttime,'minutes', true));
        cur_frm.refresh_fields('dur_min');
        // calculating Produced Qty
        if(row.is_rework_operation==0){
            frappe.model.set_value(cdt, cdn, 'p_qty', (row.t_qty-row.f_qty+1));
            frappe.model.set_value(cdt, cdn, 'rej_qty', (row.p_qty-row.acc_qty));
            cur_frm.refresh_fields('p_qty');
            cur_frm.refresh_fields('rej_qty');
        }
        if(row.is_rework_operation==1){
            frappe.model.set_value(cdt, cdn, 'p_qty', 0);
            frappe.model.set_value(cdt, cdn, 'rej_qty', (row.rew_qty-row.acc_qty));
            cur_frm.refresh_fields('p_qty');
            cur_frm.refresh_fields('rej_qty');
        }

        // cycle time to min
        frappe.model.set_value(cdt, cdn,'c_time_min' ,row.c_time/60);


        //check
        //console.log("triggering cal");

}

