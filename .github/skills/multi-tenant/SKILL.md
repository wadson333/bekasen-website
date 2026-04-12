---
name: multi-tenant
description: Skill pour l'architecture multi-tenant de Konprann. Couvre la gestion des school_id, les rôles, la validation élève, les codes de classe et l'isolation des données entre écoles.
---

# Multi-Tenant Konprann — Skill

## Modèles de Base Multi-Tenant

```python
# Toute ressource liée à une école hérite de ce mixin
class SchoolTenantMixin:
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("schools.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    # None = ressource globale Konprann
    # UUID = ressource exclusive de cette école

# Vérification d'appartenance (OBLIGATOIRE pour toute ressource école)
async def verify_school_ownership(
    resource_school_id: Optional[UUID],
    current_user: User,
) -> None:
    if resource_school_id is None:
        return  # Ressource globale, accessible à tous
    if current_user.role == UserRole.SUPER_ADMIN:
        return  # Super admin voit tout
    if current_user.school_id != resource_school_id:
        raise HTTPException(status_code=403, detail="Access denied")
```

## Système de Validation Élève

```python
class StudentVerificationService:
    async def request_school_join(
        self, db: AsyncSession, student_id: UUID, school_id: UUID, class_code: Optional[str]
    ) -> VerificationRequest:
        if class_code:
            # Validation instantanée par code
            code = await self.validate_class_code(db, school_id, class_code)
            return await self.approve_instantly(db, student_id, school_id, code.class_name)
        else:
            # Demande manuelle — état PENDING
            return await self.create_pending_request(db, student_id, school_id)

    async def generate_class_code(
        self, db: AsyncSession, school_id: UUID, class_name: str
    ) -> ClassCode:
        code = secrets.token_urlsafe(8).upper()  # Ex: "KP7X2MNR"
        return await self.save_code(db, school_id, class_name, code, expires_days=30)
```

## Rôles et Permissions

```python
class UserRole(str, Enum):
    STUDENT_UNVERIFIED = "student_unverified"
    STUDENT_VERIFIED = "student_verified"
    SCHOOL_ADMIN = "school_admin"
    SUPER_ADMIN = "super_admin"
    FONDATION_LEARNER = "fondation_learner"  # Adulte volet Fondation

PERMISSIONS = {
    UserRole.STUDENT_UNVERIFIED: ["read:global_resources", "use:tutor_basic", "play:quiz"],
    UserRole.STUDENT_VERIFIED: ["*:student_unverified", "read:school_resources",
                                 "join:school_contests", "view:school_rankings"],
    UserRole.SCHOOL_ADMIN: ["manage:school_students", "create:contests",
                             "manage:priority_books", "view:school_analytics"],
    UserRole.SUPER_ADMIN: ["*"],
}
```

## Query Pattern Multi-Tenant (toujours filtrer par school_id)

```python
# BON — filtrer explicitement
async def get_school_resources(db: AsyncSession, school_id: UUID):
    result = await db.execute(
        select(Resource).where(
            or_(Resource.school_id == school_id, Resource.school_id.is_(None))
        )
    )
    return result.scalars().all()

# MAUVAIS — ne jamais faire ça
async def get_all_resources(db: AsyncSession):
    result = await db.execute(select(Resource))  # ← Fuite de données cross-tenant !
    return result.scalars().all()
```
