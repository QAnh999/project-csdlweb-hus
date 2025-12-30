from uuid import uuid4

class MockPaymentGateway:
    def charge(self, amount: float, method: str):
        return {
            "transaction_id": f"MOCK-{uuid4()}",
            "status": "success"
        }

    def refund(self, transaction_id: str):
        return {
            "status": "refunded"
        }


payment_gateway = MockPaymentGateway()
