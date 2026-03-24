#!/usr/bin/env python3
"""
Seed Firestore with detailed dummy data for:
- Harshini Mishal (contract business owner)
- 3 projects (including past/completed projects)
- workers, payroll profiles, assignments
- tasks, transactions, materials with bills, travel expenses
- invoices and notifications

Usage:
    python scripts/seed_harshini_contract_data.py --service-account scripts/serviceAccount.json

Optional:
  --project-id <firebase-project-id>
  --database-id <firestore-database-id>
  --create-auth-user  (creates Firebase Auth user if missing)

Environment fallback:
  GOOGLE_APPLICATION_CREDENTIALS
  FIREBASE_PROJECT_ID
  FIRESTORE_DATABASE_ID
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
from typing import Any, Dict, List, Tuple

import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.auth.transport.requests import Request


OWNER_UID = "harshini_mishal_owner"
OWNER_EMAIL = "haharshinii@gmail.com"
OWNER_PASSWORD = "Harshini@24706"
OWNER_NAME = "Harshini Mishal"
NOW = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def iso_date(days_offset: int) -> str:
    return (dt.date.today() + dt.timedelta(days=days_offset)).isoformat()


def parse_args() -> argparse.Namespace:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_service_account = os.path.join(script_dir, "serviceAccount.json")
    if not os.path.exists(default_service_account):
        default_service_account = ""

    parser = argparse.ArgumentParser(description="Seed Harshini contract owner Firestore dummy data")
    parser.add_argument(
        "--service-account",
        default=os.getenv("GOOGLE_APPLICATION_CREDENTIALS", default_service_account),
    )
    parser.add_argument("--project-id", default=os.getenv("FIREBASE_PROJECT_ID", ""))
    parser.add_argument("--database-id", default=os.getenv("FIRESTORE_DATABASE_ID", ""))
    parser.add_argument("--create-auth-user", action="store_true")
    return parser.parse_args()


def init_firebase(service_account: str, project_id: str) -> None:
    if firebase_admin._apps:
        return

    init_options = {"projectId": project_id} if project_id else None
    service_account_error: Exception | None = None

    if service_account:
        try:
            cred = credentials.Certificate(service_account)
            # Validate the private key and token minting before Firestore writes.
            cred.get_credential().refresh(Request())
            firebase_admin.initialize_app(cred, init_options)
            return
        except Exception as exc:
            service_account_error = exc
            print(
                "[warn] Service account credential failed. "
                "Falling back to Application Default Credentials..."
            )

    try:
        # Uses application default credentials.
        firebase_admin.initialize_app(options=init_options)
    except Exception as adc_exc:
        if service_account_error:
            raise RuntimeError(
                "Unable to initialize Firebase Admin with service account or ADC. "
                "The service account key may be invalid/revoked (Invalid JWT Signature). "
                "Regenerate serviceAccount.json in Firebase Console > Project Settings > Service Accounts."
            ) from service_account_error
        raise RuntimeError(
            "Unable to initialize Firebase Admin using ADC. "
            "Set GOOGLE_APPLICATION_CREDENTIALS or pass --service-account <path>."
        ) from adc_exc


def get_db(database_id: str):
    if database_id:
        return firestore.client(database_id=database_id)
    return firestore.client()


def upsert(db, collection_name: str, doc_id: str, data: Dict[str, Any]) -> None:
    db.collection(collection_name).document(doc_id).set(data, merge=True)


def ensure_auth_user(create_auth_user: bool) -> None:
    if not create_auth_user:
        return

    try:
        auth.get_user(OWNER_UID)
        auth.update_user(
            OWNER_UID,
            email=OWNER_EMAIL,
            display_name=OWNER_NAME,
            password=OWNER_PASSWORD,
            email_verified=True,
            disabled=False,
        )
        print(f"[auth] Updated existing user: {OWNER_UID}")
        return
    except auth.UserNotFoundError:
        pass

    auth.create_user(
        uid=OWNER_UID,
        email=OWNER_EMAIL,
        display_name=OWNER_NAME,
        password=OWNER_PASSWORD,
        email_verified=True,
        disabled=False,
    )
    print(f"[auth] Created user: {OWNER_UID}")


def seed_user_profile(db) -> None:
    profile = {
        "uid": OWNER_UID,
        "displayName": OWNER_NAME,
        "email": OWNER_EMAIL,
        "photoURL": None,
        "businessType": "contract",
        "phone": "+91-9876501234",
        "company": "Mishal Infra Buildworks",
        "role": "owner",
        "isDyslexiaMode": False,
        "language": "en",
        "createdAt": NOW,
        "ownerUid": OWNER_UID,
    }
    upsert(db, "users", OWNER_UID, profile)


def build_projects() -> List[Tuple[str, Dict[str, Any]]]:
    return [
        (
            "job_greenvalley_tower_a",
            {
                "title": "Green Valley Tower A Electrical and Finishing",
                "client": "Green Valley Developers",
                "location": "Whitefield, Bengaluru",
                "status": "active",
                "budget": 1250000,
                "spent": 0,
                "startDate": iso_date(-45),
                "endDate": iso_date(40),
                "notes": "High-rise finishing package. Includes electrical, paint touchups, and QA handover.",
                "model": "contract",
                "mode": "product",
                "projectType": "Contract",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
        (
            "job_lakeside_villa_cluster",
            {
                "title": "Lakeside Villa Cluster Plumbing Retrofit",
                "client": "Suryodaya Estates",
                "location": "Sarjapur Road, Bengaluru",
                "status": "completed",
                "budget": 760000,
                "spent": 0,
                "startDate": iso_date(-180),
                "endDate": iso_date(-110),
                "notes": "Completed project. Warranty period active for 6 months.",
                "model": "contract",
                "mode": "service",
                "projectType": "Contract",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
        (
            "job_orchid_commercial_block",
            {
                "title": "Orchid Commercial Block False Ceiling and HVAC Prep",
                "client": "Orchid Business Parks",
                "location": "Electronic City Phase 2, Bengaluru",
                "status": "pending",
                "budget": 980000,
                "spent": 0,
                "startDate": iso_date(7),
                "endDate": iso_date(95),
                "notes": "Pre-mobilization stage. Vendor lock-in pending.",
                "model": "contract",
                "mode": "product",
                "projectType": "Contract",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
    ]


def build_workers() -> List[Tuple[str, Dict[str, Any]]]:
    return [
        (
            "worker_ajay_electrician",
            {
                "name": "Ajay N",
                "photoUrl": None,
                "dateOfBirth": "1994-08-11",
                "gender": "male",
                "phone": "9876500001",
                "email": "ajay.n@example.com",
                "emergencyContact": "Nirmala N",
                "emergencyPhone": "9876501001",
                "role": "Senior Electrician",
                "skills": ["Wiring", "Panel Setup", "QA Checks"],
                "department": "Electrical",
                "employmentType": "Full-time",
                "joiningDate": iso_date(-420),
                "wageType": "Daily",
                "wageAmount": 1350,
                "paymentFrequency": "Weekly",
                "bankAccountOrUpi": "ajayn@upi",
                "paymentMethod": "UPI",
                "status": "active",
                "attendance": 96,
                "notes": "Team lead for Green Valley project.",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
        (
            "worker_priya_plumbing",
            {
                "name": "Priya K",
                "photoUrl": None,
                "dateOfBirth": "1996-03-17",
                "gender": "female",
                "phone": "9876500002",
                "email": "priya.k@example.com",
                "emergencyContact": "Karthik K",
                "emergencyPhone": "9876501002",
                "role": "Plumbing Supervisor",
                "skills": ["Pipeline Retrofit", "Pressure Testing", "Client Handover"],
                "department": "Plumbing",
                "employmentType": "Full-time",
                "joiningDate": iso_date(-365),
                "wageType": "Daily",
                "wageAmount": 1450,
                "paymentFrequency": "Weekly",
                "bankAccountOrUpi": "priyakk@upi",
                "paymentMethod": "Bank Transfer",
                "status": "active",
                "attendance": 94,
                "notes": "Handled Lakeside retrofit closure.",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
        (
            "worker_ravi_carpentry",
            {
                "name": "Ravi S",
                "photoUrl": None,
                "dateOfBirth": "1991-12-06",
                "gender": "male",
                "phone": "9876500003",
                "email": "ravi.s@example.com",
                "emergencyContact": "Shobha S",
                "emergencyPhone": "9876501003",
                "role": "Carpentry Specialist",
                "skills": ["False Ceiling", "Wood Framing", "Finishing"],
                "department": "Interiors",
                "employmentType": "Contract",
                "joiningDate": iso_date(-280),
                "wageType": "Daily",
                "wageAmount": 1250,
                "paymentFrequency": "Weekly",
                "bankAccountOrUpi": "ravis@upi",
                "paymentMethod": "Cash",
                "status": "active",
                "attendance": 89,
                "notes": "Preferred for ceiling and trims.",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
        (
            "worker_meena_accounts",
            {
                "name": "Meena R",
                "photoUrl": None,
                "dateOfBirth": "1990-01-28",
                "gender": "female",
                "phone": "9876500004",
                "email": "meena.r@example.com",
                "emergencyContact": "Raman R",
                "emergencyPhone": "9876501004",
                "role": "Site Accounts Coordinator",
                "skills": ["Vendor Reconciliation", "Invoice Follow-up", "Expense Control"],
                "department": "Accounts",
                "employmentType": "Part-time",
                "joiningDate": iso_date(-210),
                "wageType": "Hourly",
                "wageAmount": 320,
                "paymentFrequency": "Monthly",
                "bankAccountOrUpi": "meenarr@upi",
                "paymentMethod": "Bank Transfer",
                "status": "active",
                "attendance": 92,
                "notes": "Tracks billing and outstanding amounts.",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        ),
    ]


def seed_core_entities(db) -> None:
    for pid, pdata in build_projects():
        upsert(db, "jobs", pid, pdata)

    for wid, wdata in build_workers():
        upsert(db, "workers", wid, wdata)
        upsert(
            db,
            "payment_profiles",
            f"payment_profile_{wid}",
            {
                "workforceId": wid,
                "workforceName": wdata["name"],
                "wageType": wdata["wageType"],
                "wageAmount": wdata["wageAmount"],
                "paymentFrequency": wdata["paymentFrequency"],
                "bankAccountOrUpi": wdata["bankAccountOrUpi"],
                "paymentMethod": wdata["paymentMethod"],
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        )


def seed_assignments(db) -> None:
    assignments = [
        ("assign_1", "job_greenvalley_tower_a", "worker_ajay_electrician", "Electrical Lead"),
        ("assign_2", "job_greenvalley_tower_a", "worker_meena_accounts", "Billing Oversight"),
        ("assign_3", "job_lakeside_villa_cluster", "worker_priya_plumbing", "Plumbing Lead"),
        ("assign_4", "job_orchid_commercial_block", "worker_ravi_carpentry", "Ceiling Specialist"),
    ]

    worker_names = {
        "worker_ajay_electrician": "Ajay N",
        "worker_meena_accounts": "Meena R",
        "worker_priya_plumbing": "Priya K",
        "worker_ravi_carpentry": "Ravi S",
    }

    project_names = {
        "job_greenvalley_tower_a": "Green Valley Tower A Electrical and Finishing",
        "job_lakeside_villa_cluster": "Lakeside Villa Cluster Plumbing Retrofit",
        "job_orchid_commercial_block": "Orchid Commercial Block False Ceiling and HVAC Prep",
    }

    for aid, project_id, worker_id, role in assignments:
        upsert(
            db,
            "project_assignments",
            aid,
            {
                "projectId": project_id,
                "assigneeId": worker_id,
                "assigneeName": worker_names[worker_id],
                "role": role,
                "projectTitle": project_names[project_id],
                "source": "dummy-seed",
                "ownerUid": OWNER_UID,
                "createdAt": NOW,
            },
        )


def seed_tasks(db) -> None:
    tasks = [
        (
            "task_1",
            {
                "workId": "job_greenvalley_tower_a",
                "name": "Main panel final wiring",
                "assignedWorkerId": "worker_ajay_electrician",
                "assignedWorkerName": "Ajay N",
                "status": "in-progress",
                "completedOn": None,
                "businessType": "contract",
            },
        ),
        (
            "task_2",
            {
                "workId": "job_greenvalley_tower_a",
                "name": "Client punch-list closure",
                "assignedWorkerId": "worker_meena_accounts",
                "assignedWorkerName": "Meena R",
                "status": "todo",
                "completedOn": None,
                "businessType": "contract",
            },
        ),
        (
            "task_3",
            {
                "workId": "job_lakeside_villa_cluster",
                "name": "Final leak pressure test",
                "assignedWorkerId": "worker_priya_plumbing",
                "assignedWorkerName": "Priya K",
                "status": "done",
                "completedOn": iso_date(-120),
                "businessType": "contract",
            },
        ),
        (
            "task_4",
            {
                "workId": "job_orchid_commercial_block",
                "name": "Material staging and ceiling grid markups",
                "assignedWorkerId": "worker_ravi_carpentry",
                "assignedWorkerName": "Ravi S",
                "status": "todo",
                "completedOn": None,
                "businessType": "contract",
            },
        ),
    ]

    for tid, data in tasks:
        upsert(db, "work_tasks", tid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})


def seed_transactions(db) -> None:
    txns = [
        (
            "txn_1",
            {
                "workId": "job_greenvalley_tower_a",
                "type": "income",
                "amount": 350000,
                "date": iso_date(-25),
                "mode": "Bank Transfer",
                "description": "Mobilization payment",
                "category": "contract-payment",
                "businessType": "contract",
            },
        ),
        (
            "txn_2",
            {
                "workId": "job_greenvalley_tower_a",
                "type": "expense",
                "amount": 52000,
                "date": iso_date(-18),
                "mode": "UPI",
                "description": "Electrical consumables batch-1",
                "category": "materials",
                "businessType": "contract",
            },
        ),
        (
            "txn_3",
            {
                "workId": "job_lakeside_villa_cluster",
                "type": "income",
                "amount": 760000,
                "date": iso_date(-112),
                "mode": "Bank Transfer",
                "description": "Final closure payment",
                "category": "contract-payment",
                "businessType": "contract",
            },
        ),
        (
            "txn_4",
            {
                "workId": "job_orchid_commercial_block",
                "type": "expense",
                "amount": 18500,
                "date": iso_date(-2),
                "mode": "Cash",
                "description": "Pre-mobilization site visit and permits",
                "category": "pre-mobilization",
                "businessType": "contract",
            },
        ),
    ]

    for txid, data in txns:
        upsert(db, "work_transactions", txid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})
        # Keep compatibility with screens still reading from `transactions`.
        upsert(db, "transactions", txid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})


def seed_materials(db) -> None:
    materials = [
        (
            "mat_1",
            {
                "workId": "job_greenvalley_tower_a",
                "name": "Copper wire 2.5 sqmm",
                "quantity": 40,
                "unitCost": 1450,
                "totalCost": 58000,
                "billNumber": "GV-ELE-114",
                "billDate": iso_date(-17),
                "billUrl": "https://example.com/bills/gv-ele-114.pdf",
                "billFileName": "gv-ele-114.pdf",
                "businessType": "contract",
            },
        ),
        (
            "mat_2",
            {
                "workId": "job_lakeside_villa_cluster",
                "name": "PVC piping set",
                "quantity": 26,
                "unitCost": 980,
                "totalCost": 25480,
                "billNumber": "LS-PLMB-072",
                "billDate": iso_date(-146),
                "billUrl": "https://example.com/bills/ls-plmb-072.pdf",
                "billFileName": "ls-plmb-072.pdf",
                "businessType": "contract",
            },
        ),
    ]

    for mid, data in materials:
        upsert(db, "material_bills", mid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})


def seed_travel_expenses(db) -> None:
    expenses = [
        (
            "trav_1",
            {
                "workId": "job_greenvalley_tower_a",
                "description": "Pickup and drop for electrical team",
                "cost": 3200,
                "date": iso_date(-10),
                "businessType": "contract",
            },
        ),
        (
            "trav_2",
            {
                "workId": "job_orchid_commercial_block",
                "description": "Client site inspection travel",
                "cost": 1850,
                "date": iso_date(-3),
                "businessType": "contract",
            },
        ),
    ]

    for eid, data in expenses:
        upsert(db, "travel_expenses", eid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})


def seed_invoices_and_notifications(db) -> None:
    invoices = [
        (
            "inv_1",
            {
                "workId": "job_greenvalley_tower_a",
                "model": "contract",
                "clientName": "Green Valley Developers",
                "invoiceDate": iso_date(-24),
                "dueDate": iso_date(6),
                "items": [{"description": "Mobilization stage", "quantity": 1, "rate": 350000}],
                "subtotal": 350000,
                "tax": 0,
                "total": 350000,
                "status": "pending",
            },
        ),
        (
            "inv_2",
            {
                "workId": "job_lakeside_villa_cluster",
                "model": "contract",
                "clientName": "Suryodaya Estates",
                "invoiceDate": iso_date(-118),
                "dueDate": iso_date(-112),
                "items": [{"description": "Final closure", "quantity": 1, "rate": 760000}],
                "subtotal": 760000,
                "tax": 0,
                "total": 760000,
                "status": "paid",
            },
        ),
    ]

    notifications = [
        (
            "notif_1",
            {
                "type": "project-created",
                "title": "Project created: Orchid Commercial Block False Ceiling and HVAC Prep",
                "projectId": "job_orchid_commercial_block",
                "targetClientName": "Orchid Business Parks",
                "status": "queued",
            },
        ),
        (
            "notif_2",
            {
                "type": "payment-followup",
                "title": "Follow up pending invoice for Green Valley Developers",
                "projectId": "job_greenvalley_tower_a",
                "status": "queued",
            },
        ),
    ]

    for iid, data in invoices:
        upsert(db, "invoices", iid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})

    for nid, data in notifications:
        upsert(db, "notifications", nid, {**data, "ownerUid": OWNER_UID, "createdAt": NOW})


def main() -> None:
    args = parse_args()

    init_firebase(args.service_account, args.project_id)
    db = get_db(args.database_id)

    ensure_auth_user(args.create_auth_user)

    seed_user_profile(db)
    seed_core_entities(db)
    seed_assignments(db)
    seed_tasks(db)
    seed_transactions(db)
    seed_materials(db)
    seed_travel_expenses(db)
    seed_invoices_and_notifications(db)

    print("Seed completed successfully.")
    print(f"Owner UID: {OWNER_UID}")
    print("Collections touched: users, jobs, workers, payment_profiles, project_assignments, work_tasks, work_transactions, transactions, material_bills, travel_expenses, invoices, notifications")


if __name__ == "__main__":
    main()
