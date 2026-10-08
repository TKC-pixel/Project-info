from app.modules.kyc.infrastructure.kyc_repository import KycRepository


class KycService:

    def __init__(self):
        self.repository = KycRepository()

    async def list_records(self):
        return await self.repository.list_all()

    async def get_customer_kyc(self, customer_id: str):
        return await self.repository.get_customer_kyc(customer_id)