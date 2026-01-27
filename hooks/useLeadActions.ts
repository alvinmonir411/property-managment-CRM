"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/app/lib/axios";

export type ActionType = "Call" | "Note" | "Stage Change" | "Reschedule" | "Complete" | "WhatsApp";

export interface ActionMetadata {
    note?: string;
    nextStage?: string;
    followUpDate?: string;
    [key: string]: any;
}

export function useLeadActions() {
    const [isActing, setIsActing] = useState(false);

    const executeAction = async (leadId: string, action: ActionType, metadata: ActionMetadata = {}) => {
        setIsActing(true);
        try {
            // 1. Client-Side Immediate Actions (e.g., opening window)
            if (action === "Call" && metadata.phone) {
                window.location.href = `tel:${metadata.phone}`;
            }
            if (action === "WhatsApp" && metadata.phone) {
                window.open(`https://wa.me/${metadata.phone}`, "_blank");
            }

            // 2. Server-Side Logging & Updates
            const payload = {
                leadId,
                action,
                note: metadata.note,
                metadata
            };

            await axiosInstance.post("/api/actions", payload);

            toast.success(`${action} logged successfully`);
            return true;

        } catch (error) {
            console.error(error);
            toast.error(`Failed to log ${action}`);
            return false;
        } finally {
            setIsActing(false);
        }
    };

    return {
        executeAction,
        isActing
    };
}
