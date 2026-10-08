class AlertsService:
    async def list_alerts(self):
        return [
            {"alert_id": "ALT-001", "customer_id": "CUST-00316", "alert_type": "ADVERSE_MEDIA_MATCH", "severity": "HIGH", "status": "OPEN", "created_at": "2026-09-29T16:45:00Z"},
            {"alert_id": "ALT-002", "customer_id": "CUST-00721", "alert_type": "PEP_MATCH", "severity": "MEDIUM", "status": "IN_REVIEW", "created_at": "2026-09-30T11:17:00Z"},
        ]