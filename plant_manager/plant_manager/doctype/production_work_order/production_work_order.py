# Copyright (c) 2024, Bhargav N and contributors
# For license information, please see license.txt
import json
import frappe
from frappe.model.document import Document

class ProductionWorkOrder(Document):
	#def validate(self):
		#pass
		#if not self.ssl_entry==[]:
			#for s_row in range(len(self.ssl_entry)):





	@frappe.whitelist()
	def load_operation(self):
		if self.pwo_qty<=0:
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
								'p_qty':self.pwo_qty,
								
							}
						)




	
	
