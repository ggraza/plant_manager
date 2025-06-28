# Copyright (c) 2024, Bhargav N and contributors
# For license information, please see license.txt
import json
import frappe
from frappe.model.document import Document

class ProductionWorkOrder(Document):
	
	def validate(self):
		pass

	# def on_change(self):
	# 	self.load_calculations()


	@frappe.whitelist()
	def load_operation(self):
		if not self.pwo_qty:
			frappe.throw("Please input Production Work Order Qty")

		self.osd=[]
		data = frappe.get_all(
			"POS Table",
			filters={"parent": self.pos},
			fields=[
				"sequence_id",
				"operation_code",
				"operation_name",
			],
			order_by="sequence_id",
		)
		for d in range(len(data)):
			self.append('osd',{
								'sid':data[d].sequence_id,
								'opt_id':data[d].operation_code,
								'opt_name':data[d].operation_name,
								't_qty': 0,
								'p_qty':self.pwo_qty,
								'moved_to_vendor': 0,
								'o_rwk_qty': 0,
								'o_rej_qty':0,
								'o_comp_qty':0,
								'o_conv_qty':0,
								'waiting_qty':0,
								'auto_waiting_qty':0
							}
						)
		self.load_calculations()
			
	@frappe.whitelist()		
	def load_calculations(self):
		
		# loading operation status
		t_rej = 0.0
		t_conv = 0.0
		t_rew = 0.0
		for a in self.get("osd"):
			qty = 0.0  # FG completed
			qty1 = 0.0 # Total Qty
			qty2 = 0.0 # Pending qty
			qty3 = 0.0 # Vendor
			qty4 = 0.0 # Rework
			qty5 = 0.0 # Reject
			qty6 = 0.0 # Conversion
			qty7 = 0.0 # Completed
			# loading operation status
			for b in self.get("ssl_entry"):				
				if a.opt_id == b.process_id:
					#print("opt selected")
					# Material Out
					if b.transaction_type == "Material Out":
						#print("M.O selected")
						if b.operation_status == "Vendor" :
							qty3 = qty3 + b.qty #qty3 is vendor
							#qty2 = qty2 - b.qty #qty2 is pending qty
						if b.operation_status == "Rework":
							qty3 = qty3 + b.qty #qty3 is vendor
							qty4 = qty4 - b.qty #qty4 is rework

					# Material In		
					if b.transaction_type == "Material In":
						if b.operation_status == "Completed":
							qty7 = qty7 + b.qty #qty7 is completed
							qty3 = qty3 - b.qty #qty3 is vendor

						if b.operation_status == "Rejected":
							qty5 = qty5 + b.qty #qty5 is Rejected
							qty3 = qty3 - b.qty #qty3 is vendor

						if b.operation_status == "Returned Without Operation":
							qty3 = qty3 - b.qty #qty3 is vendor


					# Rework Log
					if b.transaction_type == "Rework Log":
						if b.operation_status == "Rework":
							qty4 = qty4 + b.qty #qty4 is Rework
							qty7 = qty7 - b.qty #qty7 is completed
						
						if b.operation_status == "Rejection":
							qty4 = qty4 + b.qty #qty4 is Rework
							qty5 = qty5 - b.qty #qty5 is Rejection

					# Rejection Log
					if b.transaction_type == "Rejection Log":
						if b.operation_status == "Completed":
							qty5 = qty5 + b.qty #qty5 is Rejected
							qty7 = qty7 - b.qty #qty7 is completed

						if b.operation_status == "Rework":
							qty5 = qty5 + b.qty #qty5 is Rejected
							qty4 = qty4 - b.qty #qty4 is Rework	


					# Conversion Log
					if b.transaction_type == "Conversion Log":
						if b.operation_status == "Pending":
							qty6 = qty6 + b.qty #qty6 is conversion qty
							#qty2 = qty2 - b.qty #qty2 is pending qty

						if b.operation_status == "Rework":
							qty6 = qty6 + b.qty #qty6 is conversion qty
							qty4 = qty4 - b.qty #qty4 is Rework
						
						if b.operation_status == "Vendor":
							qty6 = qty6 + b.qty #qty6 is conversion qty
							qty3 = qty3 - b.qty #qty3 is vendor
						
						if b.operation_status == "Rejection":
							qty6 = qty6 + b.qty #qty6 is conversion qty
							qty5 = qty5 - b.qty #qty5 is Rejected qty
					
					#In-House Production
					if b.transaction_type == "In-House Production":
						if b.operation_status == "Completed":
							qty7 = qty7 + b.qty # qty6 is Completed qty
							#qty2 = qty2 - b.qty # qty2 is Pending qty
						
						if b.operation_status == "Rework":
							qty7 = qty7 + b.qty # qty6 is Completed qty
							qty4 = qty4 - b.qty # qty4 is Rework qty	

				if b.operation_type == "FG":
					qty = qty + b.qty
						

				a.moved_to_vendor = qty3
				a.o_rwk_qty = qty4
				a.o_rej_qty = qty5
				a.o_conv_qty = qty6
				a.o_comp_qty = qty7

				qty1 = self.pwo_qty - t_rej - t_conv
				qty2 = qty1 - qty7 - qty4 - qty3

				a.t_qty = qty1
				a.p_qty = qty2

			t_rew = t_rew + qty4
			t_rej = t_rej + qty5
			t_conv = t_conv + qty6
			self.comp_qty = qty

		self.rej_qty = t_rej
		self.conv_qty = t_conv 
		self.rwk_qty = t_rew

		# loading status of work order (should always be before self.save() )
		c = self.comp_qty + self.conv_qty + self.rej_qty
		if self.pwo_qty > c:
			self.pwo_status = "Open"
		if self.pwo_qty == c:
			self.pwo_status = "Completed"	
		if self.pwo_qty == self.disp_qty + self.conv_qty + self.rej_qty:
			self.pwo_status = "Closed"

		self.save(ignore_permissions=True)		
