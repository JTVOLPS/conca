"use server";

import { createNotification } from "@/lib/actions/notifications";

/**
 * Fire-and-forget notification helpers.
 * All calls are wrapped in try/catch so they never block the calling action.
 */

export async function notifyTaskAssigned(
  orgId: string,
  taskId: string,
  assigneeId: string,
  assignerName: string,
  taskTitle: string
) {
  try {
    await createNotification({
      orgId,
      userId: assigneeId,
      type: "task_assigned",
      title: `${assignerName} assigned you a task`,
      body: taskTitle,
      entityType: "task",
      entityId: taskId,
    });
  } catch {
    // fire-and-forget
  }
}

export async function notifyDealStageChanged(
  orgId: string,
  dealId: string,
  dealName: string,
  assignedToUserId: string,
  fromStage: string,
  toStage: string,
  changedByName: string
) {
  try {
    await createNotification({
      orgId,
      userId: assignedToUserId,
      type: "deal_stage_changed",
      title: `Deal "${dealName}" moved to ${toStage}`,
      body: `${changedByName} changed stage from ${fromStage} to ${toStage}`,
      entityType: "deal",
      entityId: dealId,
    });
  } catch {
    // fire-and-forget
  }
}

export async function notifyDocumentUploaded(
  orgId: string,
  recipientUserId: string,
  entityType: string,
  entityId: string,
  docName: string,
  uploaderName: string
) {
  try {
    await createNotification({
      orgId,
      userId: recipientUserId,
      type: "document_uploaded",
      title: `${uploaderName} uploaded a document`,
      body: docName,
      entityType,
      entityId,
    });
  } catch {
    // fire-and-forget
  }
}

export async function notifyCommitmentCreated(
  orgId: string,
  recipientUserId: string,
  dealId: string,
  investorName: string,
  amount: number,
  creatorName: string
) {
  try {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    await createNotification({
      orgId,
      userId: recipientUserId,
      type: "commitment_created",
      title: `New commitment from ${investorName}`,
      body: `${creatorName} recorded a ${formattedAmount} commitment`,
      entityType: "deal",
      entityId: dealId,
    });
  } catch {
    // fire-and-forget
  }
}
